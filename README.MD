# Gestão de TI Santa Casa

Aplicativo web para análise da planilha `triagem_troca_computadores_santa_casa.xlsx` e consulta dinâmica de peças.

## Como abrir

Execute o servidor local e abra `http://localhost:4001`.

```powershell
npm start
```

O servidor expõe `/api/catalog` para buscar preços atuais na KaBuM!, Magazine Luiza e Microsoft e alimentar a página de montagem.
Na primeira atualização ele consulta várias páginas públicas dos fornecedores. Depois disso usa cache em memória e em `.cache/catalog.json` por 15 minutos.

## O que tem no app

- Inventário consolidado da planilha, com filtros por busca, sistema operacional, prioridade e servidores.
- Definição de mínimo de hardware por perfil ou valores personalizados.
- Cálculo de máquinas abaixo do mínimo e estimativa de custo por lote.
- Página de montagem com catálogo de peças, links de fonte pública, preços editáveis e fornecedores limitados à lista permitida.
- Exportação CSV do inventário filtrado e do orçamento.

## Dados

- `data/inventory.js` é gerado a partir da planilha.
- `data/catalog.js` contém apenas o fallback inicial. A página de montagem carrega dados dinâmicos pelo servidor.
- `scripts/Export-InventoryData.ps1` refaz a exportação do XLSX.
- `scripts/smoke-test.js` valida se a aplicação renderiza os dados principais.

## Comandos úteis

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Export-InventoryData.ps1
node .\scripts\smoke-test.js
npm start
```

## Fontes de preços

Os preços são estimativas obtidas dinamicamente, com links diretos no catálogo. Peças físicas continuam limitadas a KaBuM! e Magazine Luiza. Sistema operacional usa preço oficial publicado pela Microsoft para Microsoft 365 F3, que inclui Windows Enterprise E3. Antes de compra, validar disponibilidade, frete, garantia, nota fiscal, modelo de licenciamento e compatibilidade entre processador, placa-mãe e memória.

## Performance da API

Variáveis úteis:

- `SCMJF_CACHE_TTL_MS`: tempo do cache, padrão 15 minutos.
- `SCMJF_FETCH_CONCURRENCY`: requisições simultâneas aos fornecedores, padrão 12.
- `SCMJF_MAX_CONCURRENCY`: tarefas internas simultâneas, padrão 8.
- `SCMJF_MAX_PAGES`: limite opcional de páginas por busca; `0` busca todas as páginas encontradas.
