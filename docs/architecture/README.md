# Documentación de Arquitectura — Portal San Pablo

Esta carpeta contiene la documentación formal de arquitectura del proyecto Portal San Pablo, organizada según una metodología que separa el espacio del problema del espacio de solución.

## Estructura

| Archivo / Carpeta | Descripción |
|-------------------|-------------|
| `01-problem-space.md` | Espacio del problema: dominio, actores, límites del sistema, contexto de negocio |
| `02-requirements.md` | Requisitos funcionales y no funcionales |
| `03-solution-architecture.md` | Arquitectura de solución: componentes, relaciones, patrones, decisiones |
| `04-quality-attributes.md` | Atributos de calidad: desempeño, seguridad, disponibilidad, mantenibilidad, etc. |
| `decisions/` | Decision Records (ADR) de decisiones arquitectónicas tomadas y pendientes |
| `diagrams/` | Diagramas C4 y de secuencia de flujos importantes |

## Estado actual del proyecto

El proyecto es un monorepo (pnpm) con tres aplicaciones:

| App | Tecnología | Puerto | Rol | Base de datos |
|-----|-----------|--------|-----|---------------|
| `apps/web` | Next.js 16 | 3000 (por defecto) | Storefront | Ninguna (consume APIs) |
| `apps/api` | NestJS 11 + Prisma | 3002 | Backend central | PostgreSQL (`sanpablo`) |
| `apps/cms` | Payload CMS 3.90 | 3001 | Administración del catálogo | SQLite (`payload.db`) |

### Arquitectura acordada (pendiente de implementación completa)

1. **Payload CMS (SQLite)** → API NestJS protegida con HMAC → Prisma → **PostgreSQL** (base central).
2. Payload puede conservar SQLite para su funcionamiento interno, pero cada producto creado, actualizado o eliminado debe sincronizarse con PostgreSQL.
3. **Next.js debe consumir NestJS como API central** (actualmente consume directamente de Payload CMS).

### Problemas críticos identificados (estado actual)

- La sincronización Payload → NestJS tenía un fallo en el hook `afterChange` (usaba `data.id` en lugar de `doc.id` en creación, resultando en `payloadId: undefined`). Ya fue corregido y validado mediante prueba de extremo a extremo.
- El storefront (Next.js) consume productos directamente de Payload CMS, no de NestJS. **Decisión ADR-P01 aprobada:** cambiará para consumir NestJS como API central.
- Los endpoints de escritura de NestJS (`POST/PATCH/DELETE /products`) no tienen autenticación. **Decisión ADR-P02 aprobada:** se protegerán con autenticación y autorización.
- No existe mecanismo de reintento diferido si NestJS o PostgreSQL están caídos al crear un producto en Payload. **Decisión ADR-P04 aprobada:** se implementará cola persistente de sincronización pendiente.
- El endpoint `DELETE /products/:id` de NestJS realiza hard delete físico, inconsistente con la estrategia de soft delete. **Decisión ADR-P03 aprobada:** se cambiará a eliminación lógica.

## Decisiones arquitectónicas aprobadas recientemente

| ID | Decisión | Estado | Archivo |
|----|----------|--------|---------|
| ADR-P01 | Next.js consumirá NestJS como API central | ACCEPTED | `decisions/ADR-P01-nextjs-consumes-nestjs.md` |
| ADR-P02 | Autenticación y autorización en endpoints de escritura de NestJS | ACCEPTED | `decisions/ADR-P02-auth-write-endpoints.md` |
| ADR-P03 | Eliminación lógica de productos (soft delete) | ACCEPTED | `decisions/ADR-P03-logical-deletion.md` |
| ADR-P04 | Mecanismo persistente de sincronización pendiente | ACCEPTED | `decisions/ADR-P04-pending-sync-queue.md` |

## Convenciones

- **Hechos comprobados**: verificados mediante lectura de código y pruebas de ejecución real.
- **Decisiones acordadas**: establecidas por el equipo y documentadas como ADR.
- **Hipótesis**: no verificadas, marcadas explícitamente.
