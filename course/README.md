# Curso · construir MEGA TECHNOLOGY desde cero

10 módulos en orden de mejores prácticas. Cada módulo dura entre 45 y 90 minutos y
termina con algo que se puede ver en el navegador o en el teléfono.

| # | Módulo | Resultado |
|---|---|---|
| 00 | [Preparar el terreno](modules/00-preparacion.md) | Servidor, estructura de carpetas y tokens. |
| 01 | [Sistema de diseño](modules/01-diseno.md) | Paleta, tipografía y componentes base. |
| 02 | [Datos y estado](modules/02-datos.md) | Catálogo, store y persistencia. |
| 03 | [Chrome y navegación](modules/03-navegacion.md) | Header, barra inferior, router y hojas. |
| 04 | [Catálogo y búsqueda](modules/04-catalogo.md) | Grilla, filtros, búsqueda y favoritos. |
| 05 | [Detalle de producto](modules/05-producto.md) | Galería, color, stock y carrito. |
| 06 | [Flujo de compra](modules/06-compra.md) | Checkout, pago, envío y orden. |
| 07 | [Pedidos y perfil](modules/07-cuenta.md) | Seguimiento, ajustes y exportación. |
| 08 | [Panel administrador](modules/08-admin.md) | KPIs, gráfico, stock y CSV. |
| 09 | [API y Android](modules/09-api-android.md) | Contrato REST y equivalencia en Kotlin. |

## Cómo estudiar

1. Leé el módulo completo antes de escribir código.
2. Escribí sin copiar y pegando: el objetivo es entender el orden, no memorizar.
3. Compará con la referencia del repo (`app/src/...`).
4. Terminá el checklist del módulo. Todos los checks verdes antes de seguir.

## Regla de oro

> Ninguna pantalla escribe estado suelto. Todo pasa por el store, y el store es el
> único que persiste.

Si rompes esa regla, aparecen bugs del tipo “el carrito dice 3 y el resumen 2”.

## Antes de empezar

- Un navegador moderno (Chrome, Edge, Safari o Firefox).
- Node 18+ (solo para el mock de API, opcional).
- 2 GB libres de RAM: la app es liviana, pero el navegador no.
- Editor de texto con soporte de HTML/CSS/JS.

No necesitas: framework, bundler, base de datos, servidor de pagos ni cuenta de
nube. Eso es deliberado: la primera versión tiene que correr en cualquier
computador con un comando.
