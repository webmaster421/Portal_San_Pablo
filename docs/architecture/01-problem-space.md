# 01. Espacio del Problema

## Dominio del negocio

Portal San Pablo es una plataforma de comercio electrónico (storefront) para un catálogo de productos, probablemente productos religiosos/litúrgicos (biblias, subsidios litúrgicos, etc.), con precios en pesos colombianos (COP).

## Actores

| Actor | Descripción |
|-------|-------------|
| Cliente | Usuario final que navega el storefront y consulta productos |
| Administrador de catálogo | Usuario que gestiona productos, categorías, precios e inventario desde el CMS de Payload |
| Desarrollador | Mantiene el código de las tres aplicaciones y la infraestructura |

## Límites del sistema

El sistema abarca tres aplicaciones independientes y dos motores de base de datos:

- **Next.js (apps/web)**: Interfaz de compra para clientes.
- **Payload CMS (apps/cms)**: Panel de administración del catálogo.
- **NestJS (apps/api)**: API central que expone el catálogo a Next.js y recibe sincronizaciones de Payload.
- **PostgreSQL**: Base de datos central del catálogo (sincronizada desde Payload).
- **SQLite**: Base de datos propia de Payload CMS (almacenamiento interno del CMS).

## Espacio del problema vs. Espacio de solución

### Espacio del problema (lo que necesitamos resolver)

1. Los administradores necesitan crear, actualizar y desactivar productos en un panel de administración.
2. Los clientes necesitan consultar productos publicados desde una tienda en línea.
3. El catálogo debe tener una única fuente de verdad central (PostgreSQL) para que otros servicios puedan consumirlo en el futuro.
4. La sincronización entre el CMS y la API central debe ser confiable, protegida y auditable.

### Espacio de solución (cómo lo estamos resolviendo)

1. Payload CMS como panel de administración (SQLite interno).
2. NestJS como API central (PostgreSQL central).
3. HMAC-SHA256 para proteger la sincronización Payload → NestJS.
4. Next.js como storefront que consumirá NestJS (pendiente de implementar).

## Restricciones conocidas

- Payload CMS no debe conectarse directamente a PostgreSQL (arquitectura acordada).
- Next.js debe consumir NestJS como API central (arquitectura acordada, no implementado aún).
- La sincronización Payload → NestJS es unidireccional (no hay retroalimentación de NestJS a Payload).
- Los productos eliminados en Payload se desactivan lógicamente en PostgreSQL (no se borran físicamente).

## Hipótesis (no verificadas)

- El dominio de productos incluye libros, biblias y artículos litúrgicos (basado en nombres de categorías como "Biblias Catolicas").
- El precio se maneja en pesos colombianos (COP) con formato entero sin decimales.
