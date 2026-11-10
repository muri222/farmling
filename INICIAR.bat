@echo off
cd /d "%~dp0"
if not exist node_modules\electron\dist\electron.exe (
  call npm install
  call node node_modules\electron\install.js
)
if exist dist\win-unpacked\Life.exe (start "" dist\win-unpacked\Life.exe) else (start "" node_modules\electron\dist\electron.exe .)
