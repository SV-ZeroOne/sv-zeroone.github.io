<#
.SYNOPSIS
  Build the Zero Security site with Jekyll (in Docker) and open it locally.

.DESCRIPTION
  Ruby is not installed on this machine, so Jekyll runs inside the official
  ruby:3.4 Docker image. The build writes static HTML into _site/, and a small
  Python web server serves that folder on http://127.0.0.1:4100/.

  Steps performed:
    1. Make sure Docker Desktop is running (start it if needed).
    2. docker run ruby:3.4 -> bundle exec jekyll build --drafts   (gems cached in
       the named volume "k8-blog-gems", so only the first run is slow).
    3. Start "python -m http.server 4100 --directory _site" if nothing is
       listening on 4100 yet.
    4. Open the site (or a given page) in the default browser.

.PARAMETER Page
  Site-relative path to open, e.g. "/k8-range/" or
  "/2026/10/13/building-a-cyber-range-with-ludus-on-a-mini-pc.html".
  Default: the Ludus draft post.

.PARAMETER NoDrafts
  Build without _drafts/ (what the public site shows).

.PARAMETER SkipBuild
  Serve the existing _site/ without rebuilding.

.PARAMETER Check
  Also run html-proofer on the build (same check as CI).

.PARAMETER Stop
  Stop the preview web server and exit.

.EXAMPLE
  .\Preview-Site.ps1                       # rebuild with drafts, open the Ludus post
  .\Preview-Site.ps1 -Page /k8-range/      # rebuild, open the 3D view full screen
  .\Preview-Site.ps1 -SkipBuild -Page /    # just open the home page
  .\Preview-Site.ps1 -Check                # rebuild + html-proofer
  .\Preview-Site.ps1 -Stop                 # stop the local server
#>
[CmdletBinding()]
param(
  [string]$Page = "/2026/10/13/building-a-cyber-range-with-ludus-on-a-mini-pc.html",
  [switch]$NoDrafts,
  [switch]$SkipBuild,
  [switch]$Check,
  [switch]$Stop
)

$ErrorActionPreference = "Stop"
$site = $PSScriptRoot
$port = 4100
$base = "http://127.0.0.1:$port"

function Get-ServerPid {
  $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($conn) { return $conn.OwningProcess } else { return $null }
}

if ($Stop) {
  $serverPid = Get-ServerPid
  if ($serverPid) { Stop-Process -Id $serverPid -Force; Write-Host "Stopped preview server (pid $serverPid)." }
  else { Write-Host "No preview server is listening on port $port." }
  return
}

if (-not $SkipBuild) {
  # 1. Docker Desktop must be up for the build container.
  $dockerOk = $false
  try { docker info --format '{{.ServerVersion}}' *> $null; $dockerOk = ($LASTEXITCODE -eq 0) } catch {}
  if (-not $dockerOk) {
    $exe = "$env:LOCALAPPDATA\Programs\DockerDesktop\Docker Desktop.exe"
    if (-not (Test-Path $exe)) { $exe = "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe" }
    Write-Host "Docker daemon not running; starting Docker Desktop..."
    Start-Process $exe
    $deadline = (Get-Date).AddMinutes(3)
    do {
      Start-Sleep -Seconds 3
      try { docker info --format '{{.ServerVersion}}' *> $null; $dockerOk = ($LASTEXITCODE -eq 0) } catch {}
    } until ($dockerOk -or (Get-Date) -gt $deadline)
    if (-not $dockerOk) { throw "Docker Desktop did not come up within 3 minutes." }
  }

  # 2. Build in the ruby:3.4 image. SECURITY_FEEDS=off skips the homepage feed
  #    fetch so the build works offline; CI fetches them for the real site.
  $drafts = if ($NoDrafts) { "" } else { "--drafts" }
  $cmd = "bundle install --quiet && bundle exec jekyll build $drafts"
  if ($Check) { $cmd += " && bundle exec htmlproofer ./_site --disable-external --ignore-urls '/pagefind/'" }
  Write-Host "Building site in Docker ($(if ($NoDrafts) {'published posts only'} else {'with drafts'}))..."
  docker run --rm -v "${site}:/srv" -v k8-blog-gems:/usr/local/bundle -w /srv -e SECURITY_FEEDS=off ruby:3.4 bash -c $cmd
  if ($LASTEXITCODE -ne 0) { throw "Jekyll build failed (exit $LASTEXITCODE)." }
}

# 3. Serve _site/ on localhost only.
if (-not (Get-ServerPid)) {
  Write-Host "Starting preview server on $base ..."
  Start-Process -WindowStyle Hidden python -ArgumentList "-I", "-m", "http.server", "$port", "--bind", "127.0.0.1", "--directory", (Join-Path $site "_site")
  Start-Sleep -Seconds 2
} else {
  Write-Host "Preview server already running on $base"
}

# 4. Open the page.
$url = "$base$Page"
Write-Host "Opening $url"
Start-Process $url
Write-Host "`nRebuild after edits:   .\Preview-Site.ps1            (server keeps running)"
Write-Host "Stop the server:       .\Preview-Site.ps1 -Stop"
