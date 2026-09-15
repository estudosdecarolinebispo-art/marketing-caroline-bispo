import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const baselineDir = process.argv[2] ? path.resolve(process.argv[2]) : null;
const candidateDir = process.argv[3] ? path.resolve(process.argv[3]) : path.resolve("_site");
const pages = ["index.html", "politica-de-privacidade.html", "termos-de-servico.html", "exclusao-de-dados.html"];
const differences = [];

if (!baselineDir || !existsSync(baselineDir)) {
  console.error("Uso: node scripts/compare-phase1.mjs <diretório-base> [diretório-gerado]");
  process.exit(2);
}

function decode(value = "") {
  const named = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (_, entity) => {
    if (entity[0] === "#") {
      const radix = entity[1].toLowerCase() === "x" ? 16 : 10;
      const digits = radix === 16 ? entity.slice(2) : entity.slice(1);
      return String.fromCodePoint(Number.parseInt(digits, radix));
    }
    return named[entity.toLowerCase()] ?? `&${entity};`;
  });
}

function attrs(fragment) {
  const values = {};
  for (const match of fragment.matchAll(/([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    values[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return values;
}

function elements(html, tag) {
  const pattern = new RegExp(`<${tag}\\b([^>]*)>`, "gi");
  return [...html.matchAll(pattern)].map((match) => attrs(match[1]));
}

function text(html) {
  return decode(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--([\s\S]*?)-->/g, " ")
      .replace(/<[^>]+>/g, " ")
  ).replace(/\s+/g, " ").trim();
}

function innerText(html, tag) {
  const pattern = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  return [...html.matchAll(pattern)].map((match) => text(match[1]));
}

function selectAttributes(html, tag, keys) {
  return elements(html, tag).map((item) => Object.fromEntries(keys.filter((key) => key in item).map((key) => [key, item[key]])));
}

function schema(html) {
  const match = html.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i);
  return match ? JSON.parse(match[1]) : null;
}

function snapshot(html) {
  return {
    lang: elements(html, "html")[0]?.lang,
    title: innerText(html, "title")[0],
    text: text(html),
    headings: ["h1", "h2", "h3", "h4"].flatMap((tag) => innerText(html, tag).map((value) => [tag, value])),
    meta: selectAttributes(html, "meta", ["name", "property", "content"]),
    links: selectAttributes(html, "a", ["id", "class", "href", "target", "rel", "aria-label"]),
    stylesheets: selectAttributes(html, "link", ["rel", "href", "type", "sizes"]),
    scripts: selectAttributes(html, "script", ["src", "type", "defer", "async"]),
    images: selectAttributes(html, "img", ["src", "srcset", "sizes", "alt", "width", "height", "loading", "decoding"]),
    sources: selectAttributes(html, "source", ["srcset", "type", "media"]),
    forms: selectAttributes(html, "form", ["id", "action", "method"]),
    inputs: selectAttributes(html, "input", ["id", "name", "type", "value", "required", "maxlength", "autocomplete", "inputmode", "tabindex"]),
    textareas: selectAttributes(html, "textarea", ["id", "name", "rows", "required", "maxlength"]),
    controls: selectAttributes(html, "button", ["id", "class", "type", "aria-label", "aria-controls", "aria-expanded"]),
    accessibility: [...html.matchAll(/<(\w+)\b([^>]*)>/g)].map((match) => {
      const item = attrs(match[2]);
      const selected = Object.fromEntries(Object.entries(item).filter(([key]) => key === "id" || key === "role" || key === "tabindex" || key.startsWith("aria-")));
      return Object.keys(selected).length ? [match[1].toLowerCase(), selected] : null;
    }).filter(Boolean),
    schema: schema(html)
  };
}

for (const page of pages) {
  const baselinePath = path.join(baselineDir, page);
  const candidatePath = path.join(candidateDir, page);
  if (!existsSync(baselinePath) || !existsSync(candidatePath)) {
    differences.push(`${page}: arquivo ausente em uma das versões`);
    continue;
  }
  const before = snapshot(readFileSync(baselinePath, "utf8"));
  const after = snapshot(readFileSync(candidatePath, "utf8"));
  for (const key of Object.keys(before)) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      if (Array.isArray(before[key]) && Array.isArray(after[key])) {
        const index = Math.max(0, before[key].findIndex((value, itemIndex) => JSON.stringify(value) !== JSON.stringify(after[key][itemIndex])));
        differences.push(`${page}: diferença em ${key}[${index}] (${JSON.stringify(before[key][index])} -> ${JSON.stringify(after[key][index])})`);
      } else {
        differences.push(`${page}: diferença em ${key}`);
      }
    }
  }
}

if (differences.length) {
  console.error(`Paridade semântica falhou com ${differences.length} diferença(s):`);
  for (const difference of differences) console.error(`- ${difference}`);
  process.exit(1);
}

console.log("Paridade semântica confirmada nas 4 páginas: texto, metadados, links, formulários, imagens, acessibilidade e Schema preservados.");
