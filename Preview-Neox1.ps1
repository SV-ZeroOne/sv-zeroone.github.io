param([int]$Port = 8766, [switch]$InteractiveOnly)

$ErrorActionPreference = 'Stop'
$previewRoot = $PSScriptRoot
if (-not $InteractiveOnly) {
    $previewRoot = Join-Path $PSScriptRoot '_site'
    if (-not (Test-Path -LiteralPath (Join-Path $previewRoot '2026/10/16/gmktec-neox1-pro-local-ai-lab.html'))) {
        throw 'Build the draft with Jekyll --unpublished first, or use -InteractiveOnly to view the 3D model directly.'
    }
}

$pythonCommand = Get-Command python.exe -ErrorAction SilentlyContinue
if (-not $pythonCommand) { throw 'Python 3 is required for this static preview server.' }
$previewPage = if ($InteractiveOnly) { 'neox1-lab/' } else { '2026/10/16/gmktec-neox1-pro-local-ai-lab.html' }
Write-Host "Preview: http://127.0.0.1:$Port/$previewPage"
Write-Host 'Local only. Press Ctrl+C to stop.'
& $pythonCommand.Source -m http.server $Port --bind 127.0.0.1 --directory $previewRoot
