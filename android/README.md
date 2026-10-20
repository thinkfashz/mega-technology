# Android · MEGA TECHNOLOGY

Scaffolding de referencia en **Kotlin + Jetpack Compose + Material 3**. No se compila
en este entorno (no hay Android SDK), pero está completo y ordenado para abrirlo en
Android Studio y compilar sin cambios.

Es el gemelo de la app web: mismas pantallas, mismo contrato de API, mismos tokens.

## Estructura

```
android/
├── settings.gradle.kts
├── build.gradle.kts              # versiones de plugins
├── gradle.properties
└── app/
    ├── build.gradle.kts           # SDK 35, min 26, Compose BOM, Retrofit
    ├── proguard-rules.pro
    └── src/main/
        ├── AndroidManifest.xml    # permisos y deep links
        ├── res/
        │   ├── values/            # strings, colors, themes
        │   ├── xml/               # network security, backup rules
        │   ├── drawable/          # icono vectorial
        │   └── mipmap-anydpi-v26/ # adaptive icon
        └── java/cl/megatechnology/shop/
            ├── MegaApp.kt             # Application
            ├── MainActivity.kt        # activity + setContent
            ├── data/
            │   ├── ServiceLocator.kt
            │   ├── model/Models.kt     # @Serializable
            │   ├── remote/MegaApi.kt   # interfaz Retrofit
            │   ├── remote/NetworkModule.kt
            │   └── repository/ShopRepository.kt
            ├── ui/
            │   ├── MegaRoot.kt         # NavigationBar + NavHost
            │   ├── ShopViewModel.kt    # StateFlow
            │   ├── theme/              # Color, Type, Theme
            │   ├── components/         # ProductArt, ProductCard
            │   └── screens/            # Home, Catalog, Favorites, Profile,
            │                           # Product, Cart, Checkout, Orders,
            │                           # Service, Admin
            └── util/Format.kt
```

## Mapeo web → Compose

| Web (`app/`) | Android (`android/`) |
|---|---|
| `styles/tokens.css` | `ui/theme/Color.kt` + `Theme.kt` |
| `styles/components.css` | `ui/components/` |
| `core/store.js` | `ShopViewModel` + `StateFlow` |
| `core/api.js` | `data/repository/ShopRepository` + `MegaApi` (Retrofit) |
| `core/router.js` | `ui/MegaRoot.kt` (Navigation Compose) |
| `ui/chrome.js` | `MegaRoot` (Scaffold + NavigationBar) |
| `ui/art.js` | `ui/components/ProductArt.kt` (ícono + gradiente) |
| `ui/motion.js` | `animateContentSize`, `AnimatedVisibility`, `Crossfade` |
| `screens/*/` | `ui/screens/*.kt` |

## Compilar

```sh
cd android
./gradlew :app:assembleDebug
```

Requiere Android Studio Hedgehog+ o SDK 35 y JDK 17.

### Apuntar a la API

`app/build.gradle.kts` define `API_BASE_URL`:

| Contexto | URL |
|---|---|
| Emulador | `http://10.0.2.2:8788/api/` (ya por defecto) |
| Teléfono real | `http://<IP-del-pc>:8788/api/` |
| Producción | `https://api.megatechnology.cl/api/` |

El mock local corre en `node api/mock/server.mjs`. En `debug` el cleartext HTTP está
permitido solo para `10.0.2.2`, `localhost` y `127.0.0.1`
(`res/xml/network_security_config.xml`); en release solo HTTPS.

## Permisos

| Permiso | Para qué | ¿Se pide al usuario? |
|---|---|---|
| `INTERNET` | Catálogo, pedidos, panel. | No (normal). |
| `ACCESS_NETWORK_STATE` | Detectar sin conexión. | No. |
| `POST_NOTIFICATIONS` | Avisos de estado de pedido. | Sí, en Android 13+. |
| `USE_BIOMETRIC` | Preferencia “Biometría” del perfil. | Sí, al activarla. |
| `VIBRATE` | Feedback táctil en carrito. | No. |

**No** se piden cámara, fotos ni ubicación: el arte es vectorial y la dirección se
escribe a mano. Si se agrega escaneo de QR o fotos de reparación, pedir esos
permisos en el momento de uso, con explicación.

## Recursos y assets

| Necesidad | Solución | Nota |
|---|---|---|
| Iconos de launcher | `res/mipmap-anydpi-v26/ic_launcher.xml` | Adaptive icon, vectorial. |
| Marca | `res/drawable/ic_launcher_foreground.xml` | Monograma M dorado, mismo trazo que la web. |
| Tipografía | `res/font/inter-*.ttf` (opcional) | Copiar desde `app/assets/fonts/`. |
| Fotos de producto | `res/drawable-nodpi/` | El prototipo usa vector; en prod, WebP. |
| Color de estado bar | `Theme.kt` | `MegaBg` en status y navigation bar. |

## Componentes clave

### `MegaTheme`

Tema oscuro único. `darkColorScheme` con los tokens de la marca y `Typography`
basada en Inter. El sistema fuerza barras oscura: la app no tiene modo claro.

### `ProductArt`

Sustituto del SVG de la web: gradiente radial con el color del producto + ícono
según `kind` (`case`, `phone`, `buds`, `watch`, `charger`, `cable`). Cero fotos,
cero descargas.

### `ShopViewModel`

Un solo `StateFlow<ShopUiState>` con productos, categorías, carrito, favoritos,
pedidos, stats y error. Las mutaciones son funciones simples y el estado se
recompone solo. En producción: `Room` como caché y `WorkManager` para la cola
offline.

### `ShopRepository`

Único punto de acceso a datos. Envuelve las llamadas Retrofit y traduce errores
HTTP a mensajes en español para los toasts. La UI nunca ve `Retrofit`.

## De la web a Android, paso a paso

1. **Tokens** → `Color.kt` y `Type.kt` (mismos valores hexadecimales).
2. **Datos** → `Models.kt` con `@Serializable` (mismos nombres de campo que el JSON).
3. **Transporte** → `MegaApi.kt` con las rutas de `api/openapi.yaml`.
4. **Estado** → `ShopViewModel` con `StateFlow` (equivalente a `store.js`).
5. **Chrome** → `MegaRoot` con `NavigationBar` + `NavHost`.
6. **Pantallas** → una función por pantalla, siguiendo el orden de la app web.
7. **Calidad** → aplicar el checklist de accesibilidad de `Documentd/design-system.html`.

## Pendiente para producción

- [ ] Room como caché offline + `WorkManager` para sincronizar.
- [ ] Hilt en vez de `ServiceLocator`.
- [ ] `BiometricPrompt` real para la preferencia de biometría.
- [ ] Firebase/FCM para el estado de pedidos en push.
- [ ] Tests: unitarios del `ViewModel` y de la validación de checkout.
- [ ] `screenshotTest` de Compose para regresión visual.
- [ ] Perspectivas y Compose para tablet (la web es mobile-first).
