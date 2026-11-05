# ADR-P02: Autenticación y autorización en endpoints de escritura de NestJS (Diseño Técnico Detallado)

## Metadatos

| Campo | Valor |
|-------|-------|
| Identificador | ADR-P02 |
| Título | Los endpoints de escritura de NestJS estarán protegidos mediante autenticación y autorización |
| Estado | ACCEPTED (arquitectura) / PENDING (diseño técnico detallado) |
| Fecha | 2026-11-05 |
| Autores | Equipo de arquitectura Portal San Pablo |

---

## 1. Autenticación de usuarios y servicios

### Tipos de clientes

| Cliente | Mecanismo de autenticación | Justificación |
|---------|---------------------------|---------------|
| Next.js (storefront, público) | No autenticado (solo lectura) | Los clientes finales no necesitan cuenta para ver productos |
| Next.js (storefront, administrador) | JWT Bearer token | El administrador inicia sesión y obtiene un token para operaciones de escritura |
| Payload CMS (sincronización) | HMAC-SHA256 (existente) | Ya implementado y validado; se conserva sin cambios |
| NestJS (servicios internos) | No aplica | NestJS es el servidor, no un cliente |

### Flujo de autenticación de usuarios

1. El administrador se autentica en Payload CMS (usuarios existentes en SQLite).
2. Para operaciones de escritura desde NestJS, se necesita un token JWT emitido por NestJS o validado por NestJS.
3. **No se duplica el sistema de usuarios:** Los usuarios siguen viviendo en Payload CMS (SQLite). NestJS mantiene una **réplica de solo lectura** de usuarios en PostgreSQL para autorización, sincronizada desde Payload mediante el mismo mecanismo de sync existente (o un nuevo endpoint de sync de usuarios).

> **Justificación de no duplicación:** Crear un sistema de usuarios independiente en NestJS obligaría a los administradores a mantener dos credenciales y rompería la fuente única de identidad que ya es Payload. Sincronizar usuarios desde Payload a NestJS (réplica de lectura) evita duplicación sin acoplar directamente las bases de datos.

---

## 2. Responsabilidad de Payload y NestJS en la identidad

| Responsabilidad | Payload CMS | NestJS |
|-----------------|-------------|--------|
| Almacenamiento de usuarios | Sí (SQLite, fuente de verdad) | Réplica de solo lectura (PostgreSQL) |
| Autenticación de usuarios (login) | Sí | Valida JWT emitido por NestJS |
| Emisión de JWT | No | Sí (después de validar contra Payload o réplica sincronizada) |
| Autorización (roles, permisos) | Sí (acceso a colecciones) | Sí (endpoints de escritura de productos) |
| Sincronización de usuarios | Envía cambios de usuarios a NestJS | Recibe y aplica cambios de usuarios |

> **Nota:** La sincronización de usuarios desde Payload a NestJS es una extensión futura del mecanismo de sync (ADR-P04). Inicialmente, se puede crear manualmente el usuario administrador en NestJS.

---

## 3. JWT, sesiones y HMAC: dónde corresponde cada mecanismo

| Mecanismo | Uso | Alcance |
|-----------|-----|---------|
| **HMAC-SHA256** | Sincronización Payload → NestJS | Endpoints `/api/v1/sync/*` únicamente |
| **JWT (access token)** | Autenticación de usuarios en NestJS | Endpoints de escritura `/api/v1/products/*` |
| **JWT (refresh token)** | Renovación de access token | Endpoint `/api/v1/auth/refresh` (futuro) |
| **Sesiones (cookie)** | No se usa en NestJS | — |

### ¿Por qué no sesiones en NestJS?

NestJS es una API REST stateless. Las sesiones con cookies requieren estado en el servidor y son difíciles de escalar. JWT es stateless y adecuado para una API consumida por Next.js.

### ¿Por qué no reemplazar HMAC con JWT en el sync?

El HMAC ya está implementado, validado y funciona para máquina-a-máquina (Payload → NestJS). Cambiarlo añadiría complejidad sin beneficio inmediato. JWT es para usuarios humanos; HMAC es para servicios.

---

## 4. Roles y permisos

| Rol | Puede leer productos | Puede crear productos | Puede actualizar productos | Puede desactivar productos |
|-----|---------------------|----------------------|---------------------------|---------------------------|
| Público (anónimo) | Sí (solo publicados/visibles) | No | No | No |
| Cliente (autenticado) | Sí (solo publicados/visibles) | No | No | No |
| Editor | Sí (todos los estados) | Sí | Sí | Sí (soft delete) |
| Administrador | Sí (todos los estados) | Sí | Sí | Sí (soft delete) |

### Matriz de permisos por endpoint

| Endpoint | Método | Roles permitidos | Protección |
|----------|--------|-----------------|------------|
| `/api/v1/products` | GET | Público | Sin autenticación (filtro publicado/visible) |
| `/api/v1/products/slug/:slug` | GET | Público | Sin autenticación (filtro publicado/visible) |
| `/api/v1/products/:id` | GET | Público | Sin autenticación (filtro publicado/visible) |
| `/api/v1/products` | POST | admin, editor | JWT + rol |
| `/api/v1/products/:id` | PATCH | admin, editor | JWT + rol |
| `/api/v1/products/:id` | DELETE | admin | JWT + rol (soft delete) |
| `/api/v1/sync/products` | POST | Payload CMS (HMAC) | HMAC-SHA256 |
| `/api/v1/sync/products/:payloadId/deactivate` | PATCH | Payload CMS (HMAC) | HMAC-SHA256 |

---

## 5. Protección de todos los endpoints de escritura

### Endpoints a proteger

1. `POST /api/v1/products` — Crear producto
2. `PATCH /api/v1/products/:id` — Actualizar producto
3. `DELETE /api/v1/products/:id` — Soft delete (desactivación lógica)

### Implementación del guard

Crear un `AuthGuard` en NestJS que:
1. Extraiga el token JWT del header `Authorization: Bearer <token>`.
2. Valide la firma del JWT con el secreto de NestJS.
3. Verifique la expiración del token.
4. Extraiga el rol del usuario desde el payload del JWT.
5. Permita o niegue el acceso según el rol requerido por el endpoint.

### Endpoints de sincronización (sin cambios)

Los endpoints `/api/v1/sync/*` mantienen su protección HMAC existente (`HmacAuthGuard`). No se añade JWT a estos endpoints.

---

## 6. Manejo seguro de tokens y secretos

### Secretos necesarios

| Secreto | Propósito | Dónde se almacena |
|---------|-----------|-------------------|
| `JWT_ACCESS_SECRET` | Firmar y validar access tokens | `apps/api/.env` |
| `JWT_REFRESH_SECRET` | Firmar y validar refresh tokens | `apps/api/.env` |
| `HMAC_SYNC_SECRET` | Sincronización Payload → NestJS | Ya existe en ambos `.env` |

### Almacenamiento de tokens en el cliente (Next.js)

| Token | Almacenamiento | Justificación |
|-------|---------------|---------------|
| Access token | Memoria de sesión (no localStorage) | Evitar XSS; solo accesible durante la sesión |
| Refresh token | Cookie `HttpOnly`, `Secure`, `SameSite=Strict` | Evitar robo por JavaScript; envío automático en peticiones |

### Rotación de tokens

- Access token: vida corta (ej. 15 minutos).
- Refresh token: vida larga (ej. 7 días), rotación opcional.

---

## 7. Diagrama de secuencia

```mermaid
sequenceDiagram
    autonumber
    participant U as Administrador (navegador)
    participant NW as Next.js Server
    participant NJ as NestJS API (3002)
    participant PG as PostgreSQL
    participant PC as Payload CMS (3001)
    participant SQLite as SQLite (payload.db)

    autonumber
    U->>+PC: Login (email, password)
    PC-->>-U: Sesión de Payload (cookie)

    U->>+NW: PATCH /api/products/:id {precio: 9500}<br/>Cookie de sesión de Payload
    NW->>+NJ: PATCH /api/v1/products/:id<br/>Authorization: Bearer <access_token>
    
    alt Token válido y rol permitido
        NJ->>+PG: UPDATE "Product" SET price=9500<br/>WHERE id = $1 AND deletedAt IS NULL
        PG-->>-NJ: Producto actualizado
        NJ-->>-NW: 200 OK + producto actualizado
        NW-->>-U: 200 OK
    else Token inválido o rol insuficiente
        NJ-->>-NW: 401 Unauthorized / 403 Forbidden
        NW-->>-U: 401/403
    end

    note over NJ,PG: Soft delete: DELETE /products/:id<br/>SET visible=false, status='draft', deletedAt=now()
```

---

## 8. Criterios de aceptación verificables

| Criterio | Cómo verificarlo |
|----------|-----------------|
| `POST /products` rechaza petición sin token | Enviar POST sin header Authorization; esperar 401 |
| `POST /products` acepta petición con token válido de admin | Enviar POST con Bearer token de admin; esperar 201 |
| `POST /products` rechaza token de usuario sin rol | Enviar POST con token de rol cliente; esperar 403 |
| `GET /products` público no requiere token | Enviar GET sin Authorization; esperar 200 con solo publicados |
| Endpoints `/api/v1/sync/*` siguen funcionando con HMAC | Probar sync con headers HMAC; esperar 200 |

---

## 9. Archivos que probablemente habrá que modificar

| Archivo | Cambio probable |
|---------|-----------------|
| `apps/api/src/products/products.controller.ts` | Agregar `UseGuards(AuthGuard)` y decoradores de rol a POST, PATCH, DELETE |
| `apps/api/src/products/products.service.ts` | Agregar verificación de propiedad/rol si es necesario |
| `apps/api/src/` (nuevo) | Módulo de autenticación (`auth.module.ts`, `auth.service.ts`, `auth.controller.ts`, `jwt.strategy.ts`, `roles.guard.ts`) |
| `apps/api/.env` | Agregar `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` |
| `apps/cms/src/sync/nestjs-sync.ts` | (Opcional) Agregar sincronización de usuarios desde Payload a NestJS |

---

## 10. Riesgos

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Duplicar sistema de usuarios sin justificación | Alto | Mantener Payload como fuente de verdad; NestJS solo réplica de lectura |
| Tokens JWT comprometidos | Alto | Vida corta de access token, HTTPS, almacenamiento en cookie HttpOnly |
| Olvidar proteger un endpoint de escritura nuevo | Medio | Code review obligatorio para endpoints mutadores |
| Pérdida de acceso si JWT expira | Bajo | Implementar endpoint de refresh token |

---

## Decisiones técnicas que necesitan validación

1. ¿NestJS valida el JWT contra su propia réplica de usuarios o delega la validación a Payload CMS?
2. ¿Se implementa refresh token o solo access token de vida larga?
3. ¿Cómo se sincronizan los usuarios de Payload a NestJS inicialmente (migración manual o sync automático)?

---

**Estado del diseño:** PENDIENTE de validación del equipo antes de implementar.