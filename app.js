(function () {
  "use strict";

  const inventory = window.SCMJF_INVENTORY;
  const catalog = window.SCMJF_PARTS_CATALOG;
  const app = document.querySelector("#app");

  if (!inventory || !catalog) {
    app.innerHTML = '<section class="empty-state">Dados não encontrados. Verifique os arquivos em <code>data/</code>.</section>';
    return;
  }

  const rows = inventory.sheets.Inventario_Classificado || [];
  const categories = catalog.categories || [];
  const categoryById = Object.fromEntries(categories.map((category) => [category.id, category]));
  const profiles = catalog.profiles || [];
  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const integer = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
  const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

  const minimumProfiles = [
    {
      id: "original",
      label: "Corte original da planilha",
      ramGb: 4,
      cpuMhz: 0,
      windowsMajor: 10
    },
    {
      id: "operational",
      label: "Mínimo operacional",
      ramGb: 8,
      cpuMhz: 2500,
      windowsMajor: 10
    },
    {
      id: "recommended",
      label: "Padrão Santa Casa recomendado",
      ramGb: 16,
      cpuMhz: 3000,
      windowsMajor: 11
    }
  ];

  const state = {
    view: "inventory",
    page: 1,
    pageSize: 28,
    minimumProfile: "operational",
    minimum: {
      ramGb: 8,
      cpuMhz: 2500,
      windowsMajor: 10
    },
    filters: {
      search: "",
      status: "below-min",
      os: "all",
      includeServers: false
    },
    build: {
      profile: "base",
      quantityMode: "belowMinimum",
      manualQuantity: Number(inventory.summary.priorityBreakdown?.[0]?.quantity || 48),
      contingency: 8,
      laborPerUnit: 0,
      included: {},
      selections: {},
      priceOverrides: {},
      partSearch: ""
    }
  };

  applyBuildProfile("base");

  document.addEventListener("click", handleClick);
  document.addEventListener("change", handleChange);
  document.addEventListener("input", handleInput);

  render();

  function handleClick(event) {
    const navButton = event.target.closest("[data-view]");
    if (navButton) {
      state.view = navButton.dataset.view;
      state.page = 1;
      render();
      return;
    }

    const pageButton = event.target.closest("[data-page]");
    if (pageButton) {
      const nextPage = Number(pageButton.dataset.page);
      if (Number.isFinite(nextPage)) {
        state.page = nextPage;
        renderInventoryResults();
      }
      return;
    }

    if (event.target.closest("[data-export-inventory]")) {
      exportInventoryCsv();
      return;
    }

    if (event.target.closest("[data-export-budget]")) {
      exportBudgetCsv();
    }
  }

  function handleChange(event) {
    const target = event.target;

    if (target.id === "minimumProfile") {
      const profile = minimumProfiles.find((item) => item.id === target.value);
      if (profile) {
        state.minimumProfile = profile.id;
        state.minimum = {
          ramGb: profile.ramGb,
          cpuMhz: profile.cpuMhz,
          windowsMajor: profile.windowsMajor
        };
        state.page = 1;
        renderInventoryView();
      }
      return;
    }

    if (target.id === "statusFilter") {
      state.filters.status = target.value;
      state.page = 1;
      renderInventoryResults();
      renderBuildSummary();
      return;
    }

    if (target.id === "osFilter") {
      state.filters.os = target.value;
      state.page = 1;
      renderInventoryResults();
      renderBuildSummary();
      return;
    }

    if (target.id === "includeServers") {
      state.filters.includeServers = target.checked;
      state.page = 1;
      renderInventoryResults();
      return;
    }

    if (target.id === "buildProfile") {
      applyBuildProfile(target.value);
      renderBuilderView();
      return;
    }

    if (target.id === "quantityMode") {
      state.build.quantityMode = target.value;
      renderBuildSummary();
      return;
    }

    if (target.dataset.partSelect) {
      const categoryId = target.dataset.partSelect;
      state.build.selections[categoryId] = target.value;
      delete state.build.priceOverrides[categoryId];
      renderCatalogRows();
      renderBuildSummary();
      return;
    }

    if (target.dataset.partInclude) {
      const categoryId = target.dataset.partInclude;
      state.build.included[categoryId] = target.checked;
      renderCatalogRows();
      renderBuildSummary();
    }
  }

  function handleInput(event) {
    const target = event.target;

    if (target.id === "inventorySearch") {
      state.filters.search = target.value;
      state.page = 1;
      renderInventoryResults();
      renderBuildSummary();
      return;
    }

    if (target.id === "minRam") {
      state.minimum.ramGb = numberFromInput(target.value, 0);
      state.minimumProfile = "custom";
      state.page = 1;
      syncMinimumLabels();
      renderInventoryResults();
      renderBuildSummary();
      return;
    }

    if (target.id === "minCpu") {
      state.minimum.cpuMhz = numberFromInput(target.value, 0);
      state.minimumProfile = "custom";
      state.page = 1;
      syncMinimumLabels();
      renderInventoryResults();
      renderBuildSummary();
      return;
    }

    if (target.id === "minWindows") {
      state.minimum.windowsMajor = numberFromInput(target.value, 0);
      state.minimumProfile = "custom";
      state.page = 1;
      syncMinimumLabels();
      renderInventoryResults();
      renderBuildSummary();
      return;
    }

    if (target.id === "manualQuantity") {
      state.build.manualQuantity = Math.max(0, Math.round(numberFromInput(target.value, 0)));
      renderBuildSummary();
      return;
    }

    if (target.id === "contingency") {
      state.build.contingency = Math.max(0, numberFromInput(target.value, 0));
      renderBuildSummary();
      return;
    }

    if (target.id === "laborPerUnit") {
      state.build.laborPerUnit = Math.max(0, numberFromInput(target.value, 0));
      renderBuildSummary();
      return;
    }

    if (target.id === "partSearch") {
      state.build.partSearch = target.value;
      renderSearchLinks();
      return;
    }

    if (target.dataset.priceOverride) {
      const categoryId = target.dataset.priceOverride;
      state.build.priceOverrides[categoryId] = Math.max(0, numberFromInput(target.value, 0));
      renderBuildSummary();
    }
  }

  function render() {
    document.querySelectorAll(".nav-button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.view === state.view);
    });

    if (state.view === "builder") {
      renderBuilderView();
      return;
    }

    renderInventoryView();
  }

  function renderInventoryView() {
    const osOptions = getOsOptions();
    app.innerHTML = `
      <section class="section-stack">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Gestão de TI</p>
            <h1>Inventário e triagem de troca</h1>
          </div>
          <div class="heading-actions">
            <a class="button button-muted" href="triagem_troca_computadores_santa_casa.xlsx">Planilha fonte</a>
            <button class="button button-primary" type="button" data-export-inventory>Exportar CSV</button>
          </div>
        </div>

        <div id="statsGrid" class="stats-grid"></div>

        <div class="workbench">
          <aside class="control-panel">
            <div class="panel-title">
              <span class="panel-mark"></span>
              <h2>Mínimo de hardware</h2>
            </div>

            <label class="field">
              <span>Perfil</span>
              <select id="minimumProfile">
                ${minimumProfiles.map((profile) => `<option value="${profile.id}" ${profile.id === state.minimumProfile ? "selected" : ""}>${escapeHtml(profile.label)}</option>`).join("")}
                <option value="custom" ${state.minimumProfile === "custom" ? "selected" : ""}>Personalizado</option>
              </select>
            </label>

            <div class="field-grid">
              <label class="field">
                <span>RAM mínima</span>
                <input id="minRam" type="number" min="0" step="1" value="${state.minimum.ramGb}">
              </label>
              <label class="field">
                <span>CPU mínima MHz</span>
                <input id="minCpu" type="number" min="0" step="100" value="${state.minimum.cpuMhz}">
              </label>
              <label class="field">
                <span>Windows mínimo</span>
                <input id="minWindows" type="number" min="0" step="1" value="${state.minimum.windowsMajor}">
              </label>
            </div>

            <div id="minimumDigest" class="digest"></div>

            <div class="filter-block">
              <h3>Filtros</h3>
              <label class="field">
                <span>Buscar</span>
                <input id="inventorySearch" type="search" placeholder="Computador, usuário, SO, TAG" value="${escapeAttr(state.filters.search)}">
              </label>
              <label class="field">
                <span>Situação</span>
                <select id="statusFilter">
                  ${statusOptions().map((option) => `<option value="${option.value}" ${option.value === state.filters.status ? "selected" : ""}>${option.label}</option>`).join("")}
                </select>
              </label>
              <label class="field">
                <span>Sistema operacional</span>
                <select id="osFilter">
                  <option value="all">Todos</option>
                  ${osOptions.map((os) => `<option value="${escapeAttr(os)}" ${os === state.filters.os ? "selected" : ""}>${escapeHtml(os)}</option>`).join("")}
                </select>
              </label>
              <label class="check-line">
                <input id="includeServers" type="checkbox" ${state.filters.includeServers ? "checked" : ""}>
                <span>Incluir servidores</span>
              </label>
            </div>
          </aside>

          <section class="results-panel">
            <div id="inventoryResults"></div>
          </section>
        </div>

        <div class="charts-grid">
          <section class="chart-panel">
            <h2>Sistemas operacionais</h2>
            <div id="osChart"></div>
          </section>
          <section class="chart-panel">
            <h2>Faixas de RAM</h2>
            <div id="ramChart"></div>
          </section>
        </div>
      </section>
    `;

    syncMinimumLabels();
    renderInventoryResults();
    renderStats();
    renderDistribution("#osChart", inventory.summary.osDistribution || []);
    renderDistribution("#ramChart", inventory.summary.ramDistribution || []);
  }

  function renderStats() {
    const stats = getInventoryStats();
    const unitCost = getBuildUnitTotal();
    const totalForBelow = stats.belowMinimum * unitCost;
    const selectedOriginal = stats.immediate + stats.recommendedAdditional;

    document.querySelector("#statsGrid").innerHTML = [
      statCard("Computadores únicos", rows.length, "Após consolidação da planilha"),
      statCard("Abaixo do mínimo", stats.belowMinimum, "Pelo perfil ativo"),
      statCard("Troca imediata", stats.immediate, "Corte original da planilha"),
      statCard("Troca recomendada", selectedOriginal, "Imediata + adicional"),
      statCard("Servidores", stats.servers, "Excluídos da troca de desktops"),
      statCard("Custo estimado", formatCurrency(totalForBelow), `Usando montagem atual: ${formatCurrency(unitCost)}/un.`)
    ].join("");
  }

  function renderInventoryResults() {
    const container = document.querySelector("#inventoryResults");
    if (!container) return;

    const evaluated = getFilteredEvaluatedRows();
    const totalPages = Math.max(1, Math.ceil(evaluated.length / state.pageSize));
    state.page = Math.min(state.page, totalPages);
    const start = (state.page - 1) * state.pageSize;
    const pageItems = evaluated.slice(start, start + state.pageSize);
    const stats = getInventoryStats();

    container.innerHTML = `
      <div class="result-toolbar">
        <div>
          <p class="eyebrow">Resultado</p>
          <h2>${formatNumber(evaluated.length)} máquinas</h2>
        </div>
        <div class="pill-row">
          <span class="pill danger">${formatNumber(stats.belowMinimum)} abaixo do mínimo</span>
          <span class="pill amber">${formatNumber(stats.oldWindows)} com Windows antigo</span>
          <span class="pill green">${formatNumber(stats.meetsMinimum)} no mínimo</span>
        </div>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Computador</th>
              <th>Usuário</th>
              <th>SO</th>
              <th>RAM</th>
              <th>CPU</th>
              <th>Prioridade</th>
              <th>Avaliação</th>
            </tr>
          </thead>
          <tbody>
            ${pageItems.map(({ row, evaluation }) => inventoryRow(row, evaluation)).join("")}
          </tbody>
        </table>
      </div>

      ${pagination(totalPages)}
    `;

    renderStats();
  }

  function renderBuilderView() {
    app.innerHTML = `
      <section class="section-stack">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Montagem e orçamento</p>
            <h1>Peças, preços e custo por lote</h1>
          </div>
          <div class="heading-actions">
            <button class="button button-primary" type="button" data-export-budget>Exportar orçamento</button>
          </div>
        </div>

        <div class="workbench">
          <aside class="control-panel">
            <div class="panel-title">
              <span class="panel-mark"></span>
              <h2>Montagem</h2>
            </div>
            <label class="field">
              <span>Perfil</span>
              <select id="buildProfile">
                ${profiles.map((profile) => `<option value="${profile.id}" ${profile.id === state.build.profile ? "selected" : ""}>${escapeHtml(profile.label)}</option>`).join("")}
              </select>
            </label>
            <div class="profile-note">${escapeHtml(currentBuildProfile()?.description || "")}</div>
            <label class="field">
              <span>Quantidade</span>
              <select id="quantityMode">
                <option value="belowMinimum" ${state.build.quantityMode === "belowMinimum" ? "selected" : ""}>Abaixo do mínimo atual</option>
                <option value="originalSelected" ${state.build.quantityMode === "originalSelected" ? "selected" : ""}>Selecionados na planilha</option>
                <option value="immediate" ${state.build.quantityMode === "immediate" ? "selected" : ""}>Troca imediata</option>
                <option value="filtered" ${state.build.quantityMode === "filtered" ? "selected" : ""}>Filtro atual do inventário</option>
                <option value="manual" ${state.build.quantityMode === "manual" ? "selected" : ""}>Manual</option>
              </select>
            </label>
            <div class="field-grid">
              <label class="field">
                <span>Quantidade manual</span>
                <input id="manualQuantity" type="number" min="0" step="1" value="${state.build.manualQuantity}">
              </label>
              <label class="field">
                <span>Contingência %</span>
                <input id="contingency" type="number" min="0" step="0.5" value="${state.build.contingency}">
              </label>
              <label class="field">
                <span>Serviço por un.</span>
                <input id="laborPerUnit" type="number" min="0" step="10" value="${state.build.laborPerUnit}">
              </label>
            </div>
            <div class="digest">
              <strong>Referência da planilha:</strong>
              <span>${formatCurrency(inventory.metadata.estimatedUnitCost)} por computador</span>
            </div>
          </aside>

          <section class="results-panel">
            <div id="buildSummary"></div>
            <div id="supplierCoverage"></div>
            <div id="catalogRows"></div>
          </section>
        </div>

        <section class="search-panel">
          <div>
            <p class="eyebrow">Consulta pública</p>
            <h2>Buscar preço de peça</h2>
          </div>
          <label class="field search-field">
            <span>Termo</span>
            <input id="partSearch" type="search" value="${escapeAttr(state.build.partSearch)}" placeholder="Ex.: SSD NVMe 500GB Kingston">
          </label>
          <div id="searchLinks" class="search-links"></div>
        </section>
      </section>
    `;

    renderBuildSummary();
    renderSupplierCoverage();
    renderCatalogRows();
    renderSearchLinks();
  }

  function renderBuildSummary() {
    const container = document.querySelector("#buildSummary");
    if (!container) return;

    const subtotal = getBuildSubtotal();
    const quantity = getBuildQuantity();
    const contingencyValue = subtotal * (state.build.contingency / 100);
    const unitTotal = subtotal + contingencyValue + state.build.laborPerUnit;
    const projectTotal = unitTotal * quantity;
    const spreadsheetUnit = Number(inventory.metadata.estimatedUnitCost || 0);
    const delta = subtotal - spreadsheetUnit;

    container.innerHTML = `
      <div class="summary-grid">
        ${statCard("Subtotal peças", formatCurrency(subtotal), "Sem contingência e serviço")}
        ${statCard("Custo unitário", formatCurrency(unitTotal), `${state.build.contingency}% contingência + ${formatCurrency(state.build.laborPerUnit)} serviço`)}
        ${statCard("Quantidade", quantity, quantityLabel())}
        ${statCard("Total do lote", formatCurrency(projectTotal), "Estimativa para planejamento")}
      </div>
      <div class="comparison-strip ${delta > 0 ? "is-higher" : "is-lower"}">
        <span>Comparação com a planilha</span>
        <strong>${delta >= 0 ? "+" : ""}${formatCurrency(delta)}</strong>
        <span>por unidade antes de contingência e serviço</span>
      </div>
    `;
  }

  function renderCatalogRows() {
    const container = document.querySelector("#catalogRows");
    if (!container) return;

    container.innerHTML = `
      <div class="table-wrap">
        <table class="data-table parts-table">
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Peça</th>
              <th>Preço</th>
              <th>Fonte</th>
            </tr>
          </thead>
          <tbody>
            ${categories.map((category) => catalogRow(category)).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderSearchLinks() {
    const container = document.querySelector("#searchLinks");
    if (!container) return;

    const term = state.build.partSearch.trim() || "computador desktop i5 16GB SSD NVMe";
    const encoded = encodeURIComponent(term);
    const links = (catalog.metadata.allowedSuppliers || []).map((supplier) => {
      const searchUrl = supplier.searchUrl || `https://www.google.com/search?q=${encodeURIComponent(supplier.label)}+{query}`;
      return [supplier.label, searchUrl.replace("{query}", encoded)];
    });

    container.innerHTML = links.map(([label, url]) => `<a class="button button-muted" target="_blank" rel="noreferrer" href="${url}">${label}</a>`).join("");
  }

  function renderSupplierCoverage() {
    const container = document.querySelector("#supplierCoverage");
    if (!container) return;

    const offers = categories.flatMap((category) => category.items.flatMap((item) => getAllowedOffers(item)));
    const counts = offers.reduce((accumulator, offerItem) => {
      accumulator[offerItem.supplier] = (accumulator[offerItem.supplier] || 0) + 1;
      return accumulator;
    }, {});

    container.innerHTML = `
      <div class="supplier-grid">
        ${(catalog.metadata.allowedSuppliers || []).map((supplier) => {
          const count = counts[supplier.id] || 0;
          return `
            <article class="supplier-card ${count ? "" : "is-empty"}">
              <span>${escapeHtml(supplier.label)}</span>
              <strong>${formatNumber(count)}</strong>
              <small>${count ? "ofertas públicas no catálogo" : "sem preço público localizado"}</small>
            </article>
          `;
        }).join("")}
      </div>
      <div class="catalog-note">${escapeHtml(catalog.metadata.note)}</div>
    `;
  }

  function syncMinimumLabels() {
    const target = document.querySelector("#minimumDigest");
    if (!target) return;

    const stats = getInventoryStats();
    target.innerHTML = `
      <strong>Mínimo ativo</strong>
      <span>${minimumDescription()}</span>
      <span>${formatNumber(stats.belowMinimum)} estações abaixo do mínimo</span>
    `;

    const select = document.querySelector("#minimumProfile");
    if (select) select.value = state.minimumProfile;
  }

  function applyBuildProfile(profileId) {
    const profile = profiles.find((item) => item.id === profileId) || profiles[0];
    if (!profile) return;

    state.build.profile = profile.id;
    state.build.included = { ...profile.included };
    state.build.selections = { ...profile.selections };
    state.build.priceOverrides = {};

    categories.forEach((category) => {
      if (!(category.id in state.build.included)) {
        state.build.included[category.id] = Boolean(category.required);
      }
      if (!state.build.selections[category.id]) {
        state.build.selections[category.id] = category.defaultItem || category.items[0]?.id;
      }
    });
  }

  function currentBuildProfile() {
    return profiles.find((profile) => profile.id === state.build.profile);
  }

  function getInventoryStats() {
    const evaluated = rows.map((row) => ({ row, evaluation: evaluateHardware(row) }));
    const workstations = evaluated.filter(({ row }) => !isServer(row));
    const belowMinimum = workstations.filter(({ evaluation }) => !evaluation.meets);
    const oldWindows = workstations.filter(({ row }) => {
      const major = getWindowsMajor(row.sistemaOperacional);
      return major > 0 && major < 10;
    });

    return {
      total: rows.length,
      workstations: workstations.length,
      servers: rows.length - workstations.length,
      belowMinimum: belowMinimum.length,
      meetsMinimum: workstations.length - belowMinimum.length,
      oldWindows: oldWindows.length,
      immediate: workstations.filter(({ row }) => row.prioridade === "Troca imediata").length,
      recommendedAdditional: workstations.filter(({ row }) => row.prioridade === "Troca recomendada").length,
      outsideCut: workstations.filter(({ row }) => row.prioridade === "Manter / avaliar futuramente").length
    };
  }

  function getFilteredEvaluatedRows() {
    const search = normalize(state.filters.search);
    const filtered = rows
      .map((row) => ({ row, evaluation: evaluateHardware(row) }))
      .filter(({ row, evaluation }) => {
        if (!state.filters.includeServers && isServer(row)) return false;
        if (state.filters.os !== "all" && row.sistemaOperacional !== state.filters.os) return false;

        if (search) {
          const haystack = normalize([
            row.computador,
            row.usuario,
            row.sistemaOperacional,
            row.tag,
            row.prioridade,
            row.motivo
          ].join(" "));
          if (!haystack.includes(search)) return false;
        }

        switch (state.filters.status) {
          case "below-min":
            return !isServer(row) && !evaluation.meets;
          case "meets-min":
            return !isServer(row) && evaluation.meets;
          case "immediate":
            return row.prioridade === "Troca imediata";
          case "recommended":
            return row.prioridade === "Troca imediata" || row.prioridade === "Troca recomendada";
          case "recommended-additional":
            return row.prioridade === "Troca recomendada";
          case "keep":
            return row.prioridade === "Manter / avaliar futuramente";
          case "servers":
            return isServer(row);
          case "old-os":
            return getWindowsMajor(row.sistemaOperacional) > 0 && getWindowsMajor(row.sistemaOperacional) < 10;
          case "low-ram":
            return Number(row.ramGb || 0) < 4;
          default:
            return true;
        }
      });

    return filtered.sort(sortByRisk);
  }

  function evaluateHardware(row) {
    if (isServer(row)) {
      return {
        meets: false,
        server: true,
        reasons: ["Servidor excluído da troca de desktops"]
      };
    }

    const reasons = [];
    const ram = Number(row.ramGb || 0);
    const cpu = Number(row.cpuMhz || 0);
    const osMajor = getWindowsMajor(row.sistemaOperacional);

    if (state.minimum.ramGb > 0 && ram < state.minimum.ramGb) {
      reasons.push(`RAM ${formatRam(ram)} < ${formatRam(state.minimum.ramGb)}`);
    }

    if (state.minimum.cpuMhz > 0 && cpu > 0 && cpu < state.minimum.cpuMhz) {
      reasons.push(`CPU ${formatNumber(cpu)} MHz < ${formatNumber(state.minimum.cpuMhz)} MHz`);
    }

    if (state.minimum.windowsMajor > 0) {
      if (osMajor === 0) {
        reasons.push("SO não identificado para corte Windows");
      } else if (osMajor < state.minimum.windowsMajor) {
        reasons.push(`Windows ${osMajor} < Windows ${state.minimum.windowsMajor}`);
      }
    }

    return {
      meets: reasons.length === 0,
      server: false,
      reasons
    };
  }

  function sortByRisk(a, b) {
    const aRisk = a.evaluation.meets ? 1 : 0;
    const bRisk = b.evaluation.meets ? 1 : 0;
    if (aRisk !== bRisk) return aRisk - bRisk;

    const priority = {
      "Troca imediata": 0,
      "Troca recomendada": 1,
      "Manter / avaliar futuramente": 2,
      "Servidor - excluído": 3
    };
    const aPriority = priority[a.row.prioridade] ?? 9;
    const bPriority = priority[b.row.prioridade] ?? 9;
    if (aPriority !== bPriority) return aPriority - bPriority;

    return Number(a.row.ramGb || 0) - Number(b.row.ramGb || 0);
  }

  function getBuildSubtotal() {
    return categories.reduce((sum, category) => {
      if (!isCategoryIncluded(category)) return sum;
      return sum + getSelectedPrice(category.id);
    }, 0);
  }

  function getBuildUnitTotal() {
    const subtotal = getBuildSubtotal();
    return subtotal + subtotal * (state.build.contingency / 100) + state.build.laborPerUnit;
  }

  function getBuildQuantity() {
    const stats = getInventoryStats();
    switch (state.build.quantityMode) {
      case "originalSelected":
        return stats.immediate + stats.recommendedAdditional;
      case "immediate":
        return stats.immediate;
      case "filtered":
        return getFilteredEvaluatedRows().length;
      case "manual":
        return state.build.manualQuantity;
      default:
        return stats.belowMinimum;
    }
  }

  function quantityLabel() {
    const labels = {
      belowMinimum: "Abaixo do mínimo atual",
      originalSelected: "Selecionados na planilha",
      immediate: "Troca imediata",
      filtered: "Filtro atual do inventário",
      manual: "Quantidade manual"
    };
    return labels[state.build.quantityMode] || "";
  }

  function getSelectedItem(categoryId) {
    const category = categoryById[categoryId];
    if (!category) return null;
    const selectedId = state.build.selections[categoryId] || category.defaultItem || category.items[0]?.id;
    return category.items.find((item) => item.id === selectedId) || category.items[0] || null;
  }

  function getAllowedOffers(item) {
    if (!item) return [];
    const allowed = new Set((catalog.metadata.allowedSuppliers || []).map((supplier) => supplier.id));
    return (item.offers || [])
      .filter((offerItem) => allowed.has(offerItem.supplier))
      .filter((offerItem) => Number.isFinite(Number(offerItem.price)))
      .sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  }

  function getBestOffer(item) {
    return getAllowedOffers(item)[0] || null;
  }

  function getSelectedPrice(categoryId) {
    if (Object.prototype.hasOwnProperty.call(state.build.priceOverrides, categoryId)) {
      return Number(state.build.priceOverrides[categoryId] || 0);
    }
    return Number(getBestOffer(getSelectedItem(categoryId))?.price || 0);
  }

  function isCategoryIncluded(category) {
    return Boolean(category.required || state.build.included[category.id]);
  }

  function renderOffers(offers) {
    if (!offers.length) {
      return '<span class="offer-empty">Sem preço público encontrado nos fornecedores permitidos.</span>';
    }

    return `
      <div class="offer-list">
        ${offers.map((offerItem) => `
          <a class="offer-chip" href="${escapeAttr(offerItem.url || "#")}" target="_blank" rel="noreferrer">
            <strong>${escapeHtml(offerItem.supplierLabel)}</strong>
            <span>${formatCurrency(offerItem.price)}</span>
            <small>${escapeHtml(offerItem.availability || "")}</small>
          </a>
        `).join("")}
      </div>
    `;
  }

  function catalogRow(category) {
    const selected = getSelectedItem(category.id);
    const included = isCategoryIncluded(category);
    const price = getSelectedPrice(category.id);
    const disabled = category.required ? "disabled checked" : included ? "checked" : "";
    const offers = getAllowedOffers(selected);
    const bestOffer = getBestOffer(selected);

    return `
      <tr class="${included ? "" : "is-muted"}">
        <td>
          <label class="check-line compact">
            <input type="checkbox" data-part-include="${category.id}" ${disabled}>
            <span>${escapeHtml(category.label)}</span>
          </label>
        </td>
        <td>
          <select data-part-select="${category.id}">
            ${category.items.map((item) => `<option value="${item.id}" ${item.id === selected?.id ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}
          </select>
          <small>${escapeHtml(selected?.notes || "")}</small>
        </td>
        <td>
          <input class="price-input" type="number" min="0" step="0.01" data-price-override="${category.id}" value="${price}">
          <small>${bestOffer ? `Menor preço: ${escapeHtml(bestOffer.supplierLabel)}` : "Sem preço público na whitelist"}</small>
        </td>
        <td>
          ${renderOffers(offers)}
        </td>
      </tr>
    `;
  }

  function inventoryRow(row, evaluation) {
    const status = evaluation.server ? "Servidor" : evaluation.meets ? "Dentro do mínimo" : "Abaixo do mínimo";
    const badgeClass = evaluation.server ? "neutral" : evaluation.meets ? "green" : "danger";
    const reasons = evaluation.reasons.length ? evaluation.reasons.join("; ") : "Atende ao perfil mínimo ativo";

    return `
      <tr>
        <td>
          <strong>${escapeHtml(row.computador || "-")}</strong>
          <small>Linha ${escapeHtml(row.linhaOriginal || row.sheetRow || "-")}</small>
        </td>
        <td>${escapeHtml(row.usuario || "-")}</td>
        <td>${escapeHtml(row.sistemaOperacional || "-")}</td>
        <td>${formatRam(row.ramGb)}</td>
        <td>${row.cpuMhz ? `${formatNumber(row.cpuMhz)} MHz` : "-"}</td>
        <td><span class="status-text">${escapeHtml(row.prioridade || "-")}</span></td>
        <td>
          <span class="pill ${badgeClass}">${status}</span>
          <small>${escapeHtml(reasons)}</small>
        </td>
      </tr>
    `;
  }

  function statusOptions() {
    return [
      { value: "all", label: "Todos" },
      { value: "below-min", label: "Abaixo do mínimo" },
      { value: "meets-min", label: "Dentro do mínimo" },
      { value: "immediate", label: "Troca imediata" },
      { value: "recommended", label: "Selecionados na planilha" },
      { value: "recommended-additional", label: "Recomendada adicional" },
      { value: "keep", label: "Manter / avaliar" },
      { value: "old-os", label: "Windows abaixo do 10" },
      { value: "low-ram", label: "RAM abaixo de 4 GB" },
      { value: "servers", label: "Servidores" }
    ];
  }

  function pagination(totalPages) {
    if (totalPages <= 1) return "";

    const previous = Math.max(1, state.page - 1);
    const next = Math.min(totalPages, state.page + 1);

    return `
      <div class="pagination">
        <button class="button button-muted" type="button" data-page="${previous}" ${state.page === 1 ? "disabled" : ""}>Anterior</button>
        <span>Página ${formatNumber(state.page)} de ${formatNumber(totalPages)}</span>
        <button class="button button-muted" type="button" data-page="${next}" ${state.page === totalPages ? "disabled" : ""}>Próxima</button>
      </div>
    `;
  }

  function renderDistribution(selector, data) {
    const target = document.querySelector(selector);
    if (!target) return;

    const max = Math.max(...data.map((item) => Number(item.quantity || 0)), 1);
    target.innerHTML = `
      <div class="bar-list">
        ${data.map((item) => {
          const quantity = Number(item.quantity || 0);
          const width = Math.max(3, (quantity / max) * 100);
          return `
            <div class="bar-row">
              <div class="bar-label">
                <span>${escapeHtml(item.label)}</span>
                <strong>${formatNumber(quantity)}</strong>
              </div>
              <div class="bar-track"><span style="width:${width}%"></span></div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function statCard(label, value, detail) {
    return `
      <article class="stat-card">
        <span>${escapeHtml(label)}</span>
        <strong>${typeof value === "number" ? formatNumber(value) : escapeHtml(value)}</strong>
        <small>${escapeHtml(detail || "")}</small>
      </article>
    `;
  }

  function getOsOptions() {
    return [...new Set(rows.map((row) => row.sistemaOperacional).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }

  function getWindowsMajor(os) {
    const text = String(os || "").toLowerCase();
    if (!text.includes("windows")) return 0;
    if (text.includes("windows 11")) return 11;
    if (text.includes("windows 10")) return 10;
    if (text.includes("windows 8.1")) return 8.1;
    if (text.includes("windows 8")) return 8;
    if (text.includes("windows 7")) return 7;
    if (text.includes("windows server")) return 0;
    return 0;
  }

  function isServer(row) {
    return String(row.servidor || "").toLowerCase() === "sim";
  }

  function minimumDescription() {
    const cpu = state.minimum.cpuMhz > 0 ? `${formatNumber(state.minimum.cpuMhz)} MHz` : "sem corte de CPU";
    const windows = state.minimum.windowsMajor > 0 ? `Windows ${state.minimum.windowsMajor}+` : "sem corte de Windows";
    return `${formatRam(state.minimum.ramGb)} RAM, ${cpu}, ${windows}`;
  }

  function metricValue(label) {
    const metric = inventory.summary.metrics.find((item) => item.label === label);
    return metric?.quantity ?? "-";
  }

  function exportInventoryCsv() {
    const items = getFilteredEvaluatedRows();
    const lines = [
      ["Computador", "Usuário", "Último inventário", "Sistema operacional", "RAM GB", "CPU MHz", "Prioridade", "Avaliação", "Motivo"].join(";")
    ];

    items.forEach(({ row, evaluation }) => {
      lines.push([
        row.computador,
        row.usuario,
        row.ultimoInventario,
        row.sistemaOperacional,
        row.ramGb,
        row.cpuMhz,
        row.prioridade,
        evaluation.meets ? "Dentro do mínimo" : "Abaixo do mínimo",
        evaluation.reasons.join(" | ") || row.motivo
      ].map(csvCell).join(";"));
    });

    downloadText("inventario-filtrado-santa-casa.csv", lines.join("\n"));
  }

  function exportBudgetCsv() {
    const lines = [
      ["Categoria", "Peça", "Incluído", "Preço usado", "Fornecedor usado", "Ofertas permitidas"].join(";")
    ];

    categories.forEach((category) => {
      const item = getSelectedItem(category.id);
      const bestOffer = getBestOffer(item);
      const offers = getAllowedOffers(item)
        .map((offerItem) => `${offerItem.supplierLabel}: ${formatCurrency(offerItem.price)} (${offerItem.availability || "sem status"})`)
        .join(" | ");
      lines.push([
        category.label,
        item?.name || "",
        isCategoryIncluded(category) ? "Sim" : "Não",
        getSelectedPrice(category.id),
        bestOffer?.supplierLabel || "Sem preço público",
        offers || "Sem preço público encontrado"
      ].map(csvCell).join(";"));
    });

    lines.push("");
    lines.push(["Subtotal", getBuildSubtotal()].map(csvCell).join(";"));
    lines.push(["Quantidade", getBuildQuantity()].map(csvCell).join(";"));
    lines.push(["Custo unitário com contingência e serviço", getBuildUnitTotal()].map(csvCell).join(";"));
    lines.push(["Total do lote", getBuildUnitTotal() * getBuildQuantity()].map(csvCell).join(";"));

    downloadText("orcamento-pecas-santa-casa.csv", lines.join("\n"));
  }

  function downloadText(filename, content) {
    const blob = new Blob([`\ufeff${content}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function csvCell(value) {
    const text = value === null || value === undefined ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function numberFromInput(value, fallback) {
    const number = Number(String(value).replace(",", "."));
    return Number.isFinite(number) ? number : fallback;
  }

  function formatCurrency(value) {
    return currency.format(Number(value || 0));
  }

  function formatNumber(value) {
    return integer.format(Number(value || 0));
  }

  function formatRam(value) {
    const amount = Number(value || 0);
    if (amount === 0) return "0 GB";
    return `${decimal.format(amount)} GB`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }
})();
