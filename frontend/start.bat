@echo off
set NODE_OPTIONS=
cd /d %~dp0
node node_modules\vite\bin\vite.js --host 0.0.0.0
