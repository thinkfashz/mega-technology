# Módulo 09 · API y Android

**Tiempo:** 90 min · **Resultado:** backend mock y la app portada a Kotlin.

## Parte 1 · la API

### El contrato

`api/openapi.yaml` describe cada endpoint con parámetros, cuerpos, respuestas y
errores. Es la referencia; el código la implementa.

### El transporte único

```js
export function createApi(store) {
  const mode = params.get("api") || "local";
  return {
    async products(filters) {
      await wait(90 + Math.random() * 120);   // latencia simulada
      if (mode === "remote") return http(`/products?${qs}`);
      return store.queryProducts(filters);
    },
  };
}
```

La UI llama `api.*` y nunca `fetch`. Eso permite pasar de local a remoto sin
tocar una pantalla.

### El mock

```sh
node api/mock/server.mjs
# http://127.0.0.1:8788/api
```

Sin dependencias, con `node:http`. Recalcula los totales, descuenta stock y
devuelve `409` si no alcanza.

### Probar la app contra el mock

```text
http://127.0.0.1:8787/app/?api=remote&base=http://127.0.0.1:8788/api#/home
```

## Parte 2 · Android

### Los tokens viajan

| Web | Android |
|---|---|
| `--m-lime: #c8f542` | `MegaLime = Color(0xFFC8F542)` |
| `tokens.css` | `ui/theme/Color.kt` |
| `components.css` | `ui/components/` |

### El estado

```kotlin
data class ShopUiState(
    val products: List<Product> = emptyList(),
    val cart: List<CartLine> = emptyList(),
    val orders: List<Order> = emptyList(),
) {
    val cartCount: Int get() = cart.sumOf { it.qty }
    val total: Int get() = cart.sumOf { it.total } + shipping
}
```

Un solo `StateFlow`, getters derivados: la misma idea del store web.

### La red

```kotlin
interface MegaApi {
    @GET("products") suspend fun products(@Query("q") q: String? = null): List<Product>
    @POST("orders") suspend fun createOrder(@Body body: CreateOrderRequest): Order
}
```

Y un repositorio que traduce errores HTTP a mensajes en español. La UI nunca ve
Retrofit.

### La navegación

```kotlin
NavHost(navController, startDestination = "home") {
    composable("product/{id}", arguments = listOf(navArgument("id") { type = NavType.StringType })) { entry ->
        ProductScreen(productId = entry.arguments?.getString("id"))
    }
}
```

## Checklist

- [ ] `api/openapi.yaml` refleja lo que el mock implementa.
- [ ] La app corre en modo local y en modo remoto.
- [ ] `POST /orders` recalcula y devuelve 409 sin stock.
- [ ] Los tokens de la web están replicados en `Color.kt`.
- [ ] El ViewModel expone un `StateFlow` con los derivados ya calculados.

## Cierre

Proyecto terminado. Lo que sigue es tuyo:

- Backend real con base de datos y autenticación.
- Pasarela de pago real.
- Room para cachear y trabajar offline.
- Notificaciones push del estado de pedidos.
- Publicar en Play Store.
