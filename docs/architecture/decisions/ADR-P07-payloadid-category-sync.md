# ADR-P07: payloadId para identificación de categorías en sincronización

## Metadatos

| Campo | Valor |
|-------|-------|
| Identificador | ADR-P07 |
| Título | Utilizar payloadId para identificar categorías durante la sincronización entre bases de datos |
| Estado | ACCEPTED (arquitectura) / PENDING (implementación) |
| Fecha | 2026-11-05 |
| Autores | Equipo de arquitectura Portal San Pablo |

## Contexto

La sincronización Payload → NestJS utiliza `payloadId` como identificador único de productos (campo `payloadId` en la tabla `Product` de PostgreSQL, único y NOT NULL). Para las categorías, se aplicará el mismo patrón: cada categoría en Payload tiene un `id` interno de SQLite que se mapeará a `payloadId` en la tabla `Category` de PostgreSQL.

## Problema

1. Las categorías en SQLite (Payload) y en PostgreSQL (NestJS) tienen identificadores independientes (`id` en SQLite vs `id` en PostgreSQL).
2. Sin un identificador común, no es posible hacer upsert idempotente de categorías durante la sincronización.
3. No se puede vincular productos a categorías correctamente si los IDs no coinciden entre ambas bases.

## Alternativas consideradas

| Alternativa | Descripción | Ventajas | Desventajas |
|-------------|-------------|----------|-------------|
| A. Usar `name` o `slug` como identificador | Coincidir categorías por nombre o slug | No requiere campo adicional | Nombres pueden cambiar; slugs pueden duplicarse si no hay control; no es idempotente ante renombrado |
| B. Usar `payloadId` como identificador único | Campo `payloadId Int @unique` en `Category` | Idempotente; estable ante cambios de nombre/slug; patrón consistente con productos | Requiere campo adicional en la tabla `Category` |

## Decisión

**ADR-P07 (ACEPTADO):** Utilizar `payloadId` como identificador único para las categorías durante la sincronización entre SQLite (Payload) y PostgreSQL (NestJS). El campo `payloadId` en `Category` será `Int @unique`.

## Justificación

- Patrón consistente con la sincronización de productos (ADR-P01, sync existente).
- Idempotente: el mismo `payloadId` siempre se refiere a la misma categoría, incluso si cambia nombre o slug.
- Permite upsert (`create` o `update`) sin duplicar registros.

## Consecuencias

### Positivas

- Sincronización idempotente de categorías.
- Estable ante cambios de nombre o slug en Payload.
- Patrón consistente con productos en toda la arquitectura.

### Negativas / Trade-offs

- Campo adicional en la tabla `Category`.
- Requiere que cada categoría en Payload tenga un `id` numérico que se mapee a `payloadId`.

## Decisiones técnicas que necesitan validación

1. ¿El campo `payloadId` en `Category` será NOT NULL?
2. ¿Se agrega índice único en `Category.payloadId`?
3. ¿Qué sucede si una categoría se crea directamente en PostgreSQL (sin pasar por Payload)?

---

**Estado del diseño:** PENDIENTE de validación del equipo antes de implementar.

---

## Esquema propuesto para Category (documentación)

```prisma
model Category {
  id        Int      @id @default(autoincrement())  // ID interno de PostgreSQL
  payloadId Int      @unique                        // ID de origen en SQLite (Payload)
  name      String
  slug      String   @unique
  description String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  products  Product[]

  @@index([payloadId])
  @@index([slug])
}
```
