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

## Decisiones pendientes de aprobación

| ID | Título | Estado | Resumen |
|----|--------|--------|---------|
| — | — | — | No hay decisiones pendientes en este momento |

Todas las decisiones identificadas hasta la fecha han sido aprobadas (ADR-P01 a ADR-P04).

## Cómo agregar una nueva decisión

1. Crea un archivo `ADR-NNN-titulo.md` en esta carpeta, siguiendo la convención de nombres.
2. Incluye las secciones: Metadatos, Contexto, Problema, Alternativas consideradas, Decisión, Justificación, Consecuencias, Riesgos, Decisiones técnicas que necesitan diseño detallado.
3. Marca el estado como `PENDING` hasta que sea aprobada, luego cambia a `ACCEPTED` o `REJECTED`.
4. Actualiza este README con la entrada en la tabla correspondiente.
