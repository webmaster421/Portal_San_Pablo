# ADR-P04: Mecanismo persistente de sincronización pendiente (Diseño Técnico Detallado)

## Metadatos

| Campo | Valor |
|-------|-------|
| Identificador | ADR-P04 |
| Título | Mecanismo persistente de sincronización pendiente, con reintentos diferidos, registro de errores y reconciliación entre Payload y PostgreSQL |
| Estado | ACCEPTED (arquitectura) / PENDING (diseño técnico detallado) |
| Fecha | 2026-11-05 |
| Autores | Equipo de arquitectura Portal San Pablo |

---

## 1. Patrón Transactional Outbox

### Descripción

El patrón Transactional Outbox se implementa en la base de datos SQLite de Payload CMS. Cada vez que se crea, actualiza o elimina un producto en Payload, en lugar de (o además de) llamar directamente a NestJS, se inserta un registro en una tabla de "salida" (outbox) dentro de la misma transacción de SQLite. Un worker separado procesa los registros pendientes y los envía a NestJS.

### ¿Por qué Transactional Outbox?

- Garantiza que la operación en SQLite y el registro de sincronización sean atómicas (misma transacción).
- Si NestJS está caído, el registro queda en la cola para reintento posterior.
- Sobrevive reinicios del CMS porque persiste en SQLite.

---

## 2. Persistencia de operaciones pendientes en SQLite

### Nueva tabla `sync_outbox` en `payload.db`

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id` | INTEGER | No (PK) | Identificador de la operación de sincronización |
| `payloadId` | INTEGER | No | ID del producto en Payload |
| `operation` | TEXT | No | Tipo de operación: 'create', 'update', 'delete' |
| `payload` | TEXT | No | JSON serializado con los datos del producto a sincronizar |
| `status` | TEXT | No | 'pending', 'processing', 'completed', 'failed' |
| `attempts` | INTEGER | No | Número de intentos realizados (default 0) |
| `maxAttempts` | INTEGER | No | Máximo de intentos antes de marcar como fallido permanentemente (default 5) |
| `nextRetry` | TIMESTAMP | Sí | Fecha y hora del próximo reintento |
| `lastError` | TEXT | Sí | Mensaje de error del último intento fallido |
| `lastErrorStack` | TEXT | Sí | Stack trace del último error |
| `createdAt` | TIMESTAMP | No | Fecha de creación del registro |
| `updatedAt` | TIMESTAMP | No | Fecha de última actualización del registro |

### Índices recomendados

| Índice | Columnas | Justificación |
|--------|----------|---------------|
| `idx_sync_outbox_status_nextRetry` | `status`, `nextRetry` | Consultar rápidamente registros pendientes cuyo tiempo de reintento ha llegado |
| `idx_sync_outbox_payloadId` | `payloadId` | Consultar operaciones pendientes de un producto específico |

---

## 3. Worker de procesamiento

### Arquitectura del worker

El worker es un proceso interno de Payload CMS (Next.js) que se ejecuta periódicamente.

```
Ciclo del worker:
1. Consultar registros de sync_outbox WHERE status = 'pending' AND nextRetry <= now()
   ORDER BY createdAt ASC LIMIT 50
2. Para cada registro:
   a. Marcar como 'processing', actualizar attempts++
   b. Enviar a NestJS (POST /sync/products o PATCH /sync/products/:id/deactivate)
   c. Si éxito: marcar como 'completed'
   d. Si error HTTP 4xx (excepto 409/429): marcar como 'failed' (no reintentar)
   e. Si error HTTP 5xx o timeout: calcular próximo reintento con backoff, marcar como 'pending'
3. Dormir intervalo configurable (ej. 10 segundos)
4. Repetir desde el paso 1
```

### Ejecución del worker

- Puede ejecutarse como un `setInterval` dentro de la aplicación Next.js de Payload.
- O como un proceso separado (cron job) que invoque un endpoint interno de Payload.
- **No se instala dependencia externa:** Se usa la infraestructura existente de Next.js.

---

## 4. Reintentos y backoff

### Estrategia de backoff exponencial

| Intento | Tiempo de espera antes del reintento |
|---------|-------------------------------------|
| 1 | Inmediato (primer intento en el hook afterChange) |
| 2 | 2 segundos |
| 3 | 4 segundos |
| 4 | 8 segundos |
| 5 | 16 segundos |
| 6+ | 32 segundos (máximo) |

### Cálculo

```
nextRetry = now() + min(2^attempts, 32) segundos
```

### Máximo de intentos

- `maxAttempts`: 5 por defecto.
- Después de 5 intentos fallidos, el registro se marca como `'failed'` y no se reintenta automáticamente.
- Requiere intervención manual o reconciliación para reprocesar.

---

## 5. Idempotencia

### En NestJS (lado receptor)

El endpoint `POST /api/v1/sync/products` ya implementa upsert por `payloadId`:

```typescript
await this.prisma.product.upsert({
  where: { payloadId: data.payloadId },
  update: { ... },
  create: { ... },
});
```

Esto garantiza que recibir el mismo producto múltiples veces no genere duplicados.

### En el worker de Payload (lado emisor)

- Antes de marcar un registro como `completed`, verificar que NestJS respondió con HTTP 2xx.
- Si NestJS responde 409 (conflicto), tratar como éxito idempotente (el producto ya existe con esos datos).
- El registro de outbox se marca como `completed` solo cuando NestJS confirma recepción.

---

## 6. Prevención de procesamiento duplicado

### Mecanismos

1. **Estado de procesamiento:** Un registro se marca como `'processing'` antes de enviarlo a NestJS. Si el worker falla y se reinicia, los registros en `'processing'` se pueden volver a `'pending'` después de un tiempo de gracia (ej. 5 minutos).
2. **Bloqueo por registro:** Solo un worker procesa un registro a la vez (estado `processing` actúa como bloqueo).
3. **Idempotencia en NestJS:** Incluso si el mismo registro se envía dos veces, NestJS no duplica gracias al upsert por `payloadId`.

---

## 7. Registro de errores

### ¿Qué se registra?

Para cada intento fallido se guarda en la tabla `sync_outbox`:
- `lastError`: mensaje de error (ej. "HTTP 500: Internal Server Error")
- `lastErrorStack`: stack trace (opcional, para depuración)
- `attempts`: número acumulado de intentos
- `nextRetry`: cuándo se intentará de nuevo

### Consola del CMS

Los errores críticos también se registran en consola de Next.js para visibilidad inmediata durante el desarrollo.

---

## 8. Reconciliación entre SQLite y PostgreSQL

### Propósito

Detectar productos que existen en SQLite (Payload) pero no en PostgreSQL (NestJS), o viceversa, y corregir la desincronización.

### Mecanismo de reconciliación

1. **Consulta productos en SQLite:** `SELECT id, title, status, visible, updatedAt FROM products`
2. **Consulta productos en PostgreSQL:** `GET /api/v1/products` (o endpoint dedicado de reconciliación)
3. **Comparar:** Identificar productos en SQLite que no tengan contraparte en PostgreSQL por `payloadId`.
4. **Corregir:** Para cada producto desincronizado, insertar un registro en `sync_outbox` con operación `'create'` o `'update'`.

### Frecuencia

- Ejecutarse periódicamente (ej. cada hora) o bajo demanda desde el admin de Payload.
- No debe ejecutarse en cada solicitud HTTP (costo de rendimiento).

---

## 9. Recuperación tras reinicios del CMS

### Antes del reinicio

Los registros en `sync_outbox` persisten en SQLite. Los registros con estado `'pending'` o `'processing'` esperan ser procesados.

### Después del reinicio

1. El worker de Payload se inicia nuevamente.
2. Al arrancar, el worker consulta registros pendientes cuyo `nextRetry <= now()`.
3. Los registros en `'processing'` que llevan más de 5 minutos en ese estado se vuelven a `'pending'` (se asume que el worker anterior falló).
4. El procesamiento continúa normalmente.

### Pérdida de datos

- No se pierde ninguna operación de sincronización porque todo se persiste en SQLite antes de intentar enviar a NestJS.
- El único riesgo es que el archivo `payload.db` se corrompa o se elimine, lo cual es un problema de infraestructura más allá del alcance de este diseño.

---

## 8. Diagrama de secuencia (flujo de sincronización confiable)

```mermaid
sequenceDiagram
    autonumber
    participant PC as Payload CMS (SQLite)
    participant OB as Tabla sync_outbox (SQLite)
    participant W as Worker de sincronización
    participant NJ as NestJS API (3002)
    participant PG as PostgreSQL

    note over PC,OB: Paso 1: Crear producto en Payload
    PC->>+PC: INSERT INTO products (...)
    PC->>+OB: INSERT INTO sync_outbox (payloadId, operation, payload, status='pending')
    PC-->>-PC: Transacción confirmada (producto + outbox atómicos)

    note over W,NJ: Paso 2: Worker procesa outbox
    W->>+OB: SELECT * FROM sync_outbox<br/>WHERE status='pending' AND nextRetry <= now()
    OB-->>-W: Registro pendiente (payloadId=4, operation='create')
    W->>+OB: UPDATE sync_outbox SET status='processing', attempts=attempts+1<br/>WHERE id = ?
    W->>+NJ: POST /api/v1/sync/products<br/>X-Hmac-Signature: ...<br/>Body: {payloadId:4, ...}
    
    alt NestJS responde 201/200
        NJ-->>-W: 201 {"synced":true,...}
        W->>+OB: UPDATE sync_outbox SET status='completed'<br/>WHERE id = ?
    else NestJS responde 5xx o timeout
        NJ-->>-W: Error 503 / Timeout
        W->>+OB: UPDATE sync_outbox SET status='pending',<br/>nextRetry = now() + backoff(attempts),<br/>lastError = '...'<br/>WHERE id = ?
    end

    note over W: Paso 3: Reconciliación periódica (opcional)
    W->>+PC: SELECT id, payloadId FROM products
    W->>+NJ: GET /api/v1/products
    W->>+OB: INSERT registro para productos desincronizados
```

---

## 8. Criterios de aceptación verificables

| Criterio | Cómo verificarlo |
|----------|-----------------|
| Tabla `sync_outbox` existe en SQLite | Consultar esquema de SQLite; verificar tabla y columnas |
| Cada creación de producto inserta en `sync_outbox` | Crear producto en Payload; verificar registro en outbox con status='pending' |
| Worker reintenta automáticamente tras fallo | Detener NestJS, crear producto en Payload, esperar, reactivar NestJS; verificar que el producto llega a PostgreSQL |
| Máximo de intentos respetado | Forzar 5 fallos consecutivos; verificar que status='failed' y no hay más reintentos |
| No hay duplicados en PostgreSQL tras reintentos | Enviar mismo producto 3 veces; verificar 1 solo registro en PostgreSQL |
| Registros sobreviven reinicio del CMS | Reiniciar CMS; verificar que registros pendientes siguen en outbox y se procesan |
| Reconciliación detecta desincronía | Borrar producto de PostgreSQL manualmente; ejecutar reconciliación; verificar que se recrea en PostgreSQL |

---

## 9. Archivos que probablemente habrá que modificar

| Archivo | Cambio probable |
|---------|-----------------|
| `apps/cms/src/sync/nestjs-sync.ts` | Refactorizar para usar tabla de outbox en lugar de llamada directa |
| `apps/cms/src/collections/Products.ts` | Modificar hooks `afterChange`/`afterDelete` para insertar en `sync_outbox` |
| `apps/cms/src/` (nuevo) | Archivo de definición de tabla `sync_outbox` y worker de procesamiento |
| `apps/cms/payload.db` | Nueva tabla `sync_outbox` (requiere migración de SQLite o script de inicialización) |
| `apps/cms/src/payload.config.ts` | Posible registro del worker o tarea programada |

---

## 10. Riesgos

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| La cola crece sin control si NestJS está caído por días | Medio | Definir `maxAttempts` y TTL para registros antiguos |
| Procesamiento de la cola bloquea el CMS | Bajo | Ejecutar worker de forma asíncrona, fuera del ciclo de respuesta HTTP |
| Inconsistencia entre outbox y estado real de PostgreSQL | Medio | Ejecutar reconciliación periódica |
| Archivo `payload.db` se corrompe | Alto | Copias de seguridad periódicas de SQLite (infraestructura) |

---

## Decisiones técnicas que necesitan validación

1. ¿El worker se ejecuta dentro de Next.js de Payload o como proceso separado?
2. ¿Se usa una librería de colas (Bull, etc.) o se implementa el worker con `setInterval` nativo?
3. ¿Cuál es el intervalo de polling del worker (ej. 10s, 30s)?
4. ¿La reconciliación se ejecuta automáticamente o solo bajo demanda desde el admin?

---

**Estado del diseño:** PENDIENTE de validación del equipo antes de implementar.