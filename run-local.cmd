@echo off
cd /d "%~dp0"
where python >nul 2>nul
if %errorlevel%==0 (
  start "ICT600 Revision Hub" http://localhost:8000
  python -m http.server 8000 --directory site
) else (
  echo Python is not available. Install Python, or upload this folder to GitHub Pages.
  pause
)
