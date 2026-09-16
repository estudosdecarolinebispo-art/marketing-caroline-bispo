import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import pages from "../src/_data/pages.js";
import services from "../src/_data/services.js";
import site from "../src/_data/site.js";

const outputDir = path.resolve("_site");
const failures = [];
const canonicalOrigin = site.url;

const outputForUrl = (url) => {
  const clean = url.replace(/^\//, "");
  if (!clean) return "index.html";
  return clean.endsWith("/") ? `${clean}index.html` : clean;
};

const indexablePages = pages.indexable.map((page) => ({ ...page, output: outputForUrl(page.url) }));
const legalPages = ["privacy", "terms", "deletion"].map((key) => ({
  key,
  ...pages.entries[key],
  output: outputForUrl(pages.entries[key].url)
}));
const expectedHtml = [...indexablePages, ...legalPages].map((page) => page.output).sort();

const expectedFiles = [
  ...expectedHtml,
  "style.css",
  "legal.css",
  "script.js",
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
  "CNAME",
  ".nojekyll",
  "site.webmanifest",
  "favicon.ico",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "apple-touch-icon.png",
  "android-chrome-192x192.png",
  "android-chrome-512x512.png",
  "images/logo-caroline-bispo-localizacao.png",
  "images/caroline-bispo-perfil.png",
  "images/carolinebispo01.png",
  "images/og-caroline-bispo.png",
  "images/preview-compartilhamento-caroline-bispo-v2.png",
  ...[480, 800, 1200].flatMap((size) =>
    ["avif", "webp", "jpg"].map((extension) => `images/caroline-bispo-perfil-${size}.${extension}`)
  )
];

const fixedAssetHashes = {
  "legal.css": "fb7b14390a5eb0703a7797d19c6cfdecdee231022fe24a4e5e70dfbd38f14470",
  "script.js": "97bd9f075c52467d0c5132f16a3cce9e7be1e5f12dcfe8c08cda572ccf8e9698",
  "CNAME": "8ee7ec57dcf1bec44660005adf24a479e04a656eaeb0a7629a52ccc5e9c6beb2",
  "site.webmanifest": "6b7665d9b363645475aa03d3310831de3bafa1912d101008e030190b7c55149f"
};

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return readFileSync(path.join(outputDir, relativePath), "utf8");
}

function walk(directory, prefix = "") {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.posix.join(prefix, entry.name);
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolutePath, relativePath) : [relativePath];
  });
}

function hash(relativePath) {
  return createHash("sha256")
    .update(readFileSync(path.join(outputDir, relativePath)))
    .digest("hex");
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
  const meta = attributes(html, "meta").find((item) => item[selector] === value);
  return meta?.content;
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

function localTarget(page, reference) {
  const clean = reference.split(/[?#]/, 1)[0];
  if (!clean || /^(?:[a-z]+:|\/\/)/i.test(clean)) return null;
  const decoded = decodeURIComponent(clean);
  const relative = decoded.startsWith("/")
    ? decoded.slice(1)
    : path.posix.normalize(path.posix.join(path.posix.dirname(page), decoded));
  if (!relative) return "index.html";
  return relative.endsWith("/") ? `${relative}index.html` : relative;
}

function mainContent(html) {
  return html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? "";
}

function parseSchema(html, page) {
  const matches = [...html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  if (matches.length !== 1) {
    fail(`${page}: deve conter exatamente um bloco JSON-LD (encontrados ${matches.length})`);
    return null;
  }
  try {
    return JSON.parse(matches[0][1]);
  } catch (error) {
    fail(`${page}: JSON-LD inválido (${error.message})`);
    return null;
  }
}

function collectJsonIds(value, ids = [], references = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectJsonIds(item, ids, references);
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (key === "@id" && typeof item === "string") {
        if (Object.keys(value).length === 1) references.push(item);
        else ids.push(item);
      }
      collectJsonIds(item, ids, references);
    }
  }
  return { ids, references };
}

if (!existsSync(outputDir)) {
  fail("Diretório _site não existe; execute o build antes da validação.");
} else {
  for (const relativePath of expectedFiles) {
    if (!existsSync(path.join(outputDir, relativePath))) fail(`Arquivo ausente: ${relativePath}`);
  }

  const files = walk(outputDir);
  const htmlFiles = files.filter((file) => file.endsWith(".html")).sort();
  if (JSON.stringify(htmlFiles) !== JSON.stringify(expectedHtml)) {
    fail(`Conjunto inesperado de páginas HTML: ${htmlFiles.join(", ")}`);
  }

  const forbidden = files.filter((file) =>
    /(^|\/)(?:src|docs|scripts|node_modules|_includes|drafts)(\/|$)|(?:^|\/)package(?:-lock)?\.json$|(?:^|\/)\.gitkeep$|\.(?:njk|md)$/i.test(file)
  );
  if (forbidden.length) fail(`Arquivos-fonte ou rascunhos no artefato: ${forbidden.join(", ")}`);

  for (const [relativePath, expectedHash] of Object.entries(fixedAssetHashes)) {
    if (existsSync(path.join(outputDir, relativePath)) && hash(relativePath) !== expectedHash) {
      fail(`Integridade alterada em ${relativePath}`);
    }
  }

  const allPages = [...indexablePages, ...legalPages];
  const titleValues = [];
  const descriptionValues = [];

  for (const page of allPages) {
    if (!existsSync(path.join(outputDir, page.output))) continue;
    const html = read(page.output);
    const canonical = `${canonicalOrigin}${page.url}`;
    const isIndexable = indexablePages.some((item) => item.output === page.output);

    const idValues = [...html.matchAll(/\sid=(?:"([^"]+)"|'([^']+)')/gi)].map((match) => match[1] ?? match[2]);
    const duplicateIds = [...new Set(idValues.filter((id, index) => idValues.indexOf(id) !== index))];
    if (duplicateIds.length) fail(`${page.output}: IDs duplicados (${duplicateIds.join(", ")})`);

    const canonicalValue = attributes(html, "link").find((item) => item.rel === "canonical")?.href;
    if (canonicalValue !== canonical) fail(`${page.output}: canonical incorreta (${canonicalValue ?? "ausente"})`);

    const robots = metaContent(html, "name", "robots");
    const expectedRobots = isIndexable ? "index, follow, max-image-preview:large" : "noindex, follow";
    if (robots !== expectedRobots) fail(`${page.output}: meta robots incorreta (${robots ?? "ausente"})`);

    const describedby = attributes(html, "link").filter((item) => item.rel === "describedby");
    if (isIndexable && (describedby.length !== 1 || describedby[0].href !== "/llms.txt")) {
      fail(`${page.output}: relação describedby para /llms.txt ausente ou duplicada`);
    }
    if (!isIndexable && describedby.length) fail(`${page.output}: página legal não deve declarar describedby`);

    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? normalizedText(titleMatch[1]) : "";
    const description = metaContent(html, "name", "description") ?? "";
    if (title !== page.title) fail(`${page.output}: title inesperado (${title || "ausente"})`);
    if (description !== page.description) fail(`${page.output}: description inesperada`);

    if (isIndexable) {
      const analyticsMeta = attributes(html, "meta").filter((item) => item.name === "google-analytics-id");
      if (analyticsMeta.length !== 1 || analyticsMeta[0].content !== site.integrations.gaMeasurementId) {
        fail(`${page.output}: ID do Google Analytics ausente, incorreto ou duplicado`);
      }
      const staticGoogleTags = attributes(html, "script").filter((item) => /googletagmanager\.com|google-analytics\.com/i.test(item.src ?? ""));
      if (staticGoogleTags.length) fail(`${page.output}: Google tag não deve carregar antes do consentimento`);
      for (const consentId of ["cookie-banner", "cookie-analytics", "cookie-marketing", "cookie-reject", "cookie-save", "cookie-accept"]) {
        if (!idValues.includes(consentId)) fail(`${page.output}: controle de consentimento ausente (${consentId})`);
      }

      titleValues.push(title);
      descriptionValues.push(description);

      const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
      if (h1Matches.length !== 1) fail(`${page.output}: deve conter exatamente um H1`);
      else if (normalizedText(h1Matches[0][1]) !== page.h1) fail(`${page.output}: H1 diverge da arquitetura aprovada`);

      const socialExpectations = [
        ["property", "og:url", canonical],
        ["property", "og:title", page.title],
        ["property", "og:description", page.description],
        ["name", "twitter:title", page.title],
        ["name", "twitter:description", page.description]
      ];
      for (const [selector, name, expected] of socialExpectations) {
        if (metaContent(html, selector, name) !== expected) fail(`${page.output}: metadado ${name} incorreto`);
      }

      const breadcrumbCount = attributes(html, "nav").filter((item) => item.class?.split(/\s+/).includes("breadcrumbs")).length;
      if (page.key === "home" && breadcrumbCount !== 0) fail("index.html: home não deve exibir breadcrumb");
      if (page.key !== "home" && breadcrumbCount !== 1) fail(`${page.output}: breadcrumb visível ausente ou duplicado`);

      const schema = parseSchema(html, page.output);
      if (schema) {
        const graph = Array.isArray(schema["@graph"]) ? schema["@graph"] : [];
        const graphTypes = graph.map((item) => item["@type"]);
        for (const required of ["Person", "WebSite", "ImageObject"]) {
          if (!graphTypes.includes(required)) fail(`${page.output}: Schema ${required} ausente`);
        }
        const expectedPageType = page.key === "about" ? "ProfilePage" : page.key === "services" ? "CollectionPage" : page.key === "contact" ? "ContactPage" : "WebPage";
        if (!graphTypes.includes(expectedPageType)) fail(`${page.output}: Schema de página deveria ser ${expectedPageType}`);
        if (page.key !== "home" && !graphTypes.includes("BreadcrumbList")) fail(`${page.output}: BreadcrumbList ausente`);
        if (page.key === "home" && graphTypes.includes("BreadcrumbList")) fail("index.html: BreadcrumbList não é necessário na home");

        const serviceCount = graphTypes.filter((type) => type === "Service").length;
        if (services.order.includes(page.key) && serviceCount !== 1) fail(`${page.output}: deve conter um Service`);
        else if (page.key === "services" && serviceCount !== services.order.length) fail(`${page.output}: hub deve descrever os quatro Services`);
        else if (!services.order.includes(page.key) && page.key !== "services" && serviceCount !== 0) fail(`${page.output}: Service inesperado`);

        const person = graph.find((item) => item["@type"] === "Person");
        if (person?.["@id"] !== `${canonicalOrigin}/#caroline`) fail(`${page.output}: @id canônico de Person ausente`);
        for (const serviceNode of graph.filter((item) => item["@type"] === "Service")) {
          if (serviceNode.provider?.["@id"] !== `${canonicalOrigin}/#caroline`) fail(`${page.output}: provider de Service incorreto`);
        }

        const serialized = JSON.stringify(schema);
        for (const prohibited of ["LocalBusiness", "Organization", "Review", "AggregateRating", "Offer"]) {
          if (serialized.includes(`\"@type\":\"${prohibited}\"`)) fail(`${page.output}: tipo Schema não autorizado (${prohibited})`);
        }

        const { ids } = collectJsonIds(schema);
        const duplicateSchemaIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
        if (duplicateSchemaIds.length) fail(`${page.output}: @id duplicado no grafo (${duplicateSchemaIds.join(", ")})`);
      }

      if (!html.includes('id="cookie-banner"')) fail(`${page.output}: banner de consentimento ausente`);
    } else {
      if (attributes(html, "meta").some((item) => item.name === "google-analytics-id")) {
        fail(`${page.output}: página legal não deve carregar a integração do Google Analytics`);
      }
      if (/<script\s+type=["']application\/ld\+json["']/i.test(html)) fail(`${page.output}: página legal não deve emitir Schema editorial`);
    }

    for (const tag of ["a", "link", "script", "img", "source"]) {
      for (const item of attributes(html, tag)) {
        for (const key of ["href", "src"]) {
          if (!item[key]) continue;
          const target = localTarget(page.output, item[key]);
          if (target && !existsSync(path.join(outputDir, target))) fail(`${page.output}: referência local quebrada ${item[key]}`);
        }
        if (item.srcset) {
          for (const candidate of item.srcset.split(",")) {
            const reference = candidate.trim().split(/\s+/, 1)[0];
            const target = localTarget(page.output, reference);
            if (target && !existsSync(path.join(outputDir, target))) fail(`${page.output}: srcset quebrado ${reference}`);
          }
        }
      }
    }

    for (const anchor of attributes(html, "a")) {
      if (!anchor.href?.startsWith("#")) continue;
      const id = decodeURIComponent(anchor.href.slice(1));
      if (id && !idValues.includes(id)) fail(`${page.output}: âncora sem destino ${anchor.href}`);
    }
  }

  if (new Set(titleValues).size !== indexablePages.length) fail("Titles das páginas indexáveis não são únicos");
  if (new Set(descriptionValues).size !== indexablePages.length) fail("Meta descriptions das páginas indexáveis não são únicas");

  if (existsSync(path.join(outputDir, "script.js"))) {
    const clientScript = read("script.js");
    if (!clientScript.includes("https://www.googletagmanager.com/gtag/js?id=")) fail("script.js: loader oficial do Google tag ausente");
    if (!clientScript.includes("caroline_cookie_preferences_v2")) fail("script.js: armazenamento versionado das preferências ausente");
    if (!clientScript.includes("analytics_storage") || !clientScript.includes("ad_user_data") || !clientScript.includes("ad_personalization")) {
      fail("script.js: estados de consentimento do Google incompletos");
    }
    if (!clientScript.includes("window.__carolineGa4Configured")) fail("script.js: proteção contra configuração duplicada do GA4 ausente");
    if (!clientScript.includes("window.carolineDataLayer")) fail("script.js: fila interna deve permanecer separada do dataLayer do Google");
    if (/generate_lead/i.test(clientScript)) fail("script.js: generate_lead não deve existir antes de confirmação verificável do formulário");
    if (/GTM-[A-Z0-9]+/i.test(clientScript)) fail("script.js: Google Tag Manager não autorizado nesta fase");
  }

  const contentLinkRequirements = {
    "index.html": ["/servicos/", ...services.order.map((key) => services.items[key].url), "/sobre/", "/diagnostico-google-meu-negocio/", "/contato/"],
    "sobre/index.html": ["/servicos/", "/diagnostico-google-meu-negocio/", "/contato/"],
    "servicos/index.html": services.order.map((key) => services.items[key].url),
    "servicos/perfil-da-empresa-no-google/index.html": ["/diagnostico-google-meu-negocio/", services.items.seo.url, "/contato/"],
    "servicos/seo-local-google-maps/index.html": [services.items.profile.url, services.items.paid.url, "/contato/"],
    "servicos/gestao-trafego-pago/index.html": [services.items.automation.url, "/contato/"],
    "servicos/automacao-atendimento-whatsapp/index.html": [services.items.paid.url, "/contato/"],
    "diagnostico-google-meu-negocio/index.html": [services.items.profile.url, "/contato/"]
  };
  for (const [output, hrefs] of Object.entries(contentLinkRequirements)) {
    if (!existsSync(path.join(outputDir, output))) continue;
    const hrefValues = attributes(mainContent(read(output)), "a").map((item) => item.href);
    for (const href of hrefs) {
      if (!hrefValues.includes(href)) fail(`${output}: link editorial obrigatório ausente (${href})`);
    }
  }

  const diagnosticOutput = outputForUrl(pages.entries.diagnostic.url);
  if (existsSync(path.join(outputDir, diagnosticOutput))) {
    const diagnostic = read(diagnosticOutput);
    for (const id of ["conteudo", "lead-form", "form-status", "my-cal-inline-agendamentos", "cookie-banner"]) {
      if (!new RegExp(`\\sid=["']${id}["']`).test(diagnostic)) fail(`${diagnosticOutput}: ID obrigatório ausente (${id})`);
    }
    const form = attributes(diagnostic, "form").find((item) => item.id === "lead-form");
    const expectedAction = "https://script.google.com/macros/s/AKfycbwomYhy8axlmoPtJo7Ppt7IrPEMrlSif4cE_r97rzM8W2ejA_FzktZ0vVDl0UXMDEX-/exec";
    if (!form || form.method !== "post" || form.action !== expectedAction) fail(`${diagnosticOutput}: integração do formulário foi alterada`);
  }

  const contactOutput = outputForUrl(pages.entries.contact.url);
  if (existsSync(path.join(outputDir, contactOutput))) {
    const contact = read(contactOutput);
    for (const id of ["conteudo", "agendamento", "my-cal-inline-agendamentos", "cookie-banner"]) {
      if (!new RegExp(`\\sid=["']${id}["']`).test(contact)) fail(`${contactOutput}: ID obrigatório ausente (${id})`);
    }
  }

  if (existsSync(path.join(outputDir, "CNAME")) && read("CNAME").trim() !== "www.carolinebispo.com.br") {
    fail("CNAME não contém o domínio canônico aprovado");
  }

  if (existsSync(path.join(outputDir, "robots.txt"))) {
    const robots = read("robots.txt").replace(/\r\n/g, "\n").trim();
    const expected = "User-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nAllow: /\n\nSitemap: https://www.carolinebispo.com.br/sitemap.xml";
    if (robots !== expected) fail("robots.txt difere da versão aprovada");
  }

  if (existsSync(path.join(outputDir, "sitemap.xml"))) {
    const sitemap = read("sitemap.xml");
    const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
    const expectedLocations = indexablePages.map((page) => `${canonicalOrigin}${page.url}`);
    if (JSON.stringify(locations) !== JSON.stringify(expectedLocations)) fail("sitemap.xml não corresponde às nove páginas indexáveis aprovadas");
    if (/<(?:lastmod|changefreq|priority)>/i.test(sitemap)) fail("sitemap.xml contém metadados não aprovados");
  }

  if (existsSync(path.join(outputDir, "llms.txt"))) {
    const llms = read("llms.txt");
    if (!/^# Caroline Bispo\r?\n\r?\n> /i.test(llms)) fail("llms.txt não segue a estrutura H1 + resumo em bloco");
    const linkedUrls = [...llms.matchAll(/\]\((https:\/\/www\.carolinebispo\.com\.br\/[^)]*)\)/g)].map((match) => match[1]);
    const expectedLlmsUrls = [
      `${canonicalOrigin}/`,
      `${canonicalOrigin}/sobre/`,
      ...services.order.map((key) => `${canonicalOrigin}${services.items[key].url}`),
      `${canonicalOrigin}/diagnostico-google-meu-negocio/`,
      `${canonicalOrigin}/contato/`
    ];
    if (JSON.stringify(linkedUrls) !== JSON.stringify(expectedLlmsUrls)) fail("llms.txt deve apontar somente para as oito páginas solicitadas, na ordem editorial");
    if (/\]\([^)]*(?:politica-de-privacidade|termos-de-servico|exclusao-de-dados|resultados|cases|artigos|cidades)/i.test(llms)) {
      fail("llms.txt contém destinos fora do escopo da Fase 3");
    }
  }
}

if (failures.length) {
  console.error(`Validação falhou com ${failures.length} problema(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Validação estrutural concluída: ${expectedFiles.length} arquivos obrigatórios, ${indexablePages.length} páginas indexáveis, ${legalPages.length} páginas legais e integrações críticas preservadas.`);
