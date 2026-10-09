# Portal San Pablo — E-commerce

Monorepo base del nuevo **E-commerce Portal San Pablo**.

## Estructura actual

```
portal-san-pablo/
├── apps/                 # Aplicaciones (se agregan en pasos siguientes)
├── packages/             # Paquetes compartidos (se agregan en pasos siguientes)
├── package.json          # Configuración raíz del monorepo
├── pnpm-workspace.yaml   # Definición de workspaces de pnpm
├── turbo.json            # Pipeline de tareas de Turborepo
├── tsconfig.json         # Configuración base de TypeScript
├── .gitignore
└── README.md
```

## Stack base

- **pnpm** 10.34.3 — package manager y workspaces
- **Turborepo** 2.x — task runner / build system del monorepo
- **TypeScript** — lenguaje base

## Comandos

```bash
pnpm install    # Instala dependencias del workspace
pnpm build      # Ejecuta build en todos los paquetes (turbo)
pnpm dev        # Modo desarrollo (turbo)
pnpm lint       # Lint en todos los paquetes (turbo)
pnpm format     # Formateo (turbo)
pnpm clean      # Limpieza (turbo)
```

## Estado

**PASO 0 completado**: base mínima del monorepo (pnpm + Turborepo + TypeScript).
No hay aplicaciones ni funcionalidad de negocio todavía.
