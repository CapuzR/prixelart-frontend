# Guía de migración a Turborepo

Esta guía describe los pasos recomendados para migrar el frontend actual de Prix (cliente, Artist Admin y Company Admin) y el nuevo frontend de Pinpon a un monorepo basado en Turborepo, reutilizando tipos, tokens de diseño, componentes shadcn/ui y configuraciones compartidas.

## Arquitectura objetivo

```
prixelart-frontend/
├─ apps/
│  ├─ consumer/          # e-commerce
│  ├─ artist-admin/
│  ├─ company-admin/
│  └─ pinpon/
├─ packages/
│  ├─ design-system/
│  ├─ tokens/
│  ├─ types/
│  ├─ utils/
│  └─ config/
└─ ...
```

### 2. Preparar la raíz del monorepo

1. **Crear carpetas base**
   ```bash
   mkdir -p apps packages
   ```
2. **Inicializar dependencias de trabajo**
   - Si **no** existe `package.json`: `pnpm init`
   - Si ya existe (caso actual), solo instala las dev deps en el workspace raíz:
     ```bash
     pnpm add -Dw turbo typescript
     ```
3. **pnpm-workspace.yaml**
   ```yaml
   packages:
     - 'apps/*'
     - 'packages/*'
   ```
4. **tsconfig.base.json**
   ```json
   {
     "extends": "./tsconfig.json",
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@prixpon/design-system": ["packages/design-system/src"],
         "@prixpon/types": ["packages/types/src"],
         "@prixpon/tokens": ["packages/tokens/src"],
         "@prixpon/config": ["packages/config/src"]
       }
     }
   }
   ```
5. **Scripts del root**
   ```bash
   pnpm pkg set scripts.dev="turbo run dev"
   pnpm pkg set scripts.build="turbo run build"
   pnpm pkg set scripts.lint="turbo run lint"
   pnpm pkg set scripts.test="turbo run test"
   ```
6. **turbo.json**
   ```json
   {
     "$schema": "https://turbo.build/schema.json",
     "pipeline": {
       "dev": { "cache": false, "dependsOn": ["^dev"] },
       "build": { "outputs": ["dist/**"], "dependsOn": ["^build"] },
       "lint": { "outputs": [] },
       "test": { "outputs": [] }
     }
   }
   ```
7. **Instalación inicial**
   ```bash
   pnpm install
   ```
   > Regenera `node_modules` con pnpm y crea `pnpm-lock.yaml`.

### 3. Configurar tooling compartido

#### 3.1 Crear paquete `config`
```bash
mkdir -p packages/config/src
cat <<'EOF' > packages/config/package.json
{
  "name": "@prixel/config",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./eslint": "./src/eslint.config.js",
    "./prettier": "./src/prettier.config.cjs",
    "./tsconfig": "./src/tsconfig.base.json"
  }
}
EOF
```

#### 3.2 Exportar ESLint y Prettier
```bash
cat <<'EOF' > packages/config/src/eslint.config.js
import pluginReact from 'eslint-plugin-react';
import tseslint from '@typescript-eslint/eslint-plugin';

export default [
  {
    ignores: ['dist', 'build', 'node_modules']
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      react: pluginReact,
      '@typescript-eslint': tseslint
    },
    languageOptions: {
      parser: '@typescript-eslint/parser'
    }
  }
];
EOF

cat <<'EOF' > packages/config/src/prettier.config.cjs
module.exports = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all'
};
EOF
```

#### 3.3 Extender las apps
En cada app crea un archivo (por ejemplo `apps/consumer/eslint.config.js`):
```js
import config from '@prixpon/config/eslint';

export default config;
```
Si todavía usas `.eslintrc.cjs`, añade:
```js
module.exports = {
  extends: ['@prixpon/config/eslint']
};
```

#### 3.4 tsconfig por app
```bash
cat <<'EOF' > apps/consumer/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src", "vite.config.ts"],
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
EOF
```
Repite para `artist-admin`, `company-admin` y `pinpon` ajustando la ruta relativa.

### 4. Crear paquetes compartidos

> Referencia rápida de contextos existentes:
> - `GlobalContext`: usado por admin, artist, consumer y orgs → mover a `packages/context`.
> - `CartContext`: exclusivo del e-commerce → déjalo dentro de `apps/consumer`.
> - `PrixerContext` (modales): hoy no se importa; muévelo junto al futuro app de Prixer o elimínalo hasta que se necesite.
> Esta clasificación evita revisar archivo por archivo ahora y te dice qué debe volverse package vs. qué queda en cada app.

> Otros directorios que funcionarán mejor como packages compartidos cuando empieces a dividir código:
> - `src/api` → `packages/api` (clientes `account`, `order`, etc.).
> - `src/lib` y `src/utils` → `packages/utils`.
> - `src/assets` / `src/images` → `packages/assets` o `packages/images` si los consumes desde código.
> - `src/context/api.ts` (helper de tasa de cambio) → muévelo junto a `GlobalContext` o a `packages/api`.
> Así evitas rutas relativas y cada app importa desde `@prixel/*` lo que necesite.

1. **`packages/design-system`**
  ```bash
  pnpm dlx shadcn@latest init --path packages/design-system
  # o crea manualmente:
  mkdir -p packages/design-system/src
  cat <<'EOF' > packages/design-system/package.json
  {
  "name": "@prixpon/design-system",
    "version": "0.1.0",
    "main": "./src/index.ts",
    "type": "module",
    "dependencies": {
     "class-variance-authority": "^0.7.1",
     "tailwindcss-animate": "^1.0.7"
    }
  }
  EOF
  ```
  - Copia componentes shadcn desde `src/components` a `packages/design-system/src`.
  - Exporta todo desde `packages/design-system/src/index.ts`.
  - Opcional: añade `tsup` para generar `dist` (`pnpm add -Dw tsup`).

2. **`packages/tokens`**
  ```bash
  mkdir -p packages/tokens/src
  cat <<'EOF' > packages/tokens/package.json
  {
    "name": "@prixpon/tokens",
    "version": "0.1.0",
    "type": "module"
  }
  EOF
  cp src/styles/tokens.ts packages/tokens/src/index.ts
  ```
  - Exporta también una versión JSON si necesitas consumirla fuera de TypeScript.

3. **`packages/types`**
  ```bash
  mkdir -p packages/types/src
  cat <<'EOF' > packages/types/package.json
  {
    "name": "@prixpon/types",
    "version": "0.1.0",
    "type": "module"
  }
  EOF
  mv src/types/* packages/types/src/
  exporta todo en `packages/types/src/index.ts`.
  ```

4. **`packages/utils`**
  ```bash
  mkdir -p packages/utils/src
  cat <<'EOF' > packages/utils/package.json
  {
    "name": "@prixpon/utils",
    "version": "0.1.0",
    "type": "module"
  }
  EOF
  cp -R src/lib packages/utils/src
  ```
  - Reexporta hooks y helpers desde `packages/utils/src/index.ts` y actualiza las apps para importar desde `@prixpon/utils`.

### 5. Migrar cada aplicación a `apps/`
1. **Mover carpeta** (ej. `mv src apps/consumer`). Mantén `public/` específico dentro de cada app.
2. **Actualizar imports** para usar las rutas de paquete.
3. **Configurar Vite**
   - Añade alias:
     ```ts
     resolve: {
       alias: {
         '@prixpon/design-system': path.resolve('../../packages/design-system/src')
       }
     }
     ```
   - Permite servir archivos fuera de la raíz: `server: { fs: { allow: ['..'] } }`.
4. **Scripts por app** en su `package.json` local:
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "lint": "eslint src --ext .ts,.tsx"
     }
   }
   ```
5. Repite para `artist-admin`, `company-admin` y crea el esqueleto de `pinpon` (`pnpm create vite`).
  - En la iteración actual el módulo `src/apps/artist` seguirá integrado dentro del nuevo `apps/consumer` hasta que exista el frontend independiente de Prixer. Cuando llegue esa fase, mueve esa carpeta a `apps/prixer` reutilizando los mismos packages compartidos.

### 6. Añadir pipelines de Turborepo
- Tareas sugeridas:
  - `dev`: depende de `^dev`, sin caché.
  - `build`: depende de `^build`, outputs `dist/**` y `packages/*/dist/**`.
  - `lint`/`test`: pueden cachearse.
- Define filtros útiles: `pnpm turbo run build --filter=apps/consumer`.
- Integra caché remoto si el equipo >1 persona.

### 7. Ajustar CI/CD
1. **Instalación**
   ```bash
   pnpm install --frozen-lockfile
   ```
2. **Cache** (GitHub Actions ejemplo):
   - `~/.pnpm-store` (clave: hash de `pnpm-lock.yaml`).
   - `.turbo` (clave: hash de `turbo.json` + commit).
3. **Pipelines**
   - `pnpm turbo run lint test build --filter=...[ci]` para evitar ejecuciones innecesarias.
   - Despliega cada app con su script (`consumer: pnpm turbo run build --filter=consumer`).

### 8. Verificación y QA
- Ejecuta `pnpm turbo run dev --filter=apps/consumer` y revisa hot reload.
- Corre `pnpm turbo run build` y valida bundlers.
- Corre tus pruebas e2e o unitarias (`pnpm turbo run test`).
- Añade Storybook/Chromatic si necesitas validar la librería UI.

### 9. Plan de implementación incremental
1. **Fase 0:** configurar root + scripts + CI.
2. **Fase 1:** migrar tokens/tipos + consumer.
3. **Fase 2:** migrar artist-admin y company-admin.
4. **Fase 3:** crear Pinpon app usando el design system.
5. **Fase 4:** apagar restos de MUI y documentar el flujo para nuevos equipos.

## Checklist de finalización
- [ ] `pnpm install` sin warnings.
- [ ] Todos los apps viven en `apps/*` y extienden `tsconfig.base`.
- [ ] Paquetes `@prixpon/*` resuelven desde `packages/*`.
- [ ] Turborepo cachea correctamente en local y CI.
- [ ] Scripts `pnpm dev|build|lint|test` funcionan a nivel raíz.
- [ ] Documentación actualizada (README + este documento).

## Tips y trampas comunes
- Evita versiones duplicadas de React; declara React en el root `package.json`.
- Si Turborepo no reconoce un paquete, revisa `package.json#name` y `pnpm-workspace.yaml`.
- Para Storybook o tests que requieren CSS globales desde `packages/design-system`, exporta un `index.css` y consúmelo explícitamente: `import '@prixpon/design-system/styles.css'`.
- Considera usar `changesets` si planeas publicar paquetes.
- Usa `git mv` para conservar historial cuando muevas carpetas.

## Recursos útiles
- [Documentación oficial de Turborepo](https://turbo.build/repo/docs)
- [Guía de pnpm Workspaces](https://pnpm.io/workspaces)
- [shadcn/ui + Turborepo ejemplo](https://github.com/shadcn/turbo-shadcn)
- [Vite + Turborepo referencia](https://turbo.build/repo/docs/guides/tools/vite)

Con esta secuencia tendrás una migración predecible, con componentes compartidos, tooling consistente y base lista para nuevas marcas como Pinpon.