param(
  [string]$BackendUrl = "https://esportesdasorteback-production-7ace.up.railway.app"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot
try {
  $ts = Get-Date -Format "yyyyMMdd-HHmmss"
  $reportDir = Join-Path $PSScriptRoot "reports"
  if (-not (Test-Path $reportDir)) {
    New-Item -ItemType Directory -Path $reportDir | Out-Null
  }

  $commit = (git rev-parse --short HEAD).Trim()
  $branch = (git rev-parse --abbrev-ref HEAD).Trim()

  function Get-StatusCode([string]$url) {
    try {
      return (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 25).StatusCode
    } catch {
      if ($_.Exception.Response) {
        return [int]$_.Exception.Response.StatusCode.value__
      }
      return -1
    }
  }

  $health = Get-StatusCode "$BackendUrl/health"
  $analisar = Get-StatusCode "$BackendUrl/api/analisar/123?home_team=Flamengo&away_team=Palmeiras"
  $live = Get-StatusCode "$BackendUrl/api/analises-ao-vivo?limit=2"

  $reportPath = Join-Path $reportDir ("panel-report-" + $ts + ".md")

  $content = @"
# Relatorio Pos-Push - Frontend

Data: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Branch: $branch
Commit: $commit
Backend URL: $BackendUrl

## Smoke Tests de Integracao
- GET /health: $health
- GET /api/analisar/{id}: $analisar
- GET /api/analises-ao-vivo: $live

## Gate rapido (passa/falha)
- Backend acessivel pela UI: $(if ($health -eq 200) { "PASS" } else { "FAIL" })
- Endpoint de analise para telas: $(if ($analisar -eq 200) { "PASS" } else { "FAIL" })
- Endpoint de ao vivo para home/cards: $(if ($live -eq 200) { "PASS" } else { "FAIL" })

## Checklist de banca apos push
1. Validar Ask AI Bar abrindo no lugar correto da caixa da home.
2. Validar clique na analise abrindo a tela sem 404.
3. Validar jogos ao vivo carregando sem placeholders quebrados.
4. Atualizar relatório dos 8 blocos (Painel QA v3) no documento de apresentacao.
"@

  Set-Content -Path $reportPath -Value $content -Encoding UTF8
  Write-Host "[post-push-panel] Relatorio gerado: $reportPath"
} finally {
  Pop-Location
}
