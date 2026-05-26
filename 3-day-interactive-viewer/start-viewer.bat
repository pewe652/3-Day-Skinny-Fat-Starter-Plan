@echo off
setlocal
cd /d "%~dp0"
start "" "http://127.0.0.1:4177/"
"C:\Users\desktop\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" -m http.server 4177 --bind 127.0.0.1
