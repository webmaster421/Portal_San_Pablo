# 02. Requisitos

Esta sección distingue requisitos **funcionales** (qué hace el sistema) y **no funcionales** (cómo debe comportarse), así como requisitos **implementados** vs. **pendientes**.

## Requisitos funcionales

### RF-01: Gestión de productos desde el CMS
**Estado:** Implementado (parcialmente)  
**Descripción:** Un administrador puede crear, editar y eliminar productos desde el panel de Payload CMS.  
**Evidencia:** Colección `products` en `apps/cms/src/collections/Products.ts` con campos `title`, `slug`, `isbn`, `author`, `price`, `status`, `visible`, `inventory`, etc.  
**Tipo:** Requisito del negocio

### RF-02: Sincronización obligatoria hacia PostgreSQL
**Estado:** Implementado y validado  
**Descripción:** Cada producto creado, actualizado o eliminado en Payload CMS debe sincronizarse con PostgreSQL mediante NestJS.  
**Evidencia:** Hooks `afterChange` y `afterDelete` en `Products.ts`; endpoints `POST /api/v1/sync/products` y `PATCH /api/v1/sync/products/:payloadId/deactivate` en NestJS.  
**Tipo:** Requisito arquitectónico obligatorio

### RF-03: Consulta de productos desde el storefront
**Estado:** Implementado (contradice arquitectura)  
**Descripción:** El storefront Next.js debe poder listar y consultar productos.  
**Evidencia:** `apps/web/lib/cms.ts` consume directamente `http://localhost:3001/api/products` de Payload CMS.  
**Brecha de arquitectura:** Debería consumir `http://localhost:3002/api/v1/products` de NestJS.

### RF-04: Autenticación de administradores en el CMS
**Estado:** Implementado  
**Descripción:** Payload CMS gestiona usuarios y autenticación para acceso al panel.  
**Evidencia:** Colección `users` con `auth: true` en `Users.ts`.

### RF-05: Protección de sincronización con HMAC
**Estado:** Implementado y validado  
**Descripción:** Las peticiones de sincronización Payload → NestJS deben estar firmadas con HMAC-SHA256.  
**Evidencia:** `HmacAuthGuard` en `apps/api/src/products/sync/hmac-auth.guard.ts` y cliente `nestjs-sync.ts` en el CMS.

### RF-06: Eliminación lógica (soft delete) de productos
**Estado:** Implementado (parcialmente)  
**Descripción:** Al eliminar un producto en Payload, se debe desactivar lógicamente en PostgreSQL (`visible=false`, `status='draft'`), no borrar físicamente.  
**Evidencia:** Endpoint `PATCH /api/v1/sync/products/:payloadId/deactivate`.  
**Brecha:** El endpoint `DELETE /api/v1/products/:id` en NestJS hace hard delete físico.

## Requisitos no funcionales

### RNF-01: Seguridad
**Estado:** Pendiente  
**Descripción:** Los endpoints de escritura de NestJS (`POST/PATCH/DELETE /products`) deben estar autenticados y autorizados. Actualmente están expuestos sin protección.  
**Tipo:** Seguridad

### RNF-02: Confiabilidad de sincronización
**Estado:** Parcial  
**Descripción:** Si NestJS o PostgreSQL están caídos al crear un producto en Payload, el producto queda en SQLite sin sincronizarse. No existe cola de reintento diferido.  
**Tipo:** Confiabilidad / Disponibilidad

### RNF-03: Desempeño
**Estado:** No especificado  
**Descripción:** No hay métricas definidas de latencia para consultas de productos ni para sincronización.  
**Tipo:** Desempeño

### RNF-04: Mantenibilidad
**Estado:** Parcial  
**Descripción:** El código está organizado por capas (controlador, servicio, DTO) en NestJS. Payload CMS usa configuración centralizada.  
**Tipo:** Mantenibilidad

### RNF-05: Observabilidad
**Estado:** Parcial  
**Descripción:** Existe endpoint `/health` en NestJS que verifica PostgreSQL. Los errores de sincronización se registran en consola del CMS.  
**Tipo:** Observabilidad

## Requisitos pendientes de aprobación

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| RF-07 | Next.js consume NestJS como API central (no directamente Payload) | Alta | Pendiente de implementar |
| RNF-06 | Autenticación en endpoints de escritura de NestJS | Alta | Pendiente de implementar |
| RNF-07 | Cola de reintento diferido para sincronización cuando NestJS esté caído | Media | Pendiente de diseñar |
