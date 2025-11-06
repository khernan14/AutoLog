Param(
  [string]$Version = "",       # Ej: "1.0.0" (tiene prioridad)
  [ValidateSet("major","minor","patch")]
  [string]$Bump = ""           # Alternativa: "major" | "minor" | "patch"
)

function Fail($msg) { Write-Error $msg; exit 1 }
function Run($cmd, $err) {
  Write-Host "-> $cmd"
  iex $cmd
  if ($LASTEXITCODE -ne 0) { Fail $err }
}

# 0) Pre-chequeos
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Fail "git no está en PATH" }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { Fail "npm no está en PATH" }
if (-not (Test-Path package.json)) { Fail "No se encontró package.json" }

$gitStatus = git status --porcelain
if ($gitStatus) { Fail "Working tree no está limpio. Haz commit/stash antes de continuar." }

$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -ne "main") { Fail "No estás en 'main' (actual: $currentBranch)." }

Run "git pull --rebase origin main" "git pull --rebase falló"

# 1) Detectar scripts y correr QA previo
$pkg = Get-Content package.json | ConvertFrom-Json
$hasTest  = $pkg.PSObject.Properties.Name -contains "scripts" -and `
            $pkg.scripts.PSObject.Properties.Name -contains "test"
$hasBuild = $pkg.PSObject.Properties.Name -contains "scripts" -and `
            $pkg.scripts.PSObject.Properties.Name -contains "build"

if ($hasTest)  { Run "npm test" "Tests fallaron" }
if ($hasBuild) { Run "npm run build" "Build falló (pre-version)" }

# 2) Determinar versión objetivo (npm version crea commit y tag)
if ([string]::IsNullOrWhiteSpace($Version)) {
  if ([string]::IsNullOrWhiteSpace($Bump)) { Fail "Pasa -Version 1.0.0 o -Bump major|minor|patch" }
  Run "npm version $Bump -m 'chore(release): v%s'" "npm version $Bump falló"
  $pkg = Get-Content package.json | ConvertFrom-Json
  $Version = $pkg.version
} else {
  if ($Version -notmatch '^\d+\.\d+\.\d+(-[0-9A-Za-z\.-]+)?$') { Fail "Versión inválida: $Version (SemVer)" }
  Run "npm version $Version -m 'chore(release): v$Version'" "npm version $Version falló"
}

# 3) Re-build rápido en el estado ya versionado (asegura reproducibilidad)
if ($hasBuild) { Run "npm run build" "Build falló (post-version)" }

# 4) CHANGELOG
Write-Host "-> Actualizando CHANGELOG.md..."
$hasConventional = $false
try {
  & npx --yes conventional-changelog -p angular -i CHANGELOG.md -s -r 0 *> $null
  if ($LASTEXITCODE -eq 0) { $hasConventional = $true }
} catch { $hasConventional = $false }

if (-not $hasConventional) {
  $lastTag = ""
  try { $lastTag = (git describe --tags --abbrev=0 2>$null) } catch {}
  $logRange = if ($lastTag) { "$lastTag..HEAD" } else { "" }

  $header = "## v$Version - $(Get-Date -Format 'yyyy-MM-dd')"
  $commits = if ($logRange -ne "") {
    git log $logRange --pretty="* %s (%h)"
  } else {
    git log --pretty="* %s (%h)"
  }

  if (-not (Test-Path CHANGELOG.md)) { "" | Out-File -Encoding UTF8 CHANGELOG.md }
  $content = Get-Content CHANGELOG.md -Raw
  $newSection = ($header + "`r`n" + ($commits -join "`r`n") + "`r`n`r`n")
  $newSection + $content | Out-File -Encoding UTF8 CHANGELOG.md

  git add CHANGELOG.md
  Run "git commit -m 'docs(changelog): v$Version'" "commit de CHANGELOG falló"
}

# 5) Push de main + tags
Run "git push origin main --follow-tags" "git push falló"

# 6) (Opcional) Crear Release en GitHub con gh si está disponible
if (Get-Command gh -ErrorAction SilentlyContinue) {
  try {
    $releaseBody = ""
    if (Test-Path CHANGELOG.md) {
      $cl = Get-Content CHANGELOG.md -Raw
      $pattern = "## v$([regex]::Escape($Version)).*?(?:(?=\r?\n## v)|\Z)"
      $match = [regex]::Match($cl, $pattern, "Singleline")
      if ($match.Success) { $releaseBody = $match.Value.Trim() }
    }
    Write-Host "-> Creando Release v$Version (gh)..."
    if ([string]::IsNullOrWhiteSpace($releaseBody)) {
      Run "gh release create 'v$Version' -t 'v$Version' -n 'Release v$Version'" "gh release falló"
    } else {
      $tmp = New-TemporaryFile
      $releaseBody | Out-File -Encoding UTF8 $tmp
      Run "gh release create 'v$Version' -t 'v$Version' -F $tmp" "gh release falló"
      Remove-Item $tmp -Force
    }
  } catch {
    Write-Warning "No se pudo crear el Release con gh: $($_.Exception.Message)"
  }
} else {
  Write-Host "✔ Tag v$Version creado y pusheado. Para Release en GitHub: gh release create v$Version -F CHANGELOG.md -t 'v$Version'"
}

Write-Host "✅ Release listo: v$Version"
