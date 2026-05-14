(function () {
  "use strict";

  const inventory = window.SCMJF_INVENTORY;
  let catalog = window.SCMJF_PARTS_CATALOG;
  const app = document.querySelector("#app");

  if (!inventory || !catalog) {
    app.innerHTML = '<section class="empty-state">Dados não encontrados. Verifique os arquivos em <code>data/</code>.</section>';
    return;
  }

  const rows = inventory.sheets.Inventario_Classificado || [];
  let categories = [];
  let categoryById = {};
  let profiles = [];
  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const integer = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
  const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

  const minimumProfiles = [
    /*{
      id: "original",
      label: "Corte original da planilha",
      ramGb: 4,
      cpuMhz: 0,
      windowsMajor: 10
    }*/
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
    catalogStatus: {
      loading: false,
      dynamic: false,
      message: ""
    },
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
      includeServers: false,
      sortKey: "risk",
      sortDirection: "asc"
    },
    build: {
      profile: "base",
      quantityMode: "belowMinimum",
      manualQuantity: Number(inventory.summary.priorityBreakdown?.[0]?.quantity || 48),
      contingency: 8,
      laborPerUnit: 0,
      included: {},
      selections: {},
      partQueries: {},
      cpuVendor: "all",
      partSearch: ""
    }
  };

  setCatalog(catalog);
  applyBuildProfile("base");
  loadDynamicCatalog();

  document.addEventListener("click", handleClick);
  document.addEventListener("change", handleChange);
  document.addEventListener("input", handleInput);
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("focusin", handleFocusIn);
  document.addEventListener("wheel", handleWheel, { passive: false });

  render();

  function setCatalog(nextCatalog) {
    catalog = nextCatalog;
    categories = catalog.categories || [];
    categoryById = Object.fromEntries(categories.map((category) => [category.id, category]));
    profiles = catalog.profiles || [];
  }

  async function loadDynamicCatalog(refresh = false) {
    if (!window.location || window.location.protocol === "file:") {
      state.catalogStatus = {
        loading: false,
        dynamic: false,
        message: "Abra pelo servidor local para carregar preços dinâmicos."
      };
      return;
    }

    state.catalogStatus = { loading: true, dynamic: false, message: "Carregando preços atuais..." };
    if (state.view === "builder") renderBuilderView();

    try {
      const response = await fetch(`/api/catalog${refresh ? "?refresh=1" : ""}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const dynamicCatalog = await response.json();
      setCatalog(dynamicCatalog);
      applyBuildProfile(state.build.profile);
      state.catalogStatus = { loading: false, dynamic: true, message: `Preços atualizados em ${formatDateTime(dynamicCatalog.metadata.generatedAt)}` };
      render();
    } catch (error) {
      state.catalogStatus = { loading: false, dynamic: false, message: `Falha ao carregar preços dinâmicos: ${error.message}` };
      if (state.view === "builder") renderBuilderView();
    }
  }

  function handleClick(event) {
    const picker = event.target.closest?.(".part-picker");
    if (picker) {
      openPartPicker(picker);
    } else if (!event.target.closest?.("[data-cpu-vendor]")) {
      closePartPickers();
    }

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

    const sortButton = event.target.closest("[data-sort-key]");
    if (sortButton) {
      const key = sortButton.dataset.sortKey;
      if (state.filters.sortKey === key) {
        state.filters.sortDirection = state.filters.sortDirection === "asc" ? "desc" : "asc";
      } else {
        state.filters.sortKey = key;
        state.filters.sortDirection = "asc";
      }
      state.page = 1;
      renderInventoryResults();
      return;
    }

    if (event.target.closest("[data-export-inventory]")) {
      exportInventoryCsv();
      return;
    }

    if (event.target.closest("[data-export-budget]")) {
      exportBudgetCsv();
      return;
    }

    if (event.target.closest("[data-refresh-catalog]")) {
      loadDynamicCatalog(true);
      return;
    }

    const cpuVendorButton = event.target.closest("[data-cpu-vendor]");
    if (cpuVendorButton) {
      state.build.cpuVendor = cpuVendorButton.dataset.cpuVendor;
      ensureSelectionForCategory("cpu");
      reconcileCompatibleSelections("cpu");
      renderCatalogRows();
      renderBuildSummary();
      return;
    }

    const partChoice = event.target.closest("[data-part-choice]");
    if (partChoice) {
      const categoryId = partChoice.dataset.partChoice;
      state.build.selections[categoryId] = partChoice.dataset.itemId;
      delete state.build.partQueries[categoryId];
      reconcileCompatibleSelections(categoryId);
      renderCatalogRows();
      renderBuildSummary();
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

    if (target.dataset.partQuery) {
      state.build.partQueries[target.dataset.partQuery] = target.value;
      openPartPicker(target.closest(".part-picker"));
      filterPartPicker(target);
    }
  }

  function handleFocusIn(event) {
    if (event.target.dataset?.partQuery) {
      openPartPicker(event.target.closest(".part-picker"));
    }
  }

  function handleKeydown(event) {
    const target = event.target;
    if (!target.dataset?.partQuery || event.key !== "Enter") return;

    const picker = target.closest(".part-picker");
    const firstVisible = picker?.querySelector(".part-option:not([hidden])");
    if (!firstVisible) return;

    event.preventDefault();
    firstVisible.click();
  }

  function handleWheel(event) {
    const list = event.target.closest?.(".part-option-list");
    if (!list) return;

    event.preventDefault();
    event.stopPropagation();
    list.scrollTop += event.deltaY;
  }

  function openPartPicker(picker) {
    if (!picker) return;
    closePartPickers(picker);
    picker.classList.add("is-open");
  }

  function closePartPickers(except = null) {
    document.querySelectorAll(".part-picker.is-open").forEach((picker) => {
      if (picker !== except) picker.classList.remove("is-open");
    });
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
          <section class="chart-panel chart-wide">
            <h2>SituaÃ§Ã£o do filtro atual</h2>
            <div id="statusChart"></div>
          </section>
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

  function renderInventoryCharts() {
    const evaluated = getFilteredEvaluatedRows();
    renderDistribution("#statusChart", getFilteredStatusDistribution(evaluated));
    renderDistribution("#osChart", getFilteredOsDistribution(evaluated));
    renderDistribution("#ramChart", getFilteredRamDistribution(evaluated));
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
              ${sortableHeader("computer", "Computador")}
              ${sortableHeader("user", "Usuário")}
              ${sortableHeader("os", "SO")}
              ${sortableHeader("ram", "RAM")}
              ${sortableHeader("cpu", "CPU")}
              ${sortableHeader("priority", "Prioridade")}
              ${sortableHeader("evaluation", "Avaliação")}
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
    renderInventoryCharts();
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
            <span class="catalog-status">${escapeHtml(state.catalogStatus.message || "")}</span>
            <button class="button button-muted" type="button" data-refresh-catalog ${state.catalogStatus.loading ? "disabled" : ""}>Atualizar preços</button>
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

    container.innerHTML = `
      <div class="summary-grid">
        ${statCard("Subtotal peças", formatCurrency(subtotal), "Sem contingência e serviço")}
        ${statCard("Custo unitário", formatCurrency(unitTotal), `${state.build.contingency}% contingência + ${formatCurrency(state.build.laborPerUnit)} serviço`)}
        ${statCard("Quantidade", quantity, quantityLabel())}
        ${statCard("Total do lote", formatCurrency(projectTotal), "Estimativa para planejamento")}
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
    state.build.partQueries = {};

    categories.forEach((category) => {
      if (!(category.id in state.build.included)) {
        state.build.included[category.id] = Boolean(category.required);
      }
      if (!state.build.selections[category.id] || !category.items.some((item) => item.id === state.build.selections[category.id])) {
        state.build.selections[category.id] = category.defaultItem || category.items[0]?.id;
      }
    });
    reconcileCompatibleSelections("cpu");
    reconcileCompatibleSelections("motherboard");
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

    return sortEvaluatedRows(filtered);
  }

  function sortEvaluatedRows(items) {
    const key = state.filters.sortKey || "risk";
    const direction = state.filters.sortDirection === "desc" ? -1 : 1;

    return [...items].sort((a, b) => {
      const result = compareSortValues(sortValue(a, key), sortValue(b, key));
      if (result !== 0) return result * direction;
      return sortByRisk(a, b);
    });
  }

  function sortValue(item, key) {
    switch (key) {
      case "computer":
        return item.row.computador || "";
      case "user":
        return item.row.usuario || "";
      case "os":
        return item.row.sistemaOperacional || "";
      case "ram":
        return Number(item.row.ramGb || 0);
      case "cpu":
        return Number(item.row.cpuMhz || 0);
      case "priority":
        return priorityRank(item.row.prioridade);
      case "evaluation":
      case "risk":
        return evaluationRank(item);
      default:
        return "";
    }
  }

  function compareSortValues(a, b) {
    if (typeof a === "number" && typeof b === "number") return a - b;
    return String(a).localeCompare(String(b), "pt-BR", { numeric: true, sensitivity: "base" });
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
    const aRisk = evaluationRank(a);
    const bRisk = evaluationRank(b);
    if (aRisk !== bRisk) return aRisk - bRisk;

    const aPriority = priorityRank(a.row.prioridade);
    const bPriority = priorityRank(b.row.prioridade);
    if (aPriority !== bPriority) return aPriority - bPriority;

    return Number(a.row.ramGb || 0) - Number(b.row.ramGb || 0);
  }

  function evaluationRank(item) {
    if (item.evaluation.server) return 3;
    return item.evaluation.meets ? 1 : 0;
  }

  function priorityRank(priorityName) {
    const priority = {
      "Troca imediata": 0,
      "Troca recomendada": 1,
      "Manter / avaliar futuramente": 2,
      "Servidor - excluído": 3
    };
    return priority[priorityName] ?? 9;
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
    const items = getAvailableItemsForCategory(category);
    const selectedId = state.build.selections[categoryId] || category.defaultItem || category.items[0]?.id;
    return items.find((item) => item.id === selectedId) || items[0] || null;
  }

  function getAvailableItemsForCategory(category) {
    const items = category.items || [];
    if (category.id === "cpu") {
      if (state.build.cpuVendor === "amd") {
        return items.filter((item) => item.compatibility?.vendor === "amd");
      }
      if (state.build.cpuVendor === "intel") {
        return items.filter((item) => item.compatibility?.vendor === "intel");
      }
      return items;
    }

    if (category.id === "motherboard") {
      const cpuSocket = getSelectedItem("cpu")?.compatibility?.socket;
      if (!cpuSocket) return items;
      return items.filter((item) => item.compatibility?.socket === cpuSocket);
    }

    if (category.id === "memory") {
      const memoryType = getSelectedItem("motherboard")?.compatibility?.memoryType;
      if (!memoryType) return items;
      return items.filter((item) => item.compatibility?.memoryType === memoryType);
    }

    if (category.id === "cooler") {
      const cpuSocket = getSelectedItem("cpu")?.compatibility?.socket;
      if (!cpuSocket) return items;
      return items.filter((item) => {
        const sockets = item.compatibility?.sockets || [];
        return sockets.length === 0 || sockets.includes(cpuSocket);
      });
    }

    return items;
  }

  function reconcileCompatibleSelections(changedCategoryId) {
    const impacted = changedCategoryId === "cpu"
      ? ["motherboard", "memory", "cooler"]
      : changedCategoryId === "motherboard"
        ? ["memory"]
        : [];

    impacted.forEach((categoryId) => {
      const category = categoryById[categoryId];
      if (!category) return;
      const items = getAvailableItemsForCategory(category);
      if (!items.some((item) => item.id === state.build.selections[categoryId])) {
        state.build.selections[categoryId] = items[0]?.id || null;
      }
    });
  }

  function ensureSelectionForCategory(categoryId) {
    const category = categoryById[categoryId];
    if (!category) return;
    const items = getAvailableItemsForCategory(category);
    if (!items.some((item) => item.id === state.build.selections[categoryId])) {
      state.build.selections[categoryId] = items[0]?.id || null;
    }
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

  function renderCpuVendorFilter() {
    const options = [
      ["all", "Todos"],
      ["amd", "Ryzen / AMD"],
      ["intel", "Intel"]
    ];

    return `
      <div class="segmented part-segmented" aria-label="Filtro de processador">
        ${options.map(([value, label]) => `
          <button class="${state.build.cpuVendor === value ? "is-active" : ""}" type="button" data-cpu-vendor="${value}">
            ${escapeHtml(label)}
          </button>
        `).join("")}
      </div>
    `;
  }

  function renderPartPicker(category, items, selected) {
    const query = state.build.partQueries[category.id] ?? "";
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    const selectedId = selected?.id || "";
    const visibleItems = terms.length
      ? items.filter((item) => terms.every((term) => normalize(item.name).includes(term)))
      : items;

    if (!items.length) {
      return `
        ${category.id === "cpu" ? renderCpuVendorFilter() : ""}
        <div class="part-picker is-empty">
          <input class="part-search-input" type="search" disabled value="Sem itens compatíveis">
        </div>
      `;
    }

    return `
      ${category.id === "cpu" ? renderCpuVendorFilter() : ""}
      <div class="part-picker" data-picker="${category.id}">
        <input
          class="part-search-input"
          type="search"
          data-part-query="${category.id}"
          value="${escapeAttr(query)}"
          placeholder="Digite para buscar ${escapeAttr(category.label.toLowerCase())}"
          autocomplete="off"
        >
        <div class="part-picker-count" data-picker-count="${category.id}">${formatNumber(visibleItems.length)} de ${formatNumber(items.length)} opções</div>
        <div class="part-option-list" role="listbox">
          ${items.map((item) => {
            const offer = getBestOffer(item);
            const hidden = terms.length && !terms.every((term) => normalize(item.name).includes(term));
            return `
              <button
                class="part-option ${item.id === selectedId ? "is-selected" : ""} ${hidden ? "is-filtered-out" : ""}"
                type="button"
                data-part-choice="${category.id}"
                data-item-id="${escapeAttr(item.id)}"
                data-search="${escapeAttr(normalize(item.name))}"
                ${hidden ? "hidden" : ""}
              >
                <span>${escapeHtml(item.name)}</span>
                <small>${offer ? `${formatCurrency(offer.price)} - ${escapeHtml(offer.supplierLabel)}` : "Sem preço público"}</small>
              </button>
            `;
          }).join("")}
          <div class="part-empty-message" ${visibleItems.length ? "hidden" : ""}>Nenhum item encontrado para a busca.</div>
        </div>
      </div>
    `;
  }

  function filterPartPicker(input) {
    const picker = input.closest(".part-picker");
    if (!picker) return;

    const terms = normalize(input.value).split(/\s+/).filter(Boolean);
    const options = [...picker.querySelectorAll(".part-option")];
    let visible = 0;

    options.forEach((option) => {
      const search = option.dataset.search || "";
      const matches = terms.every((term) => search.includes(term));
      option.hidden = !matches;
      option.classList.toggle("is-filtered-out", !matches);
      if (matches) visible += 1;
    });

    const counter = picker.querySelector("[data-picker-count]");
    if (counter) {
      counter.textContent = `${formatNumber(visible)} de ${formatNumber(options.length)} opções`;
    }

    const emptyMessage = picker.querySelector(".part-empty-message");
    if (emptyMessage) emptyMessage.hidden = visible > 0;

    const list = picker.querySelector(".part-option-list");
    if (list) list.scrollTop = 0;
  }

  function catalogRow(category) {
    const availableItems = getAvailableItemsForCategory(category);
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
          ${renderPartPicker(category, availableItems, selected)}
        </td>
        <td>
          <div class="price-readout">
            <strong>${price ? formatCurrency(price) : "-"}</strong>
            <small>${bestOffer ? `Menor preço: ${escapeHtml(bestOffer.supplierLabel)}` : "Sem preço público"}</small>
          </div>
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

  function sortableHeader(key, label) {
    const active = state.filters.sortKey === key;
    const direction = active ? state.filters.sortDirection : "none";
    const icon = !active ? "↕" : direction === "asc" ? "↑" : "↓";
    const title = !active ? `Ordenar por ${label}` : `Ordenado ${direction === "asc" ? "crescente" : "decrescente"}`;

    return `
      <th>
        <button class="sort-button ${active ? "is-active" : ""}" type="button" data-sort-key="${key}" title="${escapeAttr(title)}">
          <span>${escapeHtml(label)}</span>
          <span aria-hidden="true">${icon}</span>
        </button>
      </th>
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

  function getFilteredStatusDistribution(items) {
    const workstations = items.filter(({ row }) => !isServer(row));
    const belowMinimum = workstations.filter(({ evaluation }) => !evaluation.meets).length;
    const meetsMinimum = workstations.length - belowMinimum;
    const oldWindows = workstations.filter(({ row }) => {
      const major = getWindowsMajor(row.sistemaOperacional);
      return major > 0 && major < 10;
    }).length;

    return [
      { label: "Abaixo do mínimo", quantity: belowMinimum },
      { label: "No mínimo", quantity: meetsMinimum },
      { label: "Com Windows antigo", quantity: oldWindows }
    ];
  }

  function getFilteredOsDistribution(items) {
    return toDistribution(items, ({ row }) => row.sistemaOperacional || "Não informado");
  }

  function getFilteredRamDistribution(items) {
    return toDistribution(items, ({ row }) => ramBucket(Number(row.ramGb || 0)), [
      "Abaixo de 4 GB",
      "4 GB",
      "Entre 5 e 7 GB",
      "8 a 11 GB",
      "12 GB ou mais"
    ]);
  }

  function toDistribution(items, getLabel, preferredOrder = null) {
    const counts = items.reduce((accumulator, item) => {
      const label = getLabel(item);
      accumulator[label] = (accumulator[label] || 0) + 1;
      return accumulator;
    }, {});

    const entries = Object.entries(counts).map(([label, quantity]) => ({ label, quantity }));
    if (!preferredOrder) {
      return entries.sort((a, b) => b.quantity - a.quantity || a.label.localeCompare(b.label, "pt-BR"));
    }

    return preferredOrder
      .filter((label) => counts[label])
      .map((label) => ({ label, quantity: counts[label] }));
  }

  function ramBucket(ramGb) {
    if (ramGb < 4) return "Abaixo de 4 GB";
    if (ramGb === 4) return "4 GB";
    if (ramGb >= 5 && ramGb <= 7) return "Entre 5 e 7 GB";
    if (ramGb >= 8 && ramGb <= 11) return "8 a 11 GB";
    return "12 GB ou mais";
  }

  function statCard(label, value, detail) {
    const valueText = typeof value === "number" ? formatNumber(value) : String(value);
    const compactClass = valueText.length > 12 ? ' class="is-compact"' : "";

    return `
      <article class="stat-card">
        <span>${escapeHtml(label)}</span>
        <strong${compactClass}>${escapeHtml(valueText)}</strong>
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

  function formatDateTime(value) {
    if (!value) return "-";
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short"
    }).format(new Date(value));
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
