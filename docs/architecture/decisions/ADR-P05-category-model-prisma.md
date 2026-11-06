# ADR-P05: Modelo Category en PostgreSQL mediante Prisma

## Metadatos

| Campo | Valor |
|-------|-------|
| Identificador | ADR-P05 |
| Título | Crear el modelo Category en PostgreSQL mediante Prisma |
| Estado | ACCEPTED (arquitectura) / PENDING (implementación) |
| Fecha | 2026-11-05 |
| Autores | Equipo de arquitectura Portal San Pablo |

## Contexto

Actualmente no existe un modelo `Category` en PostgreSQL. Las categorías solo existen en la base de datos SQLite de Payload CMS (`payload.db`). La tabla `Product` en PostgreSQL almacena el nombre de la categoría como un campo de texto libre (`categoryName String?`), sin relación formal ni integridad referencial.

La arquitectura acordada (ADR-01) establece que PostgreSQL es la base de datos central del catálogo. Por tanto, las categorías deben tener su propia tabla en PostgreSQL, accesible a través de NestJS/Prisma.

## Problema

Sin un modelo `Category` en PostgreSQL:

1. No hay integridad referencial entre productos y categorías.
2. No se puede garantizar que el `categoryName` de un producto coincida con una categoría real.
3. No es posible consultar productos por categoría de forma eficiente y confiable.
4. Next.js no puede obtener categorías a través de NestJS (viola ADR-P01).

## Alternativas consideradas

| Alternativa | Descripción | Ventajas | Desventajas |
|-------------|-------------|----------|-------------|
| A. Mantener `categoryName` como texto libre | Sin cambios en Prisma | Sin migración inmediata | Sin integridad referencial; datos inconsistentes |
| B. Crear modelo `Category` en Prisma y tabla en PostgreSQL | Nueva tabla con FK desde `Product` | Integridad referencial; consultas eficientes; arquitectura limpia | Requiere migración de Prisma; datos existentes necesitan conversión |

## Decisión

**ADR-P05 (ACEPTADO):** Crear el modelo `Category` en PostgreSQL mediante Prisma, con una tabla propia que almacene las categorías del catálogo.

## Justificación

- Cumple ADR-01 (PostgreSQL como base central del catálogo).
- Permite integridad referencial mediante clave foránea.
- Facilita consultas de productos filtrados por categoría.
- Habilita la arquitectura desacoplada donde NestJS es la API central.

## Consecuencias

### Positivas

- Integridad referencial garantizada por PostgreSQL.
- Consultas eficientes: `Product` filtrado por `categoryId`.
- Catálogo normalizado: nombre y slug de categoría en una sola tabla.

### Negativas / Trade-offs

- Requiere una migración de Prisma para crear la tabla `Category`.
- Los productos existentes con `categoryName` necesitan ser mapeados a categorías existentes o crearse categorías nuevas.
- Complejidad adicional en la sincronización Payload → NestJS (debe sincronizar categorías antes de productos).

## Decisiones técnicas que necesitan validación

1. ¿Qué campos incluir en el modelo `Category` (id, payloadId, name, slug, description, createdAt, updatedAt)?
2. ¿Se mantiene `categoryName` en `Product` por retrocompatibilidad o se elimina tras la migración?
3. ¿Se agrega índice en `Category.slug` y `Category.payloadId`?

---

**Estado del diseño:** PENDIENTE de validación del equipo antes de implementar.

---

## Esquema Prisma propuesto (solo documentación, no se modifica código)

```prisma
model Category {
  id        Int      @id @default(autoincrement())
  payloadId Int      @unique
  name      String
  slug      String   @unique
  description String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  products  Product[]

  @@index([payloadId])
  @@index([slug])
}

model Product {
  id        Int      @id @default(autoincrement())
  payloadId Int      @unique
  title     String
  slug      String   @unique
  isbn      String
  author    String
  price     Int
  categoryId  Int?
  category    Category? @relation(fields: [categoryId], references: [id])
  categoryName String?
  // ... otros campos existentes ...
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status])
  @@index([isNew])
  @@index([createdAt])
  @@index([categoryId])
}
```
