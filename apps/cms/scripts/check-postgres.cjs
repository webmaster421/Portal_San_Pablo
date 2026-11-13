@echo off
set PGPASSWORD=postgres
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -p 5433 -U postgres -d sanpablo -c "SELECT \"id\", \"payloadId\", \"name\", \"slug\", \"imageUrl\", \"active\", \"featured\", \"order\" FROM \"Category\" ORDER BY \"id\";"
