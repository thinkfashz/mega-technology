# Pantalla · Checkout

**Ruta:** `#/checkout` · **Archivo:** `checkout.js` + `checkout.css` · **Tab activo:** ninguno
**Objetivo:** capturar datos de contacto y entrega (paso 1 de 3).

## Estructura

| Bloque | Clase | Función |
|---|---|---|
| Cabecera de flujo | `.flow-head` | Título, subtítulo y `flowSteps(1)`. |
| Formulario | `.form-card` | Nombre, teléfono, dirección y ciudad. |
| Pago sugerido | `.pay-preview` | Tarjeta terminada en 4242; enlaza a `#/payment`. |
| Resumen | `.summary` | Detalle compacto del pedido. |
| CTA | `[data-continue]` | **Confirmar Compra** → `#/payment`. |

## Validación

| Campo | Regla | Mensaje |
|---|---|---|
| Nombre | ≥ 3 caracteres | “Ingresa tu nombre completo”. |
| Teléfono | ≥ 8 dígitos | “Teléfono inválido”. |
| Dirección | ≥ 5 caracteres | “Ingresa una dirección”. |
| Ciudad | ≥ 3 caracteres | “Ingresa tu ciudad”. |

La validación ocurre en el submit. El primer campo inválido recibe foco y borde
rojo; no se navega hasta que todo esté correcto.

## Persistencia

`store.setProfile({ name, phone, address, city })` guarda en `mega.v4` y precarga
el formulario en la próxima compra. `store.checkout` conserva el paso y el método
de pago.

## Flujo

```
carrito → checkout (datos) → payment (método) → shipping (envío) → orden creada
```

El header no muestra tab activo durante el flujo: es una tarea, no una sección.
La flecha vuelve a `#/cart`; el botón del navegador respeta el historial.

## Accesibilidad

- `label` visible y asociado por `for`/`id`.
- `autocomplete`: `name`, `tel`, `street-address`, `address-level2`.
- `inputmode="tel"` en teléfono.
- Errores con `aria-invalid` y texto, no solo color.
- El foco se mueve al primer error.

## API

No hay llamada de red en este paso: los datos se validan y se guardan localmente.
Al confirmar el envío, `POST /orders` recibe `customer`, `items`, `payment`,
`delivery` y totales calculados.

## Equivalencia Android

`CheckoutScreen` con `OutlinedTextField`s, `KeyboardOptions(KeyboardType.Phone)` y
`VisualTransformation` para el teléfono. El estado vive en `CheckoutViewModel`
(`SavedStateHandle`). El CTA del `Scaffold` usa `enabled = form.isValid`.

## Checklist

- [x] Los cuatro campos validan antes de avanzar.
- [x] Los datos se reutilizan en la siguiente compra.
- [x] El resumen refleja el carrito actual.
- [x] Probado a 390 × 844.
