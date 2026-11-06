# ADR-P09: Impedir eliminar categorías con productos asociados

## Metadatos

| Campo | Valor |
|-------|-------|
| Identificador | ADR-P09 |
| Título | Impedir eliminar categorías con productos asociados mediante validación en NestJS y restricción ON DELETE RESTRICT en PostgreSQL |
| Estado | ACCEPTED (arquitectura) / PENDING (implementación) |
| Fecha | 2026-11-05 |
| Autores | Equipo de arquitectura Portal San Pablo |

## Contexto

La arquitectura acordada requiere que una categoría no pueda eliminarse mientras tenga productos relacionados. Actualmente, no existe tal restricción en PostgreSQL ni en la API de NestJS, ya que no existe una relación formal entre `Product` y `Category`.

## Problema

1. Sin restricción, una categoría podría eliminarse mientras productos aún la referencien (por `categoryName` o futuro `categoryId`).
2. Esto dejaría datos huérfanos o inconsistentes.
3. No hay mecanismo para impedir la eliminación accidental de categorías en uso.

## Alternativas consideradas

| Alternativa | Descripción | Ventajas | Desventajas |
|-------------|-------------|----------|-------------|
| A. Solo validación en NestJS (aplicación) | Verificar en el servicio antes de eliminar | Fácil de implementar; mensaje de error personalizable | No protege contra eliminaciones directas en la base de datos; condición de carrera posible |
| B. Solo ON DELETE RESTRICT en PostgreSQL (base de datos) | FK con `onDelete: Restrict` | Protege a nivel de base de datos; imposible violar | Error de base de datos menos descriptivo; no cubre el caso de soft delete (visible=false) |
| C. Ambas: validación en NestJS + ON DELETE RESTRICT | Capa de aplicación + capa de base de datos | Máxima protección; mensaje claro para API; integridad a nivel de BD | Código duplicado (validación en dos capas) |

## Decisión

**ADR-P09 (ACEPTADO):** Impedir eliminar categorías con productos asociados mediante:
1. **Validación en NestJS** (capa de aplicación): verificar que no existan productos asociados antes de permitir la eliminación.
2. **Restricción `ON DELETE RESTRICT` en PostgreSQL** (capa de base de datos): la clave foránea `Product.categoryId → Category.id` definirá `onDelete: Restrict`.

## Justificación

- Defensa en profundidad: si falla una capa, la otra aún protege los datos.
- Mensaje de error claro y descriptivo desde NestJS para el cliente de la API.
- Integridad garantizada a nivel de base de datos contra eliminaciones directas o errores de aplicación.

## Consecuencias

### Positivas

- No es posible eliminar una categoría que tenga productos asociados, ni desde la API ni directamente en la base de datos.
- Mensajes de error claros para el desarrollador del frontend.
- Integridad referencial garantizada por PostgreSQL.

### Negativas / Trade-offs

- Los usuarios deben desasignar o reasignar productos antes de eliminar una categoría.
- Requiere lógica adicional en el frontend para manejar el error de eliminación bloqueada.

## Reglas de negocio

| Escenario | Comportamiento |
|-----------|---------------|
| Eliminar categoría con 0 productos | Permitido (soft delete o hard delete según ADR-P03) |
| Eliminar categoría con ≥ 1 producto | Rechazado con error 409 Conflict |
| Desactivar categoría (visible=false) | Permitido; no afecta a productos asociados |
| Eliminar producto de una categoría | Permitido; el producto queda sin categoría (categoryId=null) |

## Decisiones técnicas que necesitan validación

1. ¿La eliminación de categoría es soft delete (visible=false) o hard delete (borrado físico)?
2. ¿Qué mensaje de error exacto se devuelve al intentar eliminar una categoría con productos?
3. ¿Se permite desactivar (visible=false) una categoría con productos asociados?

---

**Estado del diseño:** PENDIENTE de validación del equipo antes de implementar.

---

## Esquema de restricción propuesto (documentación)

```prisma
model Category {
  id        Int      @id @default(autoincrement())
  // ... otros campos ...
  products  Product[]
}

model Product {
  // ... otros campos ...
  categoryId  Int?
  category    Category? @relation(fields: [categoryId], references: [id], onDelete: Restrict)
}
```
