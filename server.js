const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 4001);
const CACHE_TTL_MS = Number(process.env.SCMJF_CACHE_TTL_MS || 15 * 60 * 1000);
const MAX_PAGES = Number(process.env.SCMJF_MAX_PAGES || 0);
const MAX_CONCURRENCY = Number(process.env.SCMJF_MAX_CONCURRENCY || 8);
const FETCH_CONCURRENCY = Number(process.env.SCMJF_FETCH_CONCURRENCY || 12);
const CACHE_DIR = path.join(ROOT, ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "catalog.json");
const CACHE_KEY = JSON.stringify({
  maxPages: MAX_PAGES,
  searchVersion: 3
});

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

const MICROSOFT_HEADERS = {
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "pt-BR,pt;q=0.9,en;q=0.8"
};

const MICROSOFT_F3_URL = "https://www.microsoft.com/pt-br/microsoft-365/enterprise/f3";

let catalogCache = null;
let activeFetches = 0;
const fetchQueue = [];

const dynamicCategoryConfig = {
  cpu: {
    queries: [
      "processador ryzen",
      "processador amd",
      "processador intel",
      "intel i3 processador",
      "intel i5 processador",
      "intel i7 processador",
      "intel i9 processador",
      "core i3 processador",
      "core i5 processador",
      "core i7 processador",
      "core i9 processador"
    ],
    filter: isCpuProduct,
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
  if (!refresh && catalogCache && catalogCache.cacheKey === CACHE_KEY && now - catalogCache.createdAt < CACHE_TTL_MS) {
    return catalogCache.catalog;
  }

  if (!refresh) {
    const diskCache = await readDiskCatalogCache(now);
    if (diskCache) {
      catalogCache = diskCache;
      return diskCache.catalog;
    }
  }

  const startedAt = Date.now();
  const base = await loadStaticCatalog();
  const supplierStatus = {
    kabum: { label: "KaBuM!", status: "ok" },
    magalu: { label: "Magazine Luiza", status: "ok" },
    microsoft: { label: "Microsoft", status: "ok" }
  };

  const categoryTasks = base.categories.map((category) => async () => {
    if (category.id === "license") {
      return [category.id, await buildMicrosoftLicenseCategory(category, supplierStatus)];
    }

    const config = dynamicCategoryConfig[category.id];
    if (!config) {
      return [category.id, category];
    }

    const products = await searchCategory(config, supplierStatus);
    const items = mergeProducts(products)
      .filter(config.filter)
      .map((item) => config.enrich(item))
      .filter((item) => item.offers.length > 0)
      .sort(sortItemsByBestPrice);

    return [category.id, {
      ...category,
      items,
      defaultItem: items[0]?.id || category.defaultItem
    }];
  });

  const dynamicCategories = Object.fromEntries(await runLimited(categoryTasks));

  base.categories = base.categories.map((category) => dynamicCategories[category.id] || category);
  reconcileProfiles(base);
  base.metadata = {
    ...base.metadata,
    dynamic: true,
    generatedAt: new Date().toISOString(),
    cacheTtlMs: CACHE_TTL_MS,
    maxPagesPerSearch: MAX_PAGES > 0 ? MAX_PAGES : "all",
    generationMs: Date.now() - startedAt,
    fetchConcurrency: FETCH_CONCURRENCY,
    supplierStatus
  };

  catalogCache = { createdAt: now, cacheKey: CACHE_KEY, catalog: base };
  await writeDiskCatalogCache(catalogCache);
  return base;
}

async function loadStaticCatalog() {
  const source = await fs.readFile(path.join(ROOT, "data", "catalog.js"), "utf8");
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(source, context);
  return JSON.parse(JSON.stringify(context.window.SCMJF_PARTS_CATALOG));
}

async function readDiskCatalogCache(now) {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf8");
    const cached = JSON.parse(raw);
    if (!cached?.catalog || !cached.createdAt) return null;
    if (cached.cacheKey !== CACHE_KEY) return null;
    if (now - Number(cached.createdAt) > CACHE_TTL_MS) return null;
    return cached;
  } catch {
    return null;
  }
}

async function writeDiskCatalogCache(payload) {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(CACHE_FILE, JSON.stringify(payload), "utf8");
  } catch {
    // Cache em disco e uma otimização; falhas aqui nao devem quebrar a API.
  }
}

async function buildMicrosoftLicenseCategory(category, supplierStatus) {
  try {
    const pricing = await fetchMicrosoftF3Pricing();
    return {
      ...category,
      defaultItem: "os-windows-11-enterprise-e3",
      items: [
        microsoftWindowsItem("os-windows-10-enterprise-e3", "Windows 10 Enterprise E3", pricing),
        microsoftWindowsItem("os-windows-11-enterprise-e3", "Windows 11 Enterprise E3", pricing),
        ...(category.items || []).filter((item) => item.id === "os-none")
      ]
    };
  } catch (error) {
    supplierStatus.microsoft = { label: "Microsoft", status: "error", message: error.message };
    return category;
  }
}

async function fetchMicrosoftF3Pricing() {
  const html = await fetchText(MICROSOFT_F3_URL, MICROSOFT_HEADERS);
  const text = htmlToText(html);
  const match = text.match(/Microsoft 365 F3\s+R\$\s*([\d.,]+)\s+usu[aá]rio\/m[eê]s/i);
  if (!match) {
    throw new Error("Microsoft 365 F3 price not found");
  }

  return {
    price: parseBrazilianMoney(match[1]),
    checkedAt: new Date().toISOString(),
    sourceUrl: MICROSOFT_F3_URL
  };
}

function microsoftWindowsItem(id, name, pricing) {
  return {
    id,
    name,
    notes: "Preco oficial Microsoft 365 F3 em reais, usuario/mes, pago anualmente. Windows Enterprise E3 e licenciado por usuario.",
    offers: [
      {
        supplier: "microsoft",
        supplierLabel: "Microsoft",
        title: `${name} via Microsoft 365 F3`,
        price: pricing.price,
        availability: "usuario/mes, pago anualmente",
        url: pricing.sourceUrl,
        note: "Windows Enterprise E3 incluido no Microsoft 365 F3",
        checkedAt: pricing.checkedAt
      }
    ]
  };
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

  const pageTasks = [];
  for (let page = 2; page <= totalPages; page += 1) {
    pageTasks.push(() => fetchKabumPage(query, page).then((result) => result.products));
  }
  pages.push(...await runLimited(pageTasks));

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

  const pageTasks = [];
  for (let page = 2; page <= totalPages; page += 1) {
    pageTasks.push(() => fetchMagaluPage(query, page).then((result) => result.products));
  }
  pages.push(...await runLimited(pageTasks));

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
  return withFetchSlot(async () => {
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
  });
}

async function withFetchSlot(callback) {
  if (activeFetches >= FETCH_CONCURRENCY) {
    await new Promise((resolve) => fetchQueue.push(resolve));
  }

  activeFetches += 1;
  try {
    return await callback();
  } finally {
    activeFetches -= 1;
    const next = fetchQueue.shift();
    if (next) next();
  }
}

function extractNextData(html) {
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) {
    throw new Error("__NEXT_DATA__ not found");
  }
  return JSON.parse(match[1]);
}

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function parseBrazilianMoney(value) {
  const number = Number(String(value).replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(number)) {
    throw new Error(`Invalid Microsoft price: ${value}`);
  }
  return number;
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

function isCpuProduct(item) {
  const name = normalizeText(item.name);
  if (!/^processador\b/.test(name)) return false;
  if (!/(ryzen|amd|intel|core i[3579]|core ultra|pentium|celeron|athlon|xeon)/.test(name)) return false;
  if (/(cooler|water cooler|air cooler|adaptador|contact frame|suporte|kit|placa[- ]?mae|motherboard|notebook|computador|pc gamer|desktop completo)/.test(name)) return false;
  return bestPrice(item) >= 120;
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
