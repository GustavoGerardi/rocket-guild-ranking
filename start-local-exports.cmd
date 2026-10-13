@echo off
setlocal
cd /d "%~dp0"
node --experimental-strip-types scripts/local-exports/start.ts %*
pause
