# Diagramas técnicos

Esta carpeta contiene los diagramas de arquitectura del proyecto Portal San Pablo en formato Mermaid (`.mmd`).

## Diagramas C4

| Archivo | Descripción | Nivel C4 |
|---------|-------------|----------|
| `c4-context.mmd` | Contexto del sistema: actores y sistemas principales | Nivel 1 |
| `c4-containers.mmd` | Contenedores: Next.js, Payload CMS, NestJS, PostgreSQL, SQLite | Nivel 2 |

## Diagramas de secuencia

| Archivo | Descripción |
|---------|-------------|
| `sequence-create-product-sync.mmd` | Crear producto en Payload → outbox → NestJS → PostgreSQL (ADR-P04) |
| `sequence-logical-deletion.mmd` | Eliminación lógica desde NestJS y desde Payload (ADR-P03) |
| `sequence-storefront-reads-nestjs.mmd` | Lectura de productos desde Next.js a través de NestJS (ADR-P01) |

## Cómo visualizar los diagramas

Los archivos `.mmd` se pueden visualizar con:
- Extensión "Mermaid Preview" en Visual Studio Code
- Mermaid Live Editor: https://mermaid.live
- Cualquier visor de Markdown con soporte para Mermaid (GitHub, GitLab, etc.)

## Estado

Los diagramas reflejan la arquitectura **deseada** después de aprobar ADR-P01 a ADR-P04. Algunos flujos (como el worker de outbox y el AuthGuard de NestJS) aún no están implementados y se marcan como "futuro" en los diagramas.