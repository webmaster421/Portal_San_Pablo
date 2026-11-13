@echo off
set PGPASSWORD=postgres
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -p 5433 -U postgres -d sanpablo -f "C:\dev\SanPablo\apps\cms\scripts\check_categories.sql"
