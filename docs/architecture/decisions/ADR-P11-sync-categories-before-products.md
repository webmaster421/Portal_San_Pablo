# ADR-P11: Sincronizar categorías desde Payload antes de sincronizar productos

## Metadatos

| Campo | Valor |
|-------|-------|
| Identificador | ADR-P11 |
| Título | Sincronizar categorías desde Payload antes de sincronizar los productos que las utilizan |
| Estado | ACCEPTED (arquitectura) / PENDING (implementación) |
| Fecha | 2026-11-05 |
| Autores | Equipo de arquitectura Portal San Pablo |

## Contexto

La sincronización Payload → NestJS es unidireccional. Los productos en PostgreSQL referencian categorías mediante `categoryId` (clave foránea). Si un producto se sincroniza antes que su categoría, la inserción fallaría porque la categoría referenciada no existe en PostgreSQL.

## Problema

1. `Product.categoryId` es una clave foránea a `Category.id`.
2. Si un producto se sincroniza con `categoryId` apuntando a una categoría que aún no existe en PostgreSQL, Prisma lanzará un error de clave foránea (P2003).
3. El orden de sincronización importa para mantener la integridad referencial.

## Alternativas consideradas

| Alternativa | Descripción | Ventajas | Desventajas |
|-------------|-------------|----------|-------------|
| A. Sincronizar categorías antes que productos | Procesar outbox de categorías primero | No hay errores de clave foránea; orden lógico | Requiere control del orden de procesamiento del outbox |
| B. Sincronizar productos primero, permitir categoryId nulo | Productos sin categoría se sincronizan primero; se actualizan después | Más simple de implementar | Productos pueden quedar temporalmente sin categoría; requiere segunda pasada |
| C. Sincronizar en paralelo, ignorar errores de FK | Ambos tipos de sincronización en paralelo | Máximo paralelismo | Errores de clave foránea; datos inconsistentes |

## Decisión

**ADR-P11 (ACEPTADO):** Sincronizar categorías desde Payload antes de sincronizar los productos que las utilizan. El worker de procesamiento del outbox (ADR-P04) debe priorizar registros de operación `'create'` y `'update'` de categorías sobre productos.

## Justificación

- Garantiza integridad referencial: las categorías existen en PostgreSQL antes que los productos que las referencian.
- Evita errores de clave foránea (P2003) durante la sincronización.
- Orden lógico: entidad padre antes que entidad hija.

## Implementación en el worker de outbox (ADR-P04)

El worker debe procesar el outbox en este orden:

1. Todas las operaciones pendientes de categorías (`operation IN ('create', 'update', 'delete')`).
2. Todas las operaciones pendientes de productos (`operation IN ('create', 'update', 'delete')`).

Alternativamente, se puede usar una cola por tipo de entidad con prioridad.

## Decisiones técnicas que necesitan validación

1. ¿El worker procesa categorías y productos en colas separadas o en una sola cola con prioridad?
2. ¿Qué sucede si una categoría fallá al sincronizar: se bloquean los productos que dependen de ella?
3. ¿Se reintenta automáticamente la sincronización de productos después de que su categoría se sincronice exitosamente?

---

**Estado del diseño:** PENDIENTE de validación del equipo antes de implementar.
