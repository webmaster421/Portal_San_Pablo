# ADR-P10: Módulo independiente categories en NestJS

## Metadatos

| Campo | Valor |
|-------|-------|
| Identificador | ADR-P10 |
| Título | Crear un módulo independiente categories en NestJS |
| Estado | ACCEPTED (arquitectura) / PENDING (implementación) |
| Fecha | 2026-11-05 |
| Autores | Equipo de arquitectura Portal San Pablo |

## Contexto

Actualmente, NestJS tiene un módulo `ProductModule` que maneja productos y sincronización. No existe un módulo dedicado para categorías. Las operaciones de categorías deberían estar encapsuladas en su propio módulo para mantener la separación de preocupaciones y seguir el patrón establecido en el resto de la API.

## Problema

1. Las operaciones de categorías mezcladas con productos harían el módulo `ProductModule` demasiado grande y con responsabilidades mixtas.
2. No hay lugar claro para los endpoints, servicios y DTOs de categorías.
3. La sincronización de categorías desde Payload necesita su propio controlador y servicio protegidos por HMAC.

## Alternativas consideradas

| Alternativa | Descripción | Ventajas | Desventajas |
|-------------|-------------|----------|-------------|
| A. Agregar categorías a ProductModule existente | Todo en un solo módulo | Menos archivos nuevos | Módulo con responsabilidades mezcladas; difícil de mantener |
| B. Crear módulo `CategoriesModule` independiente | Módulo dedicado para categorías | Separación de preocupaciones; código más mantenible; fácil de testear | Más archivos y configuración |

## Decisión

**ADR-P10 (ACEPTADO):** Crear un módulo independiente `CategoriesModule` en NestJS para manejar todas las operaciones relacionadas con categorías (CRUD, sincronización, validación de eliminación).

## Justificación

- Separación de preocupaciones: categorías y productos son entidades distintas con ciclos de vida diferentes.
- Mantenibilidad: cada módulo tiene una responsabilidad clara.
- Escalabilidad: fácil de agregar funcionalidades específicas de categorías sin afectar el módulo de productos.
- Testabilidad: los tests de categorías son independientes de los tests de productos.

## Componentes del módulo Categories

| Componente | Responsabilidad |
|------------|-----------------|
| `CategoriesController` | Endpoints REST: GET, POST, PATCH, DELETE de categorías |
| `CategoriesService` | Lógica de negocio: validar productos asociados antes de eliminar |
| `CategoriesModule` | Agrupa controlador, servicio y repositorio |
| `CreateCategoryDto` | DTO para creación de categoría |
| `UpdateCategoryDto` | DTO para actualización parcial de categoría |
| `SyncCategoriesController` | Endpoints protegidos por HMAC para sync desde Payload |
| `SyncCategoriesService` | Lógica de upsert de categorías desde Payload |

## Endpoints del módulo Categories

| Método | Ruta | Protección |
|--------|------|------------|
| GET | `/api/v1/categories` | Pública |
| GET | `/api/v1/categories/:id` | Pública |
| GET | `/api/v1/categories/slug/:slug` | Pública |
| POST | `/api/v1/categories` | Autenticada (admin/editor) |
| PATCH | `/api/v1/categories/:id` | Autenticada (admin/editor) |
| DELETE | `/api/v1/categories/:id` | Autenticada (admin) |
| POST | `/api/v1/sync/categories` | HMAC (Payload CMS) |
| PATCH | `/api/v1/sync/categories/:payloadId/deactivate` | HMAC (Payload CMS) |

## Decisiones técnicas que necesitan validación

1. ¿El módulo Categories importa PrismaModule directamente o a través de un repositorio compartido?
2. ¿Los DTOs de categorías comparten validaciones con productos o son independientes?
3. ¿Se agrega un guard de roles específico para categorías o se reutiliza el de productos?

---

**Estado del diseño:** PENDIENTE de validación del equipo antes de implementar.
