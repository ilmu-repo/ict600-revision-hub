$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $projectRoot
Start-Process "http://localhost:8000"
python -m http.server 8000 --directory site
