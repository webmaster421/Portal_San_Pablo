# Decision Records (ADR)

Esta carpeta contiene los registros de decisiones arquitectónicas del proyecto Portal San Pablo.

## Convención de nombres

Todos los archivos de decisión siguen el formato `ADR-<NNN>-<titulo-kebab-case>.md`, donde `<NNN>` es un identificador secuencial y `<titulo-kebab-case>` es una versión corta del título en minúsculas con guiones.

## Decisiones acordadas (aprobadas / ACCEPTED)

| ID | Título | Estado | Resumen | Archivo |
|----|--------|--------|---------|---------|
| ADR-01 | PostgreSQL como base de datos central del catálogo | Aprobada | Base central de productos; Prisma como ORM | — |
| ADR-02 | Payload CMS con SQLite interno, sin conexión directa a PostgreSQL | Aprobada | Payload usa su propia BD; se comunica con NestJS vía API | — |
| ADR-03 | Sincronización Payload → NestJS protegida con HMAC-SHA256 | Aprobada | Headers `X-Timestamp` y `X-Hmac-Signature`; ventana ±5 min | — |
| ADR-04 | Next.js debe consumir NestJS como API central | Aprobada | Arquitectura acordada; pendiente de implementar | — |
| ADR-05 | Eliminación lógica (soft delete) de productos desde Payload | Aprobada | `visible=false`, `status='draft'` en PostgreSQL | — |
| ADR-06 | Sincronización unidireccional Payload → NestJS | Aprobada | No hay ciclo de NestJS de vuelta a Payload | — |
| ADR-P01 | Next.js consumirá NestJS como API central | ACCEPTED | Reemplaza el consumo directo de Payload CMS desde el storefront | `ADR-P01-nextjs-consumes-nestjs.md` |
| ADR-P02 | Autenticación y autorización en endpoints de escritura de NestJS | ACCEPTED | Protege `POST/PATCH/DELETE /products`; lectura pública limitada | `ADR-P02-auth-write-endpoints.md` |
| ADR-P03 | Eliminación lógica de productos (soft delete) | ACCEPTED | No se permite eliminación física en endpoints ordinarios del catálogo | `ADR-P03-logical-deletion.md` |
| ADR-P04 | Mecanismo persistente de sincronización pendiente | ACCEPTED | Reintentos diferidos, registro de errores y reconciliación Payload → PostgreSQL | `ADR-P04-pending-sync-queue.md` |
| ADR-P05 | Modelo Category en PostgreSQL mediante Prisma | ACCEPTED | Nueva tabla `Category` con clave foránea desde `Product` | `ADR-P05-category-model-prisma.md` |
| ADR-P06 | Relacionar Product con Category mediante categoryId | ACCEPTED | `categoryId Int?` como FK opcional en `Product` | `ADR-P06-product-category-relationship.md` |
| ADR-P07 | payloadId para identificación de categorías en sync | ACCEPTED | Campo `payloadId Int @unique` en `Category` para upsert idempotente | `ADR-P07-payloadid-category-sync.md` |
| ADR-P08 | categoryId nullable durante la migración | ACCEPTED | `Int?` temporal, luego se convierte a obligatorio tras asignar categorías | `ADR-P08-categoryid-nullable-migration.md` |
| ADR-P09 | Impedir eliminar categorías con productos asociados | ACCEPTED | Validación en NestJS + `ON DELETE RESTRICT` en PostgreSQL | `ADR-P09-prevent-delete-category-with-products.md` |
| ADR-P10 | Módulo independiente categories en NestJS | ACCEPTED | `CategoriesModule` con controlador, servicio y DTOs propios | `ADR-P10-categories-module-nestjs.md` |
| ADR-P11 | Sincronizar categorías antes de productos | ACCEPTED | Worker de outbox procesa categorías antes que productos | `ADR-P11-sync-categories-before-products.md` |
| ADR-P12 | Next.js consulta categorías vía NestJS | ACCEPTED | `getCategories()` llama a `GET /api/v1/categories` de NestJS | `ADR-P12-nextjs-categories-via-nestjs.md` |

## Decisiones pendientes de aprobación

| ID | Título | Estado | Resumen |
|----|--------|--------|---------|
| — | — | — | No hay decisiones pendientes en este momento |

Todas las decisiones identificadas hasta la fecha han sido aprobadas (ADR-P01 a ADR-P12).

## Cómo agregar una nueva decisión

1. Crea un archivo `ADR-NNN-titulo.md` en esta carpeta, siguiendo la convención de nombres.
2. Incluye las secciones: Metadatos, Contexto, Problema, Alternativas consideradas, Decisión, Justificación, Consecuencias, Riesgos, Decisiones técnicas que necesitan diseño detallado.
3. Marca el estado como `PENDING` hasta que sea aprobada, luego cambia a `ACCEPTED` o `REJECTED`.
4. Actualiza este README con la entrada en la tabla correspondiente.
