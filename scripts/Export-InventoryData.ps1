param(
  [string]$Workbook = ".\triagem_troca_computadores_santa_casa.xlsx",
  [string]$Output = ".\data\inventory.js"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression.FileSystem

function Read-EntryXml {
  param(
    [System.IO.Compression.ZipArchive]$Zip,
    [string]$Name
  )

  $entry = $Zip.GetEntry($Name)
  if (-not $entry) {
    throw "Entry not found in workbook: $Name"
  }

  $reader = [System.IO.StreamReader]::new($entry.Open())
  try {
    return [xml]$reader.ReadToEnd()
  }
  finally {
    $reader.Dispose()
  }
}

function Get-CellValue {
  param([System.Xml.XmlElement]$Cell)

  $valueNode = $Cell.ChildNodes | Where-Object { $_.LocalName -eq "v" } | Select-Object -First 1
  if (-not $valueNode) {
    $valueNode = $Cell.ChildNodes | Where-Object { $_.LocalName -eq "is" } | Select-Object -First 1
  }

  if (-not $valueNode) {
    return $null
  }

  $text = $valueNode.InnerText
  $cellType = $Cell.GetAttribute("t")

  if ($cellType -eq "n" -or $cellType -eq "") {
    $number = 0.0
    if ([double]::TryParse($text, [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$number)) {
      if ([Math]::Abs($number - [Math]::Round($number)) -lt 0.0000001) {
        return [int64][Math]::Round($number)
      }
      return $number
    }
  }

  return $text
}

function Get-CellColumn {
  param([string]$Reference)
  return ($Reference -replace "\d", "")
}

function Convert-SheetToRows {
  param(
    [System.Xml.XmlDocument]$Worksheet,
    [int]$HeaderRow = 4,
    [hashtable]$HeaderMap
  )

  $rows = @($Worksheet.DocumentElement.sheetData.row)
  $header = $rows | Where-Object { [int]$_.r -eq $HeaderRow } | Select-Object -First 1
  if (-not $header) {
    return @()
  }

  $columns = @{}
  foreach ($cell in @($header.c)) {
    $label = [string](Get-CellValue $cell)
    if ([string]::IsNullOrWhiteSpace($label)) {
      continue
    }

    $key = $HeaderMap[$label]
    if (-not $key) {
      $key = ($label -replace "[^\p{L}\p{Nd}]+", "_").Trim("_").ToLowerInvariant()
    }

    $columns[(Get-CellColumn $cell.r)] = [pscustomobject]@{
      Label = $label
      Key = $key
    }
  }

  $items = New-Object System.Collections.Generic.List[object]
  foreach ($row in $rows | Where-Object { [int]$_.r -gt $HeaderRow }) {
    $item = [ordered]@{}
    foreach ($column in $columns.Values) {
      $item[$column.Key] = $null
    }

    foreach ($cell in @($row.c)) {
      $column = Get-CellColumn $cell.r
      if ($columns.ContainsKey($column)) {
        $item[$columns[$column].Key] = Get-CellValue $cell
      }
    }

    if (($item.Values | Where-Object { $_ -ne $null -and "$_".Trim() -ne "" }).Count -gt 0) {
      $item["sheetRow"] = [int]$row.r
      $items.Add([pscustomobject]$item) | Out-Null
    }
  }

  return $items
}

function Read-RowMap {
  param([System.Xml.XmlDocument]$Worksheet)

  $map = @{}
  foreach ($row in @($Worksheet.DocumentElement.sheetData.row)) {
    $cells = @{}
    foreach ($cell in @($row.c)) {
      $cells[(Get-CellColumn $cell.r)] = Get-CellValue $cell
    }
    $map[[int]$row.r] = $cells
  }
  return $map
}

$headerMap = @{
  "Computador" = "computador"
  "Usuário" = "usuario"
  "Último Inventário" = "ultimoInventario"
  "Sistema Operacional" = "sistemaOperacional"
  "RAM (MB)" = "ramMb"
  "RAM (GB aprox.)" = "ramGb"
  "CPU (MHz)" = "cpuMhz"
  "TAG" = "tag"
  "Servidor?" = "servidor"
  "Prioridade" = "prioridade"
  "Status" = "status"
  "Motivo" = "motivo"
  "Linha original" = "linhaOriginal"
  "Qtd. registros" = "quantidadeRegistros"
  "Linha mantida" = "linhaMantida"
  "Inventário mantido" = "inventarioMantido"
  "Usuário mantido" = "usuarioMantido"
  "SO mantido" = "sistemaOperacionalMantido"
  "RAM mantida (MB)" = "ramMantidaMb"
  "Registros encontrados" = "registrosEncontrados"
}

$resolvedWorkbook = Resolve-Path $Workbook
$zip = [System.IO.Compression.ZipFile]::OpenRead($resolvedWorkbook)

try {
  $workbookXml = Read-EntryXml $zip "xl/workbook.xml"
  $relsXml = Read-EntryXml $zip "xl/_rels/workbook.xml.rels"

  $relMap = @{}
  foreach ($rel in @($relsXml.Relationships.Relationship)) {
    $relMap[$rel.Id] = $rel.Target.TrimStart("/")
  }

  $sheetTargets = @{}
  foreach ($sheet in @($workbookXml.workbook.sheets.sheet)) {
    $rid = $sheet.GetAttribute("id", "http://schemas.openxmlformats.org/officeDocument/2006/relationships")
    $sheetTargets[$sheet.name] = $relMap[$rid]
  }

  $summarySheet = Read-EntryXml $zip $sheetTargets["Resumo"]
  $summaryRows = Read-RowMap $summarySheet

  $metrics = @()
  foreach ($rowNumber in 13..20) {
    if ($summaryRows.ContainsKey($rowNumber) -and $summaryRows[$rowNumber].ContainsKey("A")) {
      $label = $summaryRows[$rowNumber]["A"]
      if ($label) {
        $metrics += [pscustomobject]@{
          label = $label
          quantity = $summaryRows[$rowNumber]["B"]
          estimatedCost = $summaryRows[$rowNumber]["C"]
        }
      }
    }
  }

  $priorityBreakdown = @()
  foreach ($rowNumber in 13..15) {
    if ($summaryRows.ContainsKey($rowNumber) -and $summaryRows[$rowNumber].ContainsKey("G")) {
      $priorityBreakdown += [pscustomobject]@{
        label = $summaryRows[$rowNumber]["G"]
        quantity = $summaryRows[$rowNumber]["H"]
      }
    }
  }

  $osDistribution = @()
  foreach ($rowNumber in 25..33) {
    if ($summaryRows.ContainsKey($rowNumber) -and $summaryRows[$rowNumber].ContainsKey("A")) {
      $os = $summaryRows[$rowNumber]["A"]
      if ($os) {
        $osDistribution += [pscustomobject]@{
          label = $os
          quantity = $summaryRows[$rowNumber]["B"]
        }
      }
    }
  }

  $ramDistribution = @()
  foreach ($rowNumber in 25..29) {
    if ($summaryRows.ContainsKey($rowNumber) -and $summaryRows[$rowNumber].ContainsKey("D")) {
      $range = $summaryRows[$rowNumber]["D"]
      if ($range) {
        $ramDistribution += [pscustomobject]@{
          label = $range
          quantity = $summaryRows[$rowNumber]["E"]
        }
      }
    }
  }

  $notes = @()
  foreach ($rowNumber in 37..39) {
    if ($summaryRows.ContainsKey($rowNumber) -and $summaryRows[$rowNumber].ContainsKey("A")) {
      $note = $summaryRows[$rowNumber]["A"]
      if ($note) {
        $notes += $note
      }
    }
  }

  $data = [ordered]@{
    metadata = [ordered]@{
      title = $summaryRows[1]["A"]
      description = $summaryRows[3]["A"]
      proposedConfiguration = $summaryRows[5]["B"]
      supplierReference = $summaryRows[6]["B"]
      estimatedUnitCost = $summaryRows[7]["B"]
      immediateCriteria = $summaryRows[8]["B"]
      recommendedCriteria = $summaryRows[9]["B"]
      sourceWorkbook = Split-Path $resolvedWorkbook -Leaf
      exportedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:sszzz")
    }
    summary = [ordered]@{
      metrics = $metrics
      priorityBreakdown = $priorityBreakdown
      osDistribution = $osDistribution
      ramDistribution = $ramDistribution
      notes = $notes
    }
    sheets = [ordered]@{}
  }

  foreach ($sheetName in @("Troca_Imediata", "Troca_Recomendada", "Inventario_Classificado", "Servidores_Excluidos", "Duplicados")) {
    $worksheet = Read-EntryXml $zip $sheetTargets[$sheetName]
    $data.sheets[$sheetName] = Convert-SheetToRows $worksheet 4 $headerMap
  }

  $json = $data | ConvertTo-Json -Depth 100 -Compress
  $outputPath = Join-Path (Get-Location) $Output
  $outputDir = Split-Path $outputPath -Parent
  if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
  }

  Set-Content -Path $outputPath -Value "window.SCMJF_INVENTORY = $json;" -Encoding UTF8
}
finally {
  $zip.Dispose()
}
