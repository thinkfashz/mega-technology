# Pantalla · Servicio técnico

**Ruta:** `#/service` · **Archivo:** `service.js` + `service.css` · **Tab activo:** ninguno
**Objetivo:** captar solicitudes de reparación y responder dudas sin salir a otra app.

## Estructura

| Bloque | Clase | Función |
|---|---|---|
| Hero | `.svc-hero` | “Diagnóstico gratis · sin compromiso”. |
| Servicios | `.svc-list` | Pantalla, batería, puerto de carga y daño por agua, con precio “desde”. |
| Por qué elegirnos | `.svc-why` | Garantía, repuestos y técnicos. |
| Formulario | `.svc-form` | Equipo, modelo, falla, nombre y teléfono. |
| CTA | `[data-request]` | **Solicitar diagnóstico** → `POST /service-requests`. |
| Contacto | `.svc-contact` | WhatsApp y horario. |

## Formulario

| Campo | Tipo | Regla |
|---|---|---|
| Equipo | select | iPhone, Android, iPad, otro. |
| Modelo | texto | ≥ 2 caracteres. |
| Falla | textarea | ≥ 10 caracteres. |
| Nombre | texto | ≥ 3 caracteres. |
| Teléfono | tel | ≥ 8 dígitos. |

Al enviar:

```js
const request = await api.serviceRequest({ device, model, issue, name, phone });
```

En modo local se guarda en `localStorage["mega.serviceRequests"]` con id `SR-…` y
estado `received`. En remoto va a `POST /service-requests`.

Después se muestra una hoja de confirmación con el número de solicitud y un botón
para abrir WhatsApp con el mensaje prellenado.

## Servicios y precios

Los precios son “desde” y salen de `app/data/service.json` (`service.items`).
El diagnóstico es gratuito; la reparación se cotiza después de revisar el equipo.

## Interacciones

- **Servicio** → preselecciona la falla en el formulario y hace scroll.
- **WhatsApp** → `wa.me` con texto `Hola MEGA, quiero cotizar…`.
- **Solicitar** → valida, envía y abre la hoja de éxito.
- **Llamar** → `tel:` (en Android abre el marcador).

## Accesibilidad

- Formulario con labels visibles y `autocomplete`.
- Errores junto al campo, con foco automático.
- Enlaces externos con `rel="noopener"` y aviso de que salen de la app.

## API

| Método | Ruta | Estado |
|---|---|---|
| `POST` | `/service-requests` | Implementado en modo local. |
| `GET` | `/service-requests/:id` | Propuesto (seguimiento). |

## Equivalencia Android

`ServiceScreen` con `ExposedDropdownMenuBox` para el equipo y
`KeyboardType.Phone`. El envío usa `ServiceRepository`; la confirmación es un
`AlertDialog` y el botón de WhatsApp lanza un `Intent.ACTION_VIEW` con
`https://wa.me/...`.

## Checklist

- [x] Validación completa antes de enviar.
- [x] La solicitud queda guardada y se puede repetir.
- [x] WhatsApp y teléfono funcionan como enlaces nativos.
- [x] Probado a 390 × 844.
