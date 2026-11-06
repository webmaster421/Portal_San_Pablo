# ADR-P06: Relacionar Product con Category mediante categoryId

## Metadatos

| Campo | Valor |
|-------|-------|
| Identificador | ADR-P06 |
| Título | Relacionar Product con Category mediante categoryId |
| Estado | ACCEPTED (arquitectura) / PENDING (implementación) |
| Fecha | 2026-11-05 |
| Autores | Equipo de arquitectura Portal San Pablo |

## Contexto

Actualmente, la tabla `Product` en PostgreSQL almacena el nombre de la categoría como `categoryName String?`, un campo de texto libre sin relación formal. En Payload CMS, la colección `Products` tiene una relación formal (`type: "relationship"`, `relationTo: "categories"`) con la colección `categories` de SQLite.

La arquitectura acordada requiere que PostgreSQL sea la base de datos central del catálogo, con relaciones formales entre entidades.

## Problema

1. `categoryName` es texto libre: no hay garantía de que coincida con una categoría existente.
2. No hay clave foránea: no se puede aplicar `ON DELETE RESTRICT` ni consultas con JOIN eficientes.
3. Los productos no están formalmente agrupados por categoría en PostgreSQL.

## Alternativas consideradas

| Alternativa | Descripción | Ventajas | Desventajas |
|-------------|-------------|----------|-------------|
| A. Mantener `categoryName` como texto | Sin relación formal | Sin cambios en esquema actual | Sin integridad referencial; consultas ineficientes |
| B. Agregar `categoryId` como FK opcional | `categoryId Int?` con relación a `Category` | Integridad referencial; permite migración gradual | Requiere lógica para manejar productos sin categoría |
| C. Agregar `categoryId` como FK obligatorio | `categoryId Int` NOT NULL | Máxima integridad; todo producto tiene categoría | Requiere que todos los productos existentes tengan categoría asignada antes de aplicar |

## Decisión

**ADR-P06 (ACEPTADO):** Agregar `categoryId` como clave foránea opcional (`Int?`) en el modelo `Product`, con relación `@relation(fields: [categoryId], references: [id])` al modelo `Category`.

## Justificación

- Permite migración gradual: los productos existentes pueden tener `categoryId` nulo inicialmente.
- Integridad referencial cuando `categoryId` esté presente.
- Compatible con la estrategia de `categoryId` nullable durante la migración (ADR-P08).

## Consecuencias

### Positivas

- Integridad referencial para productos que tienen categoría asignada.
- Consultas eficientes: `Product.where({ categoryId })`.
- Posibilidad de aplicar `ON DELETE RESTRICT` en la relación (ADR-P09).

### Negativas / Trade-offs

- Productos sin `categoryId` no aparecen en consultas filtradas por categoría.
- Requiere lógica de aplicación para manejar productos sin categoría (ej. mostrar como "Sin categoría").

## Decisiones técnicas que necesitan validación

1. ¿Se mantiene el campo `categoryName` por retrocompatibilidad o se elimina tras la migración completa?
2. ¿Qué valor predeterminado se asigna a `categoryId` para productos existentes sin categoría?
3. ¿Se agrega un índice en `Product.categoryId`?

---

**Estado del diseño:** PENDIENTE de validación del equipo antes de implementar.

---

## Esquema de relación propuesto (documentación)

```prisma
model Product {
  // ... campos existentes ...
  categoryId  Int?
  category    Category? @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  
  // categoryName se mantiene temporalmente para retrocompatibilidad
  categoryName String?
}
```
