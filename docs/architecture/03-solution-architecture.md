# 03. Arquitectura de Solución

## Visión general

El proyecto sigue una arquitectura de tres aplicaciones desacopladas con una base de datos central (PostgreSQL) y una base de datos administrativa (SQLite para Payload CMS).

```
┌─────────────┐      HTTP/REST       ┌──────────────┐      HTTP/REST + HMAC      ┌─────────────┐
│   Next.js   │ ───────────────────► │   NestJS     │ ─────────────────────────► │  Payload    │
│  (Storefront│      api/v1          │   (API)      │      POST /sync/products   │    CMS      │
│   apps/web) │◄─────────────────────│   Port 3002  │◄────────── PATCH /sync     │   Port 3001 │
│             │                      │              │      /products/:id/deact.  │             │
└─────────────┘                      └──────┬───────┘                      └───────┬───────────┘
                                           │                                      │
                                           │ Prisma                               │ SQLite
                                           ▼                                      ▼
                                    ┌─────────────┐                      ┌──────────────┐
                                    │  PostgreSQL │                      │  payload.db  │
                                    │   (Central) │                      │   (Payload)  │
                                    │   Port 5433 │                      │              │
                                    └─────────────┘                      └──────────────┘
```

## Componentes y responsabilidades

### 1. Next.js — Storefront (`apps/web`)
- **Ruta:** `http://localhost:3000` (por defecto)
- **Responsabilidad:** Interfaz de cliente para consultar productos y categorías.
- **Estado actual:** Consume directamente de Payload CMS (`CMS_URL=http://localhost:3001`).  
- **Estado requerido:** Debe consumir de NestJS (`http://localhost:3002/api/v1/products`).
- **Base de datos:** Ninguna.

### 2. NestJS — API Central (`apps/api`)
- **Ruta:** `http://localhost:3002`
- **Prefijo global:** `api/v1`
- **Responsabilidad:** API central del catálogo. Expone endpoints para consultar, crear, actualizar y desactivar productos. Recibe sincronizaciones de Payload CMS protegidas por HMAC.
- **Base de datos:** PostgreSQL (`sanpablo`) vía Prisma.
- **Endpoints clave:**
  - `GET /health` — Health check con verificación de PostgreSQL.
  - `GET /products` — Lista productos (sin filtro por estado publicado actualmente).
  - `GET /products/slug/:slug` — Producto por slug.
  - `GET /products/:id` — Producto por ID interno.
  - `POST /products` — Crear producto (sin autenticación — pendiente).
  - `PATCH /products/:id` — Actualizar producto (sin autenticación — pendiente).
  - `DELETE /products/:id` — Hard delete físico (pendiente de revisar si debe ser soft delete).
  - `POST /sync/products` — Upsert idempotente desde Payload (HMAC protegido).
  - `PATCH /sync/products/:payloadId/deactivate` — Soft delete lógico desde Payload (HMAC protegido).

### 3. Payload CMS — Administración (`apps/cms`)
- **Ruta:** `http://localhost:3001`
- **Responsabilidad:** Panel de administración del catálogo. Almacena productos en SQLite internamente y los sincroniza con NestJS.
- **Base de datos:** SQLite (`apps/cms/payload.db`).
- **Colecciones:** `users`, `categories`, `media`, `products`, más tablas internas de Payload.
- **Hooks de sincronización:**
  - `afterChange` (create/update): llama a `syncProductToNestJS`.
  - `afterDelete`: llama a `deactivateProductInNestJS`.

### 4. PostgreSQL — Base de datos central
- **Host:** `localhost:5433` (mapeado vía Docker Compose `5433:5432`)
- **Base de datos:** `sanpablo`
- **Tablas:** `Product`, `BackendCheck`
- **Acceso:** Exclusivamente a través de NestJS/Prisma. Payload CMS no se conecta directamente.

### 5. SQLite — Base de datos de Payload CMS
- **Archivo:** `apps/cms/payload.db`
- **Propósito:** Almacenamiento interno de Payload (usuarios, productos, categorías, media, tablas internas de Payload).
- **Restricción:** No debe ser consultada directamente por Next.js ni NestJS.

## Patrón de comunicación

### Payload → NestJS (Sincronización)
- Protocolo: HTTP/REST
- Autenticación: HMAC-SHA256 con headers `X-Timestamp` y `X-Hmac-Signature`
- Ventana de tiempo: ±5 minutos (anti replay)
- Patrón: Upsert idempotente por `payloadId` en PostgreSQL
- Dirección: Unidireccional (Payload envía, NestJS recibe; no hay respuesta de vuelta a Payload)

### Next.js → NestJS (Consumo del storefront)
- Protocolo: HTTP/REST
- Autenticación: No definida aún (pendiente)
- Estado: **No implementado**. Actualmente Next.js consume de Payload CMS directamente.

## Decisiones arquitectónicas existentes

| ID | Decisión | Estado | Evidencia |
|----|----------|--------|-----------|
| ADR-01 | PostgreSQL como base de datos central del catálogo | Acordada | Contexto del usuario |
| ADR-02 | Payload CMS usa SQLite internamente, no se conecta a PostgreSQL | Acordada | Contexto del usuario |
| ADR-03 | Sincronización Payload → NestJS protegida con HMAC-SHA256 | Acordada | Contexto del usuario + `hmac-auth.guard.ts` |
| ADR-04 | Next.js debe consumir NestJS como API central | Acordada | Contexto del usuario |
| ADR-05 | Eliminación lógica (soft delete) de productos desde Payload | Acordada | `deactivateProductInNestJS` en `nestjs-sync.ts` |
| ADR-06 | Sincronización unidireccional (no hay ciclo NestJS → Payload) | Acordada | Comentarios en `nestjs-sync.ts` y `Products.ts` |

## Decisiones pendientes de aprobación

| ID | Decisión pendiente | Justificación | Riesgo si no se aprueba |
|----|-------------------|---------------|------------------------|
| ADR-P01 | Cambiar Next.js para consumir NestJS en lugar de Payload CMS | Cumplir arquitectura acordada | Acoplamiento directo frontend-CMS; evade capa de backend |
| ADR-P02 | Agregar autenticación a endpoints de escritura de NestJS (`POST/PATCH/DELETE /products`) | Seguridad | Cualquier usuario puede crear/modificar/borrar productos |
| ADR-P03 | Revisar si `DELETE /products/:id` debe ser soft delete en lugar de hard delete | Consistencia con estrategia de Payload | Inconsistencia: hard delete en API vs soft delete en sync |
| ADR-P04 | Implementar cola de reintento diferido para sincronización cuando NestJS esté caído | Confiabilidad | Productos pueden quedar en SQLite sin llegar a PostgreSQL |

## Límites y acoplamientos

- **Acoplado:** Next.js depende de la disponibilidad de Payload CMS (puerto 3001) para ver productos.
- **Desacoplado (deseado):** Next.js debería depender de NestJS (puerto 3002), y NestJS de PostgreSQL.
- **No permitido:** Payload CMS conectando directamente a PostgreSQL.
