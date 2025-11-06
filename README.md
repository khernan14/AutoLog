# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## 📦 Releases y versionado (SemVer)

Este repo usa **SemVer**: `MAJOR.MINOR.PATCH`  
- **MAJOR**: cambios incompatibles (breaking).  
- **MINOR**: nuevas features compatibles.  
- **PATCH**: fixes sin cambios de API.

Para automatizar el release usamos **`release.ps1`** (PowerShell).  
El script:
- Corre `npm test` y `npm run build` (si existen).
- Hace `npm version` (actualiza `package.json`, crea commit y tag).
- Actualiza `CHANGELOG.md` (si tienes `conventional-changelog`, lo usa).
- Hace `git push` de la rama y los **tags**.
- (Opcional) Crea un **GitHub Release** si tienes la CLI `gh` autenticada.

### 🔧 Requisitos
- Tener `git` y `npm` instalados.
- Estar en la rama **main** con **working tree limpio**.
- Opcional: `gh` (GitHub CLI) si quieres que cree el Release automáticamente.
- Opcional: `conventional-changelog` (vía `npx`) para changelog más bonito.

### ▶️ Uso básico

**1) Fijar versión exacta** (ej. tu primer release estable):
```powershell
# Windows PowerShell, en la raíz del repo
.\release.ps1 -Version 1.0.0
# Patch: 1.0.0 -> 1.0.1
.\release.ps1 -Bump patch

# Minor: 1.0.1 -> 1.1.0
.\release.ps1 -Bump minor

# Major: 1.1.0 -> 2.0.0
.\release.ps1 -Bump major

