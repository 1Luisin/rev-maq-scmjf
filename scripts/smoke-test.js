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
        fakeElement(".nav-button", { view: "builder" }),
        fakeElement(".nav-button", { view: "audit" })
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

if (!elements.get("#catalogRows").innerHTML.includes("Datafor")) {
  throw new Error("Allowed supplier offers were not rendered.");
}

if (!elements.get("#supplierCoverage").innerHTML.includes("VMPack")) {
  throw new Error("Supplier whitelist coverage was not rendered.");
}

handlers.click({
  target: {
    closest(selector) {
      return selector === "[data-view]" ? { dataset: { view: "audit" } } : null;
    }
  }
});

if (!elements.get("#app").innerHTML.includes("Servidores excluídos e duplicidades")) {
  throw new Error("Audit view was not rendered.");
}

console.log("Smoke test passed");
