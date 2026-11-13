@echo off
cd /d C:\dev\SanPablo\apps\web
C:\dev\SanPablo\apps\web\node_modules\.bin\cross-env.cmd NODE_OPTIONS=--no-deprecation C:\dev\SanPablo\apps\web\node_modules\.bin\next.cmd dev -p 3000
