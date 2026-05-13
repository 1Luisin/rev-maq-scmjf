# Gestão de TI Santa Casa

Aplicativo web estático para análise da planilha `triagem_troca_computadores_santa_casa.xlsx`.

## Como abrir

Abra `index.html` no navegador. O app não usa dependências externas nem servidor.

## O que tem no app

- Inventário consolidado da planilha, com filtros por busca, sistema operacional, prioridade e servidores.
- Definição de mínimo de hardware por perfil ou valores personalizados.
- Cálculo de máquinas abaixo do mínimo e estimativa de custo por lote.
- Página de montagem com catálogo de peças, links de fonte pública, preços editáveis e fornecedores limitados à lista permitida.
- Exportação CSV do inventário filtrado e do orçamento.
- Tela de auditoria com servidores excluídos e computadores duplicados consolidados.

## Dados

- `data/inventory.js` é gerado a partir da planilha.
- `data/catalog.js` contém o catálogo de peças com preços públicos consultados em 13/05/2026, somente para fornecedores permitidos.
- `scripts/Export-InventoryData.ps1` refaz a exportação do XLSX.
- `scripts/smoke-test.js` valida se a aplicação renderiza os dados principais.

## Comandos úteis

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Export-InventoryData.ps1
node .\scripts\smoke-test.js
```

## Fontes de preços

Os preços são estimativas editáveis, com links diretos no catálogo. A lista de fornecedores permitidos está limitada a: Datafor, VMPack, KaBuM!, Magazine Luiza, Hardsoft, Shopshipe e Matchpoint. Quando um fornecedor não possui catálogo público ou estoque/preço visível, o app marca como sem preço público encontrado. Antes de compra, validar disponibilidade, frete, garantia, nota fiscal, modelo de licenciamento e compatibilidade entre processador, placa-mãe e memória.
