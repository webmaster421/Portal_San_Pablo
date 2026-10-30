# Portal San Pablo — API (NestJS)

Backend inicial del e-commerce de San Pablo, construido con NestJS + Prisma + PostgreSQL.

## 1. Requisitos previos

- Node.js >= 20.18.1
- pnpm >= 9 || ^10 || ^11
- Docker + Docker Compose (para PostgreSQL local)

## 2. Instalación de dependencias

Desde la raíz del monorepo:

```bash
pnpm install
```

## 3. Configuración de variables de entorno

Archivo: `apps/api/.env.example`

```env
PORT=3000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE?schema=public"
```

Copiar a `apps/api/.env` con los valores locales.

## 4. Inicio de PostgreSQL

```bash
docker compose up -d postgres
docker compose ps
docker compose logs -f postgres
```

## 5. Ejecución de migraciones

```bash
pnpm --filter @portal/api exec prisma migrate dev --name init
pnpm --filter @portal/api exec prisma migrate deploy
pnpm --filter @portal/api exec prisma generate
```

## 6. Inicio de NestJS

```bash
pnpm --filter @portal/api dev
# o
pnpm --filter @portal/api start
```

## 7. Comprobación del endpoint de salud

```bash
curl -i http://localhost:3000/api/v1/health
```

Respuesta esperada con base de datos disponible:

```json
{
  "status": "ok",
  "info": { "database": { "status": "up" } }
}
```

Si la base de datos no está disponible responde `503 Service Unavailable`.

## 8. Ejecución de pruebas

```bash
pnpm --filter @portal/api test
```

## 9. Detención de los servicios

```bash
# Detener la API (Ctrl+C en el proceso de dev)
# Detener PostgreSQL
docker compose stop postgres
docker compose down
```

## 10. Problemas frecuentes

- Si `nest build` falla: revisar `apps/api/tsconfig.json` y `nest-cli.json`.
- Si Prisma no conecta: verificar `DATABASE_URL` y que PostgreSQL esté arriba.
- Si el health devuelve 503: PostgreSQL no está disponible o el schema no está migrado.

> Nota: esta fase crea solo la infraestructura inicial. Los modelos de negocio y la
> integración con Payload/PostgreSQL se incorporarán en fases posteriores.
