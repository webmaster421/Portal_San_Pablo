# ADR-P01: Next.js consumirá NestJS como API central (Diseño Técnico Detallado)

## Metadatos

| Campo | Valor |
|-------|-------|
| Identificador | ADR-P01 |
| Título | Next.js consumirá NestJS como API central, en lugar de consultar directamente Payload CMS |
| Estado | ACCEPTED (arquitectura) / PENDING (diseño técnico detallado) |
| Fecha | 2026-11-05 |
| Autores | Equipo de arquitectura Portal San Pablo |

---

## 1. Comunicación server-side

### Patrón de comunicación

Next.js (storefront) se comunicará con NestJS exclusivamente vía HTTP/REST desde el **servidor** (Server Components, Route Handlers o API Routes de Next.js). No se expondrán credenciales ni llamadas directas desde el navegador a NestJS.

```
Navegador → Next.js Server (Server Component) → NestJS API (api/v1) → PostgreSQL
```

### Endpoints de NestJS a consumir desde Next.js

| Endpoint | Método | Uso en storefront |
|----------|--------|-------------------|
| `/api/v1/products` | GET | Listado de productos publicados y visibles |
| `/api/v1/products/slug/:slug` | GET | Detalle de producto por slug |
| `/api/v1/products/:id` | GET | Detalle de producto por ID interno |
| `/api/v1/health` | GET | Verificación de disponibilidad de la API |

### Implementación en Next.js

Archivo principal a adaptar: `apps/web/lib/cms.ts`

Las funciones actuales `getProducts()`, `getProductBySlug()`, `getCategories()` deben redirigir su llamada de `CMS_URL` (puerto 3001) a `API_URL` (puerto 3002, NestJS).

### Consideraciones de CORS

Dado que la comunicación es server-side, no se requiere CORS entre el navegador y NestJS. Solo Next.js (servidor) llama a NestJS.

---

## 2. Estrategia de caché e invalidación

### Caché en Next.js (Server-side)

| Estrategia | Aplicación | Justificación |
|------------|------------|---------------|
| `cache: "no-store"` en peticiones críticas | Listado de productos, detalle por slug | Evitar mostrar productos desactivados o precios desactualizados |
| ISR (Incremental Static Regeneration) | Páginas de producto (opcional) | Reducir carga en NestJS para catálogos estáticos |
| Caché en memoria de Node.js (opcional) | Respuestas frecuentes de NestJS | Reducir latencia para productos populares |

### Invalidación de caché

No existe mecanismo de invalidación automática desde NestJS hacia Next.js (arquitectura unidireccional). La invalidación se basa en:

1. **Tiempo de expiración (TTL):** Cada respuesta de NestJS se cachea por un tiempo corto (ej. 60 segundos).
2. **Revalidación bajo demanda:** Next.js puede revalidar rutas ISR cuando el administrador publica un cambio en Payload (requiere webhook futuro, pendiente).

### Recomendación

Usar `cache: "no-store"` en las funciones de consulta de `apps/web/lib/cms.ts` para garantizar consistencia inmediata con PostgreSQL, dado que el catálogo cambia frecuentemente y no hay mecanismo de notificación de invalidación.

---

## 3. Timeouts y manejo de errores

### Timeouts recomendados

| Operación | Timeout | Justificación |
|-----------|---------|---------------|
| Listado de productos | 5 segundos | Consulta de lectura, debe ser rápida |
| Detalle de producto por slug | 5 segundos | Consulta de lectura puntual |
| Health check | 3 segundos | Verificación rápida de disponibilidad |

### Implementación de timeout

Usar `AbortController` de Node.js/fetch:

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch(apiUrl, {
    signal: controller.signal,
    cache: "no-store",
  });
} finally {
  clearTimeout(timeoutId);
}
```

### Manejo de errores

| Escenario | Comportamiento en Next.js |
|-----------|--------------------------|
| NestJS devuelve 200 | Renderizar productos normalmente |
| NestJS devuelve 404 | Mostrar "Producto no encontrado" |
| NestJS devuelve 500 o timeout | Mostrar mensaje de error amigable; registrar en consola de servidor |
| NestJS no disponible | Mostrar "El catálogo no está disponible en este momento" |

### No silenciar errores

A diferencia del cliente de sincronización de Payload CMS (que captura y registra errores sin fallar), el storefront **debe** propagar errores de lectura para que el usuario vea un estado honesto de la aplicación.

---

## 4. Lectura pública vs. lectura administrativa

### Lectura pública (sin autenticación)

- **Endpoints:** `GET /api/v1/products`, `GET /api/v1/products/slug/:slug`
- **Filtro obligatorio:** `status = 'published'` AND `visible = true`
- **Acceso:** Cualquier usuario, incluyendo no autenticados

### Lectura administrativa (con autenticación)

- **Endpoints:** Mismos endpoints de lectura, pero con token de autenticación válido
- **Filtro:** Sin restricción de `status` ni `visible` (administrador ve todos los estados)
- **Acceso:** Usuarios autenticados con rol `admin` o `editor`

### Diferencia de implementación

Next.js debe exponer dos caminos de consulta:
1. **Público:** Llama a NestJS sin token; NestJS aplica filtro de publicados y visibles.
2. **Administrador:** Llama a NestJS con token JWT; NestJS omite el filtro de estado y devuelve todos los productos.

---

## 5. Migración desde la API directa de Payload

### Pasos de migración (sin romper producción)

1. **Crear cliente de NestJS en Next.js:** Nueva función `getProductsFromApi()` que llame a `http://localhost:3002/api/v1/products`.
2. **Mantener cliente de Payload temporalmente:** Las funciones existentes (`getProducts()`, `getProductBySlug()`) siguen operando para evitar romper el storefront durante la transición.
3. **Cambiar punto de entrada:** Modificar `page.tsx` y cualquier componente que llame a `getProducts()` para usar la nueva función de NestJS.
4. **Eliminar dependencia de Payload:** Una vez verificado que NestJS devuelve los datos correctamente, eliminar llamadas a `CMS_URL` en `apps/web/lib/cms.ts`.
5. **Actualizar variable de entorno:** Renombrar o agregar `API_URL` en `apps/web/.env.local` apuntando a `http://localhost:3002`.

### Variables de entorno afectadas

| Variable actual | Uso actual | Uso futuro |
|-----------------|------------|------------|
| `CMS_URL=http://localhost:3001` | Consulta de productos y categorías | Solo para admin de Payload (no usado por storefront) |
| `API_URL` (nueva en web) | — | Consulta de productos desde NestJS (`http://localhost:3002`) |

---

## 6. Incompatibilidades con la arquitectura actual

| Incompatibilidad | Descripción |
|------------------|-------------|
| `GET /products` no filtra por `status` ni `visible` | Actualmente devuelve todos los productos; debe filtrar para lectura pública |
| Campos de respuesta pueden diferir | NestJS devuelve `payloadId`, `categoryName`, etc.; Payload devuelve objetos poblados (`category`, `image`). Next.js debe adaptarse al formato de NestJS |
| No hay endpoint de categorías en NestJS | Actualmente `getCategories()` consulta a Payload; debe crearse endpoint en NestJS o seguir consultando Payload solo para categorías |

---

## 7. Diagramas de secuencia

```mermaid
sequenceDiagram
    autonumber
    participant C as Cliente (navegador)
    participant NW as Next.js Server
    participant NJ as NestJS API (3002)
    participant PG as PostgreSQL

    C->>+NW: GET /productos?slug=xyz (SSR)
    NW->>+NJ: GET /api/v1/products/slug/xyz<br/>cache: no-store
    NJ->>+PG: SELECT * FROM "Product"<br/>WHERE slug = $1 AND status='published' AND visible=true
    PG-->>-NJ: Producto encontrado
    NJ-->>-NW: JSON producto (200)
    NW-->>-C: HTML renderizado con producto

    alt NestJS no disponible
        NJ-->>-NW: Error 503 / Timeout
        NW-->>-C: "Catálogo no disponible"
    end
```

---

## 8. Criterios de aceptación verificables

| Criterio | Cómo verificarlo |
|----------|-----------------|
| El storefront consulta productos a NestJS, no a Payload | Revisar código de `apps/web/lib/cms.ts`; URL de destino es `localhost:3002` |
| Lectura pública filtra por `status='published'` y `visible=true` | Consultar `GET /api/v1/products` sin token; verificar que no devuelva borradores ni ocultos |
| Timeout de 5 segundos implementado | Revisar uso de `AbortController` en llamadas fetch |
| Error de NestJS se muestra al usuario | Desconectar NestJS; verificar que Next.js muestra mensaje de error, no falla silenciosamente |

---

## 9. Archivos que probablemente habrá que modificar

| Archivo | Cambio probable |
|---------|-----------------|
| `apps/web/lib/cms.ts` | Cambiar `CMS_URL` por `API_URL`; adaptar funciones `getProducts`, `getProductBySlug`, `getCategories` a endpoints de NestJS |
| `apps/web/app/page.tsx` | Posible ajuste si cambia la forma de recibir productos |
| `apps/web/.env.local` | Agregar `API_URL=http://localhost:3002` |
| `apps/api/src/products/products.controller.ts` | Agregar filtro por `status` y `visible` en `findAll` para lectura pública |
| `apps/api/src/products/products.service.ts` | Agregar parámetro de filtro basado en contexto de autenticación |

---

## 10. Riesgos

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Campos de respuesta de NestJS no coinciden con los que Next.js espera | Medio | Mapear campos en `apps/web/lib/cms.ts` o ajustar DTOs en NestJS |
| Next.js depende de NestJS para cargar productos | Alto | Asegurar que NestJS esté siempre disponible cuando el storefront esté en línea |
| No hay invalidación de caché automática | Bajo | Usar `cache: "no-store"` y TTL corto |

---

## Decisiones técnicas que necesitan validación

1. ¿Se crea un endpoint de categorías en NestJS o Next.js sigue consultando categorías a Payload?
2. ¿Next.js implementará ISR para páginas de producto o usará SSR puro?
3. ¿Se requiere un middleware de autenticación en Next.js para distinguir lecturas públicas de administrativas?

---

**Estado del diseño:** PENDIENTE de validación del equipo antes de implementar.