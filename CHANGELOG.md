## v2.1.0 - 2025-12-11

* chore(release): v2.1.0 (c4dab5b)
* feat(ui): overhaul theme engine and finalize appearance settings - feat(settings): add live PreviewPanel and font application logic to Apariencia - refactor(theme): rewrite createAppTheme to support instant CSS variable updates - fix(sidebar): styling for active NavItems using dynamic theme variables - fix(sync): update TailwindDarkSync to inject RGB channels for transparency support (2529edd)
* fix(auth): resolve session persistence and revamp permissions UI - fix(api): inject auth_token in headers to support mobile sessions - fix(permissions): add timestamp to GET requests to prevent browser caching - feat(ui): replace Permissions page with cascading UserPermissionsDrawer (92f1ec6)

🔗 **Comparación:** https://github.com/khernan14/AutoLog/compare/v2.0.1...v2.1.0

## v2.0.0 - 2025-12-08

* chore(release): v2.0.0 (e908307)
* feat(security): implement 2FA flow and login alerts feat(settings): replace Profile section with new Home dashboard fix(auth): handle 2FA requirement in login flow (b31dbdc)
* docs(changelog): v1.3.0 (63d4bf6)

🔗 **Comparación:** https://github.com/khernan14/AutoLog/compare/v1.3.0...v2.0.0

## v1.3.0 - 2025-12-01

* chore(release): v1.3.0 (366052d)
* refactor(auth): reemplazar lectura de localStorage por flujo basado en cookies httpOnly (bc1a47e)
* docs(changelog): v1.2.1 (1ef265e)

🔗 **Comparación:** https://github.com/khernan14/AutoLog/compare/v1.2.1...v1.3.0

## v1.2.1 - 2025-11-27

* chore(release): v1.2.1 (ece4755)
* fix(ui): habilitar guardado en drawer (Sheet component onSubmit) (cf60b70)
* docs(changelog): v1.2.0 (0a452df)

🔗 **Comparación:** https://github.com/khernan14/AutoLog/compare/v1.2.0...v1.2.1

## v1.2.0 - 2025-11-26

* chore(release): v1.2.0 (62c2f96)
* Merge pull request #16 from khernan14/feat/ui-drawers-shortcuts (49d5581)
* feat(ui): reemplazar modales por drawers en m├│dulos principales (f32380e)
* docs(changelog): v1.1.4 (77be3c4)

🔗 **Comparación:** https://github.com/khernan14/AutoLog/compare/v1.1.4...v1.2.0

## v1.1.4 - 2025-11-23

* chore(release): v1.1.4 (4587285)
* Merge pull request #15 from khernan14/fix/ui-movimientos-secuenciales (f47e657)
* fix(ui): procesar movimientos de activos uno a uno para evitar fallos en lotes grandes (af35ac6)
* wip(api): cambiando numero de whatsapp para chatbot test (62b6626)
* docs(changelog): v1.1.3 (4ac5a47)

🔗 **Comparación:** https://github.com/khernan14/AutoLog/compare/v1.1.3...v1.1.4

## v1.1.3 - 2025-11-21

* chore(release): v1.1.3 (32dbb5a)
* feat(ui): Agregar 'Backup' a ESTATUS_ACTIVO (eb58362)
* docs(changelog): v1.1.2 (509fb81)

🔗 **Comparación:** https://github.com/khernan14/AutoLog/compare/v1.1.2...v1.1.3

## v1.1.2 - 2025-11-20

* chore(release): v1.1.2 (9798fb1)
* feat(ui): Se modifica la parte de login para sesiones publicas y privadas para redireccionar siempre a inicio (eb3ce5b)
* feat(ui): Se agrega QR a cada vehiculo para poder realizar registros de uso desde el QR (450266b)
* feat(ui): Se actualiza la vista de busqueda con Ctrl+K y se modifican estos archivos para resaltado de la busqueda (63400ef)
* docs(changelog): v1.1.1 (9df5151)

🔗 **Comparación:** https://github.com/khernan14/AutoLog/compare/v1.1.1...v1.1.2

## v1.1.1 - 2025-11-19

* chore(release): v1.1.1 (24e15ed)
* feat(ui): Se actualiza la vista de users y se agrega un boton de reset password (12335e1)
* modify(ui): Se cambia la parte del sidebar en vista mobile para que cierre auto el sidebar (8e0fe33)
* feat(ui): Se actualiza la vista de public page donde muestra los datos de los activos (a4099c9)
* feat(ui): Actualizar vistas de sites/activos_clientes/compa├▒ias (123033b)
* docs(changelog): v1.1.0 (6fac773)

🔗 **Comparación:** https://github.com/khernan14/AutoLog/compare/v1.1.0...v1.1.1

## v1.1.0 - 2025-11-18

* chore(release): v1.1.0 (62a8716)
* Merge pull request #14 from khernan14/feat/clientes-sites-ubicaciones (4f4a675)
* feat(ui): actualizar vistas de sites/activos/clientes/historial para nuevos campos (977c1d9)
* Merge pull request #13 from khernan14/feat/inventario-kardex (c9fdaf9)
* fix(ui): se arregla bug de filtros en activos (1fe3133)
* Merge pull request #12 from khernan14/feat/inventario-kardex (7115891)
* fix(ui): se arregla bug de filtros en activos (c7c34a5)
* Merge pull request #11 from khernan14/feat/inventario-kardex (69c27b9)
* fix(ui): se arregla bug de filtros en activos (4334a5b)
* Merge pull request #10 from khernan14/feat/inventario-kardex (d6ab4c2)
* fix/correccion en la parte de autocomplete (e36a788)
* Merge pull request #9 from khernan14/feat/inventario-kardex (0b0316f)
* fix/correccion en la parte de autocomplete (5a5c22e)
* Merge pull request #8 from khernan14/feat/inventario-kardex (1de0e57)
* refactor/Se agrega al select una opcion nueva y se modifica Modal para mostrar select de site y descripcion (71d5a1b)
* docs(changelog): v1.0.1 (d1500b6)

🔗 **Comparación:** https://github.com/khernan14/AutoLog/compare/v1.0.1...v1.1.0

## v1.0.1 - 2025-11-07

* chore(release): v1.0.1 (ccd4c85)
* Merge pull request #7 from khernan14/fix/logo-login (2f49b12)
* fix(ui): actualizar logo y ajustar textos en login y index.html (d62b381)
* Plantilla de Commits (7058969)
* modificando el release (356ab68)
* Update CHANGELOG for version 1.0.0 (4c6e768)
* Document release process and versioning in README (d9c94ba)
* docs(changelog): v1.0.0 (83f939a)

🔗 **Comparación:** https://github.com/khernan14/AutoLog/compare/v1.0.0...v1.0.1

## v1.0.0 - 2025-11-06

✨ **Novedades**
- Inventario: nuevo tab de *detalles de clientes* más visual y funcional.
- UI: menú contextual del footer del sidebar migrado a componentes de shadcn.
- Importación masiva de activos (primer corte).

🐛 **Fixes**
- Tailwind v4: ajustes de build y compat con algunas versiones.

🧰 **Chore / Infra**
- Config Tailwind v4 con plugin de Vite.
- Limpieza y organización de estilos.

<details>
  <summary>📋 Detalle de commits</summary>

- Se modifica el tab de detalles de los clientes a uno más visual y funcional (dc8f959)  
- Cambiando menú contextual del footer del sidebar con componentes de shadcn (7f052c7)  
- Agregando importación para insertar activos al por mayor (ec60c45)  
- fixed: se solucionó un problema con algunas versiones de tailwind (57ce20c)
</details>

🔗 **Comparación**
- Full changelog: https://github.com/khernan14/AutoLog/compare/prod-2025-11-04...v1.0.0

> Nota: si sigues **Conventional Commits** (`feat:`, `fix:`, `chore:`…), herramientas como `conventional-changelog` te generan estas secciones solitas.











