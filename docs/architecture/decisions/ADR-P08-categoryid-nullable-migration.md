# ADR-P08: categoryId nullable durante la migración

## Metadatos

| Campo | Valor |
|-------|-------|
| Identificador | ADR-P08 |
| Título | Permitir categoryId nullable únicamente durante la migración y definir cómo convertirlo posteriormente en obligatorio |
| Estado | ACCEPTED (arquitectura) / PENDING (implementación) |
| Fecha | 2026-11-05 |
| Autores | Equipo de arquitectura Portal San Pablo |

## Contexto

Al agregar `categoryId` como clave foránea en `Product`, los productos existentes en PostgreSQL no tienen un valor para este campo. Si se define como NOT NULL inmediatamente, la migración fallaría porque no existen valores para los registros existentes.

## Problema

1. Los productos existentes no tienen `categoryId` asignado.
2. Definir `categoryId` como NOT NULL bloquearía la migración.
3. Es necesario un período de transición donde los productos puedan existir sin categoría asignada.

## Alternativas consideradas

| Alternativa | Descripción | Ventajas | Desventajas |
|-------------|-------------|----------|-------------|
| A. `categoryId` nullable permanentemente | `Int?` sin plan de convertir a obligatorio | Sin presión para completar la migración | Productos pueden quedarse sin categoría indefinidamente; consultas incompletas |
| B. `categoryId` nullable solo durante migración, luego NOT NULL | `Int?` temporal, luego migración para hacer obligatorio | Limpieza completa; todos los productos tienen categoría | Requiere dos migraciones; requiere asignar categoría a todos los productos existentes |
| C. `categoryId` NOT NULL con valor predeterminado | Categoría "Sin categoría" predeterminada | Migración simple; todos los productos tienen categoría | Crea una categoría artificial; puede no reflejar la realidad del negocio |

## Decisión

**ADR-P08 (ACEPTADO):** Permitir `categoryId` nullable (`Int?`) únicamente durante el período de migración. Posteriormente, se ejecutará una segunda migración para convertirlo en obligatorio (`Int` NOT NULL) después de que todos los productos existentes tengan una categoría asignada.

## Justificación

- Permite migración gradual sin bloquear el despliegue.
- No fuerza la creación de categorías artificiales.
- Proporciona un camino claro hacia un modelo de datos completo y consistente.

## Consecuencias

### Positivas

- Migración sin interrupciones del servicio.
- Flexibilidad para asignar categorías a productos existentes en etapas.
- Camino claro hacia integridad referencial completa.

### Negativas / Trade-offs

- Requiere dos migraciones en lugar de una.
- Durante el período de transición, algunos productos pueden no tener categoría.
- Las consultas filtradas por categoría no incluirán productos sin categoría asignada.

## Plan de migración (solo documentación, no se ejecuta)

### Fase 1: Migración inicial (nullable)
1. Crear tabla `Category` en PostgreSQL.
2. Agregar `categoryId Int?` a `Product` con relación opcional.
3. Sincronizar categorías existentes desde Payload a PostgreSQL.
4. Asignar `categoryId` a productos existentes basándose en `categoryName` (mapeo por nombre).

### Fase 2: Conversión a obligatorio
1. Verificar que todos los productos tengan `categoryId` asignado.
2. Ejecutar migración para cambiar `categoryId` de `Int?` a `Int` (NOT NULL).
3. Eliminar el campo `categoryName` de `Product` (opcional, tras verificar que no se usa).

## Decisiones técnicas que necesitan validación

1. ¿Cuál es el criterio para considerar que la migración está completa (todos los productos tienen categoría)?
2. ¿Quién es responsable de asignar categorías a productos existentes durante la migración?
3. ¿Se elimina `categoryName` de `Product` en la Fase 2 o se mantiene por retrocompatibilidad?

---

**Estado del diseño:** PENDIENTE de validación del equipo antes de implementar.
