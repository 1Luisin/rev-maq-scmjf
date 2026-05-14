const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 4001);
const CACHE_TTL_MS = Number(process.env.SCMJF_CACHE_TTL_MS || 15 * 60 * 1000);
const MAX_PAGES = Number(process.env.SCMJF_MAX_PAGES || 0);
const MAX_CONCURRENCY = Number(process.env.SCMJF_MAX_CONCURRENCY || 5);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
};

const KABUM_HEADERS = {
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "pt-BR,pt;q=0.9,en;q=0.8"
};

const MAGALU_HEADERS = {
  "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "pt-BR,pt;q=0.9,en;q=0.8"
};

let catalogCache = null;

const dynamicCategoryConfig = {
  cpu: {
    queries: ["processador ryzen", "processador amd", "processador intel", "processador intel core"],
    filter: (item) => /processador/i.test(item.name) && /(ryzen|intel|core|amd)/i.test(item.name),
    enrich: enrichCpu
  },
  motherboard: {
    queries: ["placa mae amd", "placa mae intel", "placa mae am4", "placa mae am5", "placa mae lga 1700", "placa mae lga 1200", "placa mae lga 1851", "placa mae ddr4", "placa mae ddr5"],
    filter: (item) => /(placa[- ]?m[aã]e|motherboard)/i.test(item.name),
    enrich: enrichMotherboard
  },
  memory: {
    queries: ["memoria ram ddr4 desktop", "memoria ram ddr5 desktop"],
    filter: (item) => /(mem[oó]ria|memory|ram)/i.test(item.name) && /ddr[45]/i.test(item.name),
    enrich: enrichMemory
  },
  storage: {
    queries: ["ssd nvme", "ssd m2", "ssd sata", "ssd 2.5"],
    filter: (item) => /ssd/i.test(item.name),
    enrich: enrichStorage
  },
  secondaryStorage: {
    queries: ["hd interno", "hd externo", "hard disk interno", "ssd sata"],
    filter: (item) => /(hd|disco r[ií]gido|ssd)/i.test(item.name),
    enrich: enrichStorage
  },
  psu: {
    queries: ["fonte pc", "fonte atx", "fonte 500w", "fonte 600w", "fonte 750w"],
    filter: (item) => /fonte/i.test(item.name) && /(atx|w|watts|80 plus|pfc)/i.test(item.name),
    enrich: enrichPowerSupply
  },
  case: {
    queries: ["gabinete pc", "gabinete gamer", "gabinete atx", "gabinete micro atx"],
    filter: (item) => /gabinete/i.test(item.name),
    enrich: enrichCase
  },
  cooler: {
    queries: ["cooler processador", "cooler cpu", "water cooler processador", "cooler lga1700", "cooler am4", "cooler am5"],
    filter: (item) => /(cooler|water cooler)/i.test(item.name) && !/notebook/i.test(item.name),
    enrich: enrichCooler
  }
};

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === "/api/catalog") {
      const refresh = url.searchParams.get("refresh") === "1";
      const catalog = await getDynamicCatalog(refresh);
      sendJson(res, catalog);
      return;
    }

    await serveStatic(url.pathname, res);
  } catch (error) {
    sendJson(res, { error: error.message }, 500);
  }
}).listen(PORT, () => {
  console.log(`Santa Casa TI app running at http://localhost:${PORT}`);
});

async function serveStatic(requestPath, res) {
  const cleanPath = decodeURIComponent(requestPath === "/" ? "/index.html" : requestPath);
  const filePath = path.resolve(ROOT, `.${cleanPath}`);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  const content = await fs.readFile(filePath);
  res.writeHead(200, { "content-type": MIME[path.extname(filePath)] || "application/octet-stream" });
  res.end(content);
}

function sendJson(res, payload, status = 200) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

async function getDynamicCatalog(refresh) {
  const now = Date.now();
  if (!refresh && catalogCache && now - catalogCache.createdAt < CACHE_TTL_MS) {
    return catalogCache.catalog;
  }

  const base = await loadStaticCatalog();
  const supplierStatus = {
    kabum: { label: "KaBuM!", status: "ok" },
    magalu: { label: "Magazine Luiza", status: "ok" }
  };

  const dynamicCategories = {};
  for (const category of base.categories) {
    const config = dynamicCategoryConfig[category.id];
    if (!config) {
      dynamicCategories[category.id] = category;
      continue;
    }

    const products = await searchCategory(config, supplierStatus);
    const items = mergeProducts(products)
      .filter(config.filter)
      .map((item) => config.enrich(item))
      .filter((item) => item.offers.length > 0)
      .sort(sortItemsByBestPrice);

    dynamicCategories[category.id] = {
      ...category,
      items,
      defaultItem: items[0]?.id || category.defaultItem
    };
  }

  base.categories = base.categories.map((category) => dynamicCategories[category.id] || category);
  reconcileProfiles(base);
  base.metadata = {
    ...base.metadata,
    dynamic: true,
    generatedAt: new Date().toISOString(),
    cacheTtlMs: CACHE_TTL_MS,
    maxPagesPerSearch: MAX_PAGES > 0 ? MAX_PAGES : "all",
    supplierStatus
  };

  catalogCache = { createdAt: now, catalog: base };
  return base;
}

async function loadStaticCatalog() {
  const source = await fs.readFile(path.join(ROOT, "data", "catalog.js"), "utf8");
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(source, context);
  return JSON.parse(JSON.stringify(context.window.SCMJF_PARTS_CATALOG));
}

async function searchCategory(config, supplierStatus) {
  const tasks = [];
  for (const query of config.queries) {
    tasks.push(() => searchKabum(query).catch((error) => {
      supplierStatus.kabum = { label: "KaBuM!", status: "error", message: error.message };
      return [];
    }));
    tasks.push(() => searchMagalu(query).catch((error) => {
      supplierStatus.magalu = { label: "Magazine Luiza", status: "error", message: error.message };
      return [];
    }));
  }

  return (await runLimited(tasks)).flat();
}

async function runLimited(tasks) {
  const results = [];
  let index = 0;
  const workers = Array.from({ length: Math.min(MAX_CONCURRENCY, tasks.length) }, async () => {
    while (index < tasks.length) {
      const current = tasks[index++];
      results.push(await current());
    }
  });
  await Promise.all(workers);
  return results;
}

function getPageLimit(totalPages) {
  const pages = Math.max(1, Number(totalPages) || 1);
  return MAX_PAGES > 0 ? Math.min(pages, MAX_PAGES) : pages;
}

async function searchKabum(query) {
  const first = await fetchKabumPage(query, 1);
  const totalPages = getPageLimit(first.totalPages || 1);
  const pages = [first.products];

  for (let page = 2; page <= totalPages; page += 1) {
    pages.push((await fetchKabumPage(query, page)).products);
  }

  return pages.flat();
}

async function fetchKabumPage(query, page) {
  const slug = query.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const url = `https://www.kabum.com.br/busca/${slug}?page_number=${page}&page_size=60`;
  const html = await fetchText(url, KABUM_HEADERS);
  const data = extractNextData(html);
  const catalog = data.props?.pageProps?.data?.catalogServer;
  const products = (catalog?.data || [])
    .filter((product) => product.available !== false)
    .map((product) => ({
      id: `kabum-${product.code}`,
      sourceKey: `kabum-${product.code}`,
      supplier: "kabum",
      supplierLabel: "KaBuM!",
      name: product.name,
      title: product.name,
      price: Number(product.priceWithDiscount || product.price || product.oldPrice || 0),
      availability: "Em estoque",
      url: `https://www.kabum.com.br/produto/${product.code}/${product.friendlyName || ""}`,
      seller: product.sellerName || "KaBuM!",
      brand: product.manufacturer?.name || "",
      checkedAt: new Date().toISOString()
    }));

  return {
    totalPages: catalog?.pagination?.total || catalog?.meta?.totalPagesCount || 1,
    products
  };
}

async function searchMagalu(query) {
  const first = await fetchMagaluPage(query, 1);
  const totalPages = getPageLimit(first.totalPages || 1);
  const pages = [first.products];

  for (let page = 2; page <= totalPages; page += 1) {
    pages.push((await fetchMagaluPage(query, page)).products);
  }

  return pages.flat();
}

async function fetchMagaluPage(query, page) {
  const term = query.trim().replace(/\s+/g, "+");
  const pageQuery = page > 1 ? `?page=${page}` : "";
  const url = `https://m.magazineluiza.com.br/busca/${term}/${pageQuery}`;
  const html = await fetchText(url, MAGALU_HEADERS);
  const data = extractNextData(html);
  const search = data.props?.pageProps?.data?.search;
  if (!search) {
    throw new Error("Magalu search data not found");
  }

  const products = (search.products || [])
    .filter((product) => product.available !== false)
    .map((product) => ({
      id: `magalu-${product.id}`,
      sourceKey: `magalu-${product.id}-${product.seller?.id || ""}`,
      supplier: "magalu",
      supplierLabel: "Magazine Luiza",
      name: product.title,
      title: product.title,
      price: Number(product.price?.bestPrice || product.price?.fullPrice || product.price?.price || 0),
      availability: "Disponivel",
      url: `https://www.magazineluiza.com.br${product.path || ""}`,
      seller: product.seller?.description || "Magazine Luiza",
      brand: product.brand?.label || "",
      checkedAt: new Date().toISOString()
    }));

  return {
    totalPages: search.pagination?.pages || 1,
    products
  };
}

async function fetchText(url, headers) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function extractNextData(html) {
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) {
    throw new Error("__NEXT_DATA__ not found");
  }
  return JSON.parse(match[1]);
}

function mergeProducts(products) {
  const map = new Map();
  for (const product of products) {
    if (!product.name || !product.price) continue;
    const key = normalizeProductKey(product.name);
    if (!map.has(key)) {
      map.set(key, {
        id: key,
        name: product.name,
        notes: "",
        offers: []
      });
    }

    const item = map.get(key);
    if (!item.offers.some((offer) => offer.url === product.url)) {
      item.offers.push({
        supplier: product.supplier,
        supplierLabel: product.supplierLabel,
        title: product.title,
        price: product.price,
        availability: product.availability,
        url: product.url,
        note: product.seller ? `Vendido por ${product.seller}` : "",
        checkedAt: product.checkedAt
      });
    }
  }
  return [...map.values()];
}

function normalizeProductKey(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function enrichCpu(item) {
  const socket = inferCpuSocket(item.name);
  return {
    ...item,
    compatibility: {
      vendor: /ryzen|amd/i.test(item.name) ? "amd" : "intel",
      socket
    }
  };
}

function enrichMotherboard(item) {
  const socket = inferSocket(item.name);
  return {
    ...item,
    compatibility: {
      socket,
      memoryType: inferMemoryType(item.name) || (socket === "AM5" ? "DDR5" : socket === "LGA1200" ? "DDR4" : "")
    }
  };
}

function enrichMemory(item) {
  return {
    ...item,
    compatibility: {
      memoryType: inferMemoryType(item.name)
    }
  };
}

function enrichStorage(item) {
  return {
    ...item,
    compatibility: {
      storageType: /nvme|m\.?2/i.test(item.name) ? "nvme" : /ssd/i.test(item.name) ? "ssd" : "hd"
    }
  };
}

function enrichPowerSupply(item) {
  const watts = Number((item.name.match(/(\d{3,4})\s?w/i) || [])[1] || 0);
  return {
    ...item,
    compatibility: { watts }
  };
}

function enrichCase(item) {
  return {
    ...item,
    compatibility: {}
  };
}

function enrichCooler(item) {
  return {
    ...item,
    compatibility: {
      sockets: inferCoolerSockets(item.name)
    }
  };
}

function inferCpuSocket(name) {
  const explicit = inferSocket(name);
  if (explicit) return explicit;

  const intelModel = name.match(/\bi[3579][- ]?(\d{4,5})/i);
  if (intelModel) {
    const model = Number(intelModel[1]);
    const generation = model >= 10000 ? Number(String(model).slice(0, 2)) : Number(String(model).slice(0, 1));
    if (generation >= 12 && generation <= 14) return "LGA1700";
    if (generation === 10 || generation === 11) return "LGA1200";
    if (generation === 8 || generation === 9) return "LGA1151";
  }

  if (/core ultra/i.test(name)) return "LGA1851";
  if (/ryzen\s+[3579]\s+[789]\d{3}/i.test(name)) return "AM5";
  if (/ryzen/i.test(name)) return "AM4";
  return "";
}

function inferSocket(name) {
  const text = normalizeText(name).toUpperCase();
  const compact = text.replace(/[^A-Z0-9]/g, "");
  const lga = compact.match(/LGA(\d{4})/);
  if (lga) return `LGA${lga[1]}`;

  for (const socket of ["AM4", "AM5", "TR4", "STR5"]) {
    if (new RegExp(`(^|[^A-Z0-9])${socket}([^A-Z0-9]|$)`).test(text)) {
      return socket;
    }
  }

  if (/(A320|A520|B350|B450|B550|X370|X470|X570)/.test(compact)) return "AM4";
  if (/(A620|B650E?|B850|X670E?|X870E?)/.test(compact)) return "AM5";
  if (/(H610|B660|H670|Z690|B760|H770|Z790)/.test(compact)) return "LGA1700";
  if (/(H410|B460|H470|Z490|H510|B560|H570|Z590)/.test(compact)) return "LGA1200";
  if (/(H810|B860|H870|Z890)/.test(compact)) return "LGA1851";
  return "";
}

function inferMemoryType(name) {
  const normalized = name.toUpperCase();
  if (/DDR5/.test(normalized)) return "DDR5";
  if (/DDR4/.test(normalized)) return "DDR4";
  if (/DDR3/.test(normalized)) return "DDR3";
  return "";
}

function inferCoolerSockets(name) {
  const sockets = new Set();
  for (const socket of ["AM4", "AM5", "LGA1700", "LGA1200", "LGA1151", "LGA1851"]) {
    if (name.toUpperCase().replace(/\s+/g, "").includes(socket)) {
      sockets.add(socket);
    }
  }
  return [...sockets];
}

function sortItemsByBestPrice(a, b) {
  return bestPrice(a) - bestPrice(b);
}

function bestPrice(item) {
  return Math.min(...item.offers.map((offer) => Number(offer.price || Number.POSITIVE_INFINITY)));
}

function reconcileProfiles(catalog) {
  const byCategory = Object.fromEntries(catalog.categories.map((category) => [category.id, category]));
  for (const profile of catalog.profiles || []) {
    for (const [categoryId, selectedId] of Object.entries(profile.selections || {})) {
      const category = byCategory[categoryId];
      if (!category?.items?.some((item) => item.id === selectedId)) {
        profile.selections[categoryId] = category?.items?.[0]?.id || null;
      }
    }
  }
}
