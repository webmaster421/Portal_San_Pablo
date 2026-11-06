# ADR-P12: Next.js consulta categorías a través de NestJS

## Metadatos

| Campo | Valor |
|-------|-------|
| Identificador | ADR-P12 |
| Título | Evitar que Next.js consulte categorías directamente a Payload |
| Estado | ACCEPTED (arquitectura) / PENDING (implementación) |
| Fecha | 2026-11-05 |
| Autores | Equipo de arquitectura Portal San Pablo |

## Contexto

Actualmente, el storefront de Next.js consulta categorías directamente a Payload CMS mediante `apps/web/lib/cms.ts`:

```typescript
const response = await fetch(`${cmsUrl}/api/categories?limit=10`, {
  cache: "no-store",
});
```

Esto viola ADR-P01 (Next.js debe consumir NestJS como API central) y crea un acoplamiento directo frontend-CMS.

## Problema

1. Next.js depende de la disponibilidad de Payload CMS (puerto 3001) para mostrar categorías.
2. Evade la capa de API central (NestJS), impidiendo aplicar seguridad, caché y transformación centralizadas.
3. Inconsistencia arquitectónica: productos se leen de NestJS (tras ADR-P01) pero categorías de Payload.

## Alternativas consideradas

| Alternativa | Descripción | Ventajas | Desventajas |
|-------------|-------------|----------|-------------|
| A. Mantener consulta directa a Payload | Sin cambios en `getCategories()` | Sin desarrollo inmediato | Viola ADR-P01; acopla frontend al CMS |
| B. Consultar categorías vía NestJS | `getCategories()` llama a `GET /api/v1/categories` de NestJS | Cumple ADR-P01; capa centralizada; consistente con productos | Requiere endpoint de categorías en NestJS; requiere cambio en `apps/web/lib/cms.ts` |

## Decisión

**ADR-P12 (ACEPTADO):** Next.js consultará las categorías exclusivamente a través de NestJS (`GET /api/v1/categories`), no directamente a Payload CMS.

## Justificación

- Cumple ADR-P01: NestJS es la API central para el storefront.
- Capa única de seguridad, caché y transformación para todo el catálogo (productos + categorías).
- Consistencia: tanto productos como categorías se obtienen de la misma fuente.

## Cambios en Next.js

| Archivo | Cambio |
|---------|--------|
| `apps/web/lib/cms.ts` | `getCategories()` cambia de `CMS_URL` (puerto 3001) a `API_URL` (puerto 3002, NestJS) |
| `apps/web/.env.local` | Asegurar que `API_URL` apunte a NestJS (`http://localhost:3002`) |

## Decisiones técnicas que necesitan validación

1. ¿El endpoint `GET /api/v1/categories` de NestJS devuelve el mismo formato que Payload (array con `docs`) o un formato diferente?
2. ¿Next.js aplicará caché a las consultas de categorías o usará `cache: "no-store"`?
3. ¿Qué ocurre si NestJS no está disponible pero Payload sí lo está?

---

**Estado del diseño:** PENDIENTE de validación del equipo antes de implementar.
