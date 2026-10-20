# Pantalla · Pago

**Ruta:** `#/payment` · **Archivo:** `payment.js` + `payment.css` · **Tab activo:** ninguno
**Objetivo:** elegir el método de pago (paso 2 de 3).

## Estructura

| Bloque | Clase | Función |
|---|---|---|
| Cabecera de flujo | `.flow-head` | “Métodos de pago” + `flowSteps(2)`. |
| Métodos | `.choice-list` | Tarjeta, Apple Pay y contra entrega. |
| Resumen | `.summary` | Detalle del pedido y total. |
| CTA | `.payment__cta` | **Comprar Ahora** → `#/shipping`. |
| Nota de seguridad | `.payment__note` | Aclara que no se almacenan datos de tarjeta. |

## Métodos

| ID | Título | Comportamiento |
|---|---|---|
| `card` | Tarjeta Crédito / Débito ···· 4242 | Selección por defecto. |
| `apple` | Apple Pay | Pago rápido (simulado en el prototipo). |
| `cash` | Pago contra entrega | Cobro al recibir. |

La selección se guarda con `store.setCheckout({ payment })` y se refleja en la
orden final. En modo remoto, el backend debe validar el método antes de aceptar
la orden.

## Reglas

1. Si el carrito está vacío se muestra `emptyCart()`.
2. El CTA no procesa dinero en el prototipo: solo persiste la elección y navega.
3. En producción, `POST /payments/intent` devuelve un `clientSecret`; el cobro se
   confirma con el webhook del proveedor antes de marcar la orden como `paid`.
4. Los datos de tarjeta **nunca** tocan el store local ni el backend propio.

## Interacciones

- **Método** → actualiza `aria-checked`, radio visual y toast.
- **Comprar Ahora** → `navigate("/shipping")`.
- **Atrás** → `#/checkout` conservando los datos.

## Accesibilidad

- Grupo con `role="radiogroup"` y cada opción `role="radio"`.
- Navegación con flechas cuando el foco está en el grupo (mejora progresiva).
- El estado seleccionado no depende solo del color: hay radio + borde.

## API

| Endpoint | Uso |
|---|---|
| `POST /payments/intent` | Propuesto: crear intención de pago. |
| `POST /payments/webhook` | Propuesto: confirmación asíncrona del proveedor. |

El prototipo no los llama; documenta el contrato en `api/endpoints/payments/`.

## Equivalencia Android

`PaymentScreen` con `RadioButton` dentro de `Card`. Para producción:
`Google Pay`/`Apple Pay` vía SDK nativo y `PaymentSheet`; el backend crea el
`PaymentIntent` y la app solo recibe el resultado.

## Checklist

- [x] Los tres métodos se seleccionan y persisten.
- [x] El resumen coincide con el carrito.
- [x] CTA avanza al paso 3.
- [x] Probado a 390 × 844.
