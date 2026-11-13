@echo off
set PGPASSWORD=postgres
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -p 5433 -U postgres -d sanpablo -f "C:\dev\SanPablo\backups\categorias-20261113-081108\delete-postgres-categorias.sql"
