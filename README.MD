# Gestão de TI Santa Casa

Aplicativo web para análise da planilha `triagem_troca_computadores_santa_casa.xlsx` e consulta dinâmica de peças.

## Como abrir

Execute o servidor local e abra `http://localhost:4173`.

```powershell
npm start
```

O servidor expõe `/api/catalog` para buscar preços atuais na KaBuM! e Magazine Luiza e alimentar a página de montagem.

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

Os preços são estimativas editáveis, com links diretos no catálogo. A lista de fornecedores permitidos está limitada a: KaBuM! e Magazine Luiza. Quando esses fornecedores não possuem estoque/preço visível para uma peça, o app marca como sem preço público encontrado. Antes de compra, validar disponibilidade, frete, garantia, nota fiscal, modelo de licenciamento e compatibilidade entre processador, placa-mãe e memória.
