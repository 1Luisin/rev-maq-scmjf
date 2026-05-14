const path = require("node:path");

const root = path.resolve(__dirname, "..");
global.window = {};

function fakeElement(selector, dataset = {}) {
  return {
    selector,
    dataset,
    value: "",
    checked: false,
    disabled: false,
    _html: "",
    classList: {
      toggle() {}
    },
    closest() {
      return null;
    },
    set innerHTML(value) {
      this._html = String(value);
    },
    get innerHTML() {
      return this._html;
    }
  };
}

const elements = new Map();
elements.set("#app", fakeElement("#app"));

const handlers = {};

global.document = {
  addEventListener(type, handler) {
    handlers[type] = handler;
  },
  body: {
    appendChild() {}
  },
  createElement(tagName) {
    return fakeElement(tagName);
  },
  querySelector(selector) {
    if (!elements.has(selector)) {
      elements.set(selector, fakeElement(selector));
    }
    return elements.get(selector);
  },
  querySelectorAll(selector) {
    if (selector === ".nav-button") {
      return [
        fakeElement(".nav-button", { view: "inventory" }),
        fakeElement(".nav-button", { view: "builder" })
      ];
    }
    return [];
  }
};

global.URL = {
  createObjectURL() {
    return "blob:smoke-test";
  },
  revokeObjectURL() {}
};

require(path.join(root, "data", "inventory.js"));
require(path.join(root, "data", "catalog.js"));
require(path.join(root, "app.js"));

const appHtml = elements.get("#app").innerHTML;
const statsHtml = elements.get("#statsGrid").innerHTML;
const resultsHtml = elements.get("#inventoryResults").innerHTML;

if (!appHtml.includes("Inventário e triagem de troca")) {
  throw new Error("Inventory view was not rendered.");
}

if (!statsHtml.includes("Computadores únicos")) {
  throw new Error("Stats grid was not rendered.");
}

if (!resultsHtml.includes("32603_lab01")) {
  throw new Error("Inventory table did not render expected workbook data.");
}

handlers.click({
  target: {
    closest(selector) {
      return selector === "[data-view]" ? { dataset: { view: "builder" } } : null;
    }
  }
});

if (!elements.get("#app").innerHTML.includes("Peças, preços e custo por lote")) {
  throw new Error("Builder view was not rendered.");
}

if (!elements.get("#catalogRows").innerHTML.includes("Processador")) {
  throw new Error("Parts catalog was not rendered.");
}

if (!elements.get("#catalogRows").innerHTML.includes('data-cpu-vendor="intel"')) {
  throw new Error("CPU vendor filter was not rendered.");
}

if (!elements.get("#catalogRows").innerHTML.includes("part-search-input")) {
  throw new Error("Searchable part picker was not rendered.");
}

if (elements.get("#catalogRows").innerHTML.includes("data-price-override")) {
  throw new Error("Editable price override should not be rendered.");
}

if (elements.get("#catalogRows").innerHTML.includes("data-part-select")) {
  throw new Error("Native part select should not be rendered.");
}

if (!elements.get("#catalogRows").innerHTML.includes("KaBuM!")) {
  throw new Error("Allowed supplier offers were not rendered.");
}

if (!elements.get("#supplierCoverage").innerHTML.includes("Magazine Luiza")) {
  throw new Error("Supplier whitelist coverage was not rendered.");
}

const removedSupplier = ["Data", "for"].join("");
if (elements.get("#supplierCoverage").innerHTML.includes(removedSupplier)) {
  throw new Error("Supplier whitelist contains a removed supplier.");
}

console.log("Smoke test passed");
