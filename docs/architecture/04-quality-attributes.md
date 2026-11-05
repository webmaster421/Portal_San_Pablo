# 04. Atributos de Calidad

## Seguridad

| Atributo | Estado | Observaciones |
|----------|--------|---------------|
| Autenticación de usuarios CMS | Implementado | Payload CMS gestiona usuarios con `auth: true` |
| Autenticación de sincronización Payload → NestJS | Implementado | HMAC-SHA256 con validación de timestamp ±5 min |
| Autenticación de endpoints de escritura en NestJS | **Pendiente** | `POST/PATCH/DELETE /products` están expuestos sin protección |
| Gestión de secretos | **Riesgo** | `HMAC_SYNC_SECRET`, `PAYLOAD_SECRET` y credenciales de PostgreSQL están en archivos `.env` con valores reales |

## Confiabilidad

| Atributo | Estado | Observaciones |
|----------|--------|---------------|
| Sincronización inmediata Payload → NestJS | Implementado | Hooks `afterChange`/`afterDelete` llaman a NestJS al crear/actualizar/eliminar |
| Reintentos ante fallo de red | Implementado (parcial) | 3 intentos con backoff exponencial (2s, 4s) en `nestjs-sync.ts` |
| Reintento diferido si NestJS/PostgreSQL caído | **Pendiente** | Si NestJS está caído, el producto queda en SQLite sin sincronizarse; no hay cola de reintento |
| Manejo de errores sin bloquear el CMS | Implementado | Errores de sincronización se capturan y registran; no fallan la operación en Payload |

## Desempeño

| Atributo | Estado | Observaciones |
|----------|--------|---------------|
| Consultas de productos desde Next.js | No medido | No hay métricas de latencia definidas |
| Sincronización de productos | No medido | No hay métricas de tiempo de sincronización |
| Health check de base de datos | Implementado | `GET /api/v1/health` verifica `SELECT 1` en PostgreSQL |

## Disponibilidad

| Atributo | Estado | Observaciones |
|----------|--------|---------------|
| PostgreSQL | En ejecución | Puerto 5433, health check reporta `up` |
| NestJS API | En ejecución | Puerto 3002 |
| Payload CMS | En ejecución | Puerto 3001 |
| Redundancia | No definida | No hay información sobre clústeres, balanceadores o failover |

## Mantenibilidad

| Atributo | Estado | Observaciones |
|----------|--------|---------------|
| Organización de código NestJS | Bueno | Controladores, servicios, DTOs, guards separados |
| Organización de código Payload CMS | Bueno | Colecciones definidas por separado, hooks centralizados |
| Tipos generados | Sí | `apps/cms/src/payload-types.ts` generado automáticamente por Payload |
| Documentación de código | Parcial | Algunos comentarios explicativos en controladores y servicios |

## Observabilidad

| Atributo | Estado | Observaciones |
|----------|--------|---------------|
| Health check | Implementado | `GET /api/v1/health` verifica conectividad con PostgreSQL |
| Logs de sincronización | Implementado | Errores se registran en consola del CMS con contexto (operación, payloadId) |
| Métricas | No definidas | No hay métricas de negocio ni técnicas expuestas |
