# MEGA TECHNOLOGY · Phone Shop

Ecommerce móvil de iPhone, fundas, audio y servicio técnico. Diseño oscuro con
acento lima y dorado, 13 pantallas navegables, panel administrador con datos reales,
API documentada, scaffolding Android y un curso de 10 módulos.

Todo vive en esta carpeta. No hay build, no hay framework, no hay base de datos:
se abre y funciona.

## Vivo

| Qué | Link |
|---|---|
| Tienda | https://mega-technology.vercel.app/app/ |
| Panel admin | https://mega-technology.vercel.app/app/#/admin |
| Documentación | https://mega-technology.vercel.app/Documentd/ |
| Código | https://github.com/thinkfashz/mega-technology |

Vercel despliega solo con cada push a `main` (el repo está conectado al proyecto).

## Partidas rápidas

```sh
bash serve.sh 8787
```

| Qué | Dónde |
|---|---|
| App | http://127.0.0.1:8787/app/ |
| Panel admin | http://127.0.0.1:8787/app/#/admin |
| Documentación | http://127.0.0.1:8787/Documentd/ |
| API mock | `node api/mock/server.mjs` → http://127.0.0.1:8788/api |

Para probar la app contra el mock: `http://127.0.0.1:8787/app/?api=remote&base=http://127.0.0.1:8788/api#/home`

## Qué hay adentro

| Carpeta | Contenido |
|---|---|
| `app/` | La app: HTML + CSS + módulos ES. 13 pantallas, store local-first, PWA. |
| `Documentd/` | Documentación HTML: inicio, diseño, pantallas, arquitectura, diagrama animado, API, Android y curso. |
| `api/` | `openapi.yaml`, endpoints documentados por dominio y un mock en Node sin dependencias. |
| `android/` | Kotlin + Jetpack Compose + Material 3 + Retrofit: el gemelo nativo. |
| `course/` | 10 módulos con teoría, código y checklist. |

## La app en 60 segundos

1. **Home** → hero con arte 3D, categorías y más vendidos.
2. **Catálogo** → 14 productos con filtros por categoría, color, precio y orden.
3. **Producto** → color, stock, favorito y carrito.
4. **Checkout → Pago → Envío** → se crea la orden `MT-####`.
5. **Mis pedidos** → timeline del pedido y “volver a pedir”.
6. **Panel** → KPIs, gráfico de ventas, cambio de estado de pedidos, stock y precios, alta de productos y export CSV.

El carrito, los pedidos y los cambios del panel viven en `localStorage["mega.v4"]`.
El panel opera **el mismo estado** que la tienda: cambiar un estado de pedido se ve
al instante en “Mis pedidos”.

## Decisiones de diseño

- **Tokens, no colores sueltos.** `app/styles/tokens.css` es la única fuente.
- **Una acción lima por pantalla.** El dorado es marca y administración.
- **SVG, no fotos.** Cada producto se dibuja con `{ kind, color }`, así el admin
  puede crear productos sin subir nada.
- **El estado en la URL.** Los filtros viven en el query: se comparten y sobreviven
  al recargar.
- **La UI nunca habla con la red.** `core/api.js` decide: local (store) o remoto
  (HTTP). Cambiar de modo no toca una pantalla.
- **El servidor manda.** En producción, precios y stock se recalculan al crear la orden.

## Documentación

La carpeta `Documentd/` es la documentación navegable, con capturas reales de la app:

| Página | Contenido |
|---|---|
| `index.html` | Punto de entrada: qué es real, qué está simulado, mapa de la doc. |
| `screens.html` | Las 13 pantallas con captura, ruta y función. |
| `design-system.html` | Tokens, tipografía, componentes y el orden normativo de una vista. |
| `architecture.html` | Capas, contrato de pantalla, store, router, movimiento y PWA. |
| `diagram.html` | Diagrama animado de conexiones (compra, datos y admin). |
| `api.html` | Endpoints implementados y propuestos, errores, checklist de producción. |
| `android.html` | Mapeo web → Compose, permisos, recursos y compilación. |
| `course.html` | Los 10 módulos del curso. |

Además, cada pantalla tiene su `<pantalla>.md` con la anatomía, los datos que
consume, las interacciones, la equivalencia Android y su checklist.

## API

```sh
node api/mock/server.mjs
```

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/products` | Catálogo con filtros. |
| GET | `/api/products/{id}` | Detalle por id o slug. |
| GET | `/api/categories` | Categorías con conteo. |
| GET | `/api/orders` | Historial. |
| POST | `/api/orders` | Crea la orden, recalcula y descuenta stock. |
| PATCH | `/api/orders/{id}` | Cambia el estado y regenera el timeline. |
| POST | `/api/service-requests` | Solicitud de diagnóstico. |
| GET | `/api/admin/stats` | KPIs y serie diaria. |
| POST | `/api/admin/products` | Alta de producto. |
| PATCH | `/api/admin/products/{id}` | Precio, stock, nombre. |

Propuestos y documentados (responden `501`): `/api/payments/intent`,
`/api/payments/webhook`, `/api/shipping/quote`, `/api/auth/session`.

El contrato completo está en `api/openapi.yaml`.

## Android

`android/` es el port a Kotlin/Compose: mismos tokens, mismo contrato de API,
mismo orden de pantallas. No se compila en este entorno (no hay Android SDK), pero
está completo:

```sh
cd android && ./gradlew :app:assembleDebug
```

## Publicar

### GitHub + Vercel (sitio estático)

1. Crear la carpeta de publicación con lo que se quiere exponer:

```sh
mkdir -p /tmp/mega-publish
cp -r app Documentd api android course /tmp/mega-publish/
```

2. Inicializar y subir:

```sh
cd /tmp/mega-publish
git init -b main
git add -A
git commit -m "MEGA TECHNOLOGY · Phone Shop v4"
gh repo create mega-technology --private --source=. --push
```

3. Desplegar en Vercel:

```sh
vercel --prod --yes
# o conectar el repo en dashboard.vercel.com
```

- **Framework preset:** `Other`
- **Output directory:** `.` (o `app/` si solo se publica la tienda)
- **Rewrites:** `/(.*) → /app/index.html` solo si se sirve la raíz como la app

4. Links resultantes:

```text
https://<proyecto>.vercel.app/app/      # tienda
https://<proyecto>.vercel.app/Documentd/ # documentación
```

> `api/mock/server.mjs` es un servidor Node: no corre en Vercel estático. En Vercel
> se puede montar como Serverless Function en `api/products.js` si se necesita.

### Notas de despliegue

- La app usa **hash routing**: no requiere rewrites.
- Los recursos del servicio worker solo se registran con `?sw=1`.
- Las capturas de `Documentd/assets/shots/` son PNG (~1,2 MB en total).
- Si se publica solo `app/`, el manifest y los `../` relativos siguen funcionando.

## Licencia y créditos

Proyecto de demostración. Los datos de productos, clientes y pedidos son ficticios.
MEGA TECHNOLOGY es una marca del ejercicio.
