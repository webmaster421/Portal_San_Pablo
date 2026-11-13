@echo off
set PGPASSWORD=postgres
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -p 5433 -U postgres -d sanpablo -c "UPDATE \"Product\" SET \"categoryId\" = 25 WHERE \"payloadId\" = 1;" -c "SELECT \"id\", \"payloadId\", \"title\", \"categoryId\", \"categoryName\" FROM \"Product\" WHERE \"payloadId\" = 1;"
