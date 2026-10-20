# Pantalla · Perfil

**Ruta:** `#/profile` · **Archivo:** `profile.js` + `profile.css` · **Tab activo:** Perfil
**Objetivo:** administrar datos, preferencias y acceso al panel sin sistema de cuentas.

## Estructura

| Bloque | Clase | Función |
|---|---|---|
| Tarjeta de identidad | `.profile__head` | Avatar con iniciales, nombre, teléfono y nivel MEGA PRO. |
| Métricas | `.profile__stats` | Pedidos, favoritos y total comprado. |
| Compras | `.profile__group` | Mis pedidos, favoritos y dirección. |
| Servicios | `.profile__group` | Servicio técnico, ayuda y WhatsApp. |
| Administración | `.profile__group` | Acceso directo al panel (`#/admin`). |
| Preferencias | `.profile__group` | Notificaciones, biometría y novedades. |
| Datos | `.profile__group` | Exportar JSON y reiniciar demo. |

## Datos

- `store.profile` — nombre, teléfono, correo, dirección, ciudad.
- `store.orders` — total gastado (excluye cancelados).
- `store.favorites` — contador.
- `store.settings` — `notifications`, `biometrics`, `newsletter`.
- Puntos MEGA PRO: `Math.round(gastado / 1000)`.

## Edición

- **Lápiz** → hoja con nombre, teléfono, correo, dirección y ciudad.
- **Dirección** → hoja específica con dirección y ciudad.
- Validación: nombre ≥ 3, teléfono ≥ 8 dígitos, dirección ≥ 5, ciudad ≥ 3.
- Al guardar se usa `store.setProfile()` y se re-renderiza con `navigate(..., { replace: true })`.

## Preferencias

Cada switch usa `role="switch"` + `aria-checked`. El cambio se persiste en
`mega.v4` y se confirma con un toast. En el prototipo son preferencias locales:
no hay push real ni biometría nativa.

## Datos y sesión

- **Exportar mis datos** → descarga un JSON con perfil, pedidos, favoritos y carrito.
- **Reiniciar demo local** → `ask()` con tono danger; borra `mega.v4` y recarga en Home.

## Accesibilidad

- Filas son enlaces o botones reales, no `div` con click.
- Switch con etiqueta accesible.
- El avatar tiene texto alternativo a través del nombre visible.
- Contraste de texto secundario ≥ 4.5:1 sobre `#101010`.

## Equivalencia Android

`ProfileScreen` con `LazyColumn` de `ListItem`s. Los switches usan
`Switch(checked, onCheckedChange)`. Exportar usa `ACTION_CREATE_DOCUMENT` y
`DataStore` para preferencias. El reinicio borra Room + DataStore con confirmación.

## Checklist

- [x] Edición de perfil y dirección persiste.
- [x] Los switches reflejan el estado guardado.
- [x] Exportar descarga JSON válido.
- [x] Reiniciar pide confirmación y vuelve a Home.
- [x] Probado a 390 × 844.
