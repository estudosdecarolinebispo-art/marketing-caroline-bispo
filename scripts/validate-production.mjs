import pages from "../src/_data/pages.js";
import site from "../src/_data/site.js";

const origin = (process.argv[2] || site.url).replace(/\/$/, "");
const failures = [];
const checks = [];

const indexablePages = pages.indexable;
const legalPages = ["privacy", "terms", "deletion"].map((key) => ({ key, ...pages.entries[key] }));
const htmlPages = [...indexablePages, ...legalPages];

function fail(message) {
  failures.push(message);
}

function pass(message) {
  checks.push(message);
}

function attributes(html, name) {
  const results = [];
  const pattern = new RegExp(`<${name}\\b([^>]*)>`, "gi");
  for (const match of html.matchAll(pattern)) {
    const values = {};
    for (const attribute of match[1].matchAll(/([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
      values[attribute[1].toLowerCase()] = attribute[2] ?? attribute[3] ?? attribute[4] ?? "";
    }
    results.push(values);
  }
  return results;
}

function metaContent(html, selector, value) {
  return attributes(html, "meta").find((item) => item[selector] === value)?.content;
}

function normalizedText(value) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function request(path, options = {}) {
  const url = `${origin}${path}`;
  let response;
  try {
    response = await fetch(url, {
      redirect: "follow",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
      signal: AbortSignal.timeout(20000),
      ...options
    });
  } catch (error) {
    fail(`${path}: falha de rede (${error.message})`);
    return null;
  }
  if (!response.ok) fail(`${path}: HTTP ${response.status}`);
  return response;
}

function parseSchema(html, path) {
  const blocks = [...html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  if (blocks.length !== 1) {
    fail(`${path}: esperado um bloco JSON-LD; encontrados ${blocks.length}`);
    return null;
  }
  try {
    return JSON.parse(blocks[0][1]);
  } catch (error) {
    fail(`${path}: JSON-LD inválido (${error.message})`);
    return null;
  }
}

for (const page of htmlPages) {
  const response = await request(page.url);
  if (!response) continue;
  const html = await response.text();
  const canonical = `${origin}${page.url}`;
  const indexable = indexablePages.some((item) => item.key === page.key);

  if (response.url !== canonical) fail(`${page.url}: URL final inesperada (${response.url})`);
  if (!response.headers.get("content-type")?.includes("text/html")) fail(`${page.url}: Content-Type não é HTML`);

  const title = normalizedText(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  if (title !== page.title) fail(`${page.url}: title divergente`);
  if (metaContent(html, "name", "description") !== page.description) fail(`${page.url}: description divergente`);

  const canonicalValue = attributes(html, "link").find((item) => item.rel === "canonical")?.href;
  if (canonicalValue !== canonical) fail(`${page.url}: canonical divergente (${canonicalValue ?? "ausente"})`);

  const expectedRobots = indexable ? "index, follow, max-image-preview:large" : "noindex, follow";
  if (metaContent(html, "name", "robots") !== expectedRobots) fail(`${page.url}: meta robots divergente`);

  if (indexable) {
    const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
    if (h1s.length !== 1 || normalizedText(h1s[0][1]) !== page.h1) fail(`${page.url}: H1 divergente ou duplicado`);
    if (metaContent(html, "property", "og:url") !== canonical) fail(`${page.url}: og:url divergente`);
    if (!attributes(html, "link").some((item) => item.rel === "describedby" && item.href === "/llms.txt")) {
      fail(`${page.url}: link describedby para /llms.txt ausente`);
    }
  }

  const schema = indexable ? parseSchema(html, page.url) : null;
  if (schema) {
    const graph = Array.isArray(schema["@graph"]) ? schema["@graph"] : [];
    const types = graph.flatMap((item) => Array.isArray(item["@type"]) ? item["@type"] : [item["@type"]]);
    for (const type of ["Person", "WebSite", "ImageObject"]) {
      if (!types.includes(type)) fail(`${page.url}: Schema ${type} ausente`);
    }
    if (page.key !== "home" && indexable && !types.includes("BreadcrumbList")) fail(`${page.url}: BreadcrumbList ausente`);
  }

  if (response.ok) pass(`${page.url} — HTTP ${response.status}, metadados${indexable ? " e Schema" : ""} válidos`);
}

const sitemapResponse = await request("/sitemap.xml");
if (sitemapResponse) {
  const sitemap = await sitemapResponse.text();
  if (!sitemapResponse.headers.get("content-type")?.includes("xml")) fail("/sitemap.xml: Content-Type não é XML");
  for (const page of indexablePages) {
    const loc = `<loc>${origin}${page.url}</loc>`;
    if (!sitemap.includes(loc)) fail(`/sitemap.xml: URL ausente (${page.url})`);
  }
  for (const page of legalPages) {
    if (sitemap.includes(`${origin}${page.url}`)) fail(`/sitemap.xml: página legal não deveria constar (${page.url})`);
  }
  pass("/sitemap.xml — nove URLs canônicas indexáveis");
}

const robotsResponse = await request("/robots.txt");
if (robotsResponse) {
  const robots = await robotsResponse.text();
  for (const expected of ["User-agent: OAI-SearchBot", "User-agent: GPTBot", "Sitemap: https://www.carolinebispo.com.br/sitemap.xml"]) {
    if (!robots.includes(expected)) fail(`/robots.txt: diretiva ausente (${expected})`);
  }
  pass("/robots.txt — regras e sitemap declarados");
}

const llmsResponse = await request("/llms.txt");
if (llmsResponse) {
  const llms = await llmsResponse.text();
  for (const page of indexablePages) {
    if (!llms.includes(`${origin}${page.url}`)) fail(`/llms.txt: URL ausente (${page.url})`);
  }
  pass("/llms.txt — páginas indexáveis declaradas");
}

for (const asset of ["/style.css", "/script.js", "/site.webmanifest", "/favicon.ico", "/CNAME"]) {
  const response = await request(asset);
  if (response) pass(`${asset} — HTTP ${response.status}`);
}

for (const check of checks) console.log(`✓ ${check}`);
if (failures.length) {
  for (const failure of failures) console.error(`✗ ${failure}`);
  console.error(`\nValidação de produção falhou com ${failures.length} problema(s).`);
  process.exitCode = 1;
} else {
  console.log(`\nValidação de produção concluída: ${checks.length} verificações sem falhas.`);
}
