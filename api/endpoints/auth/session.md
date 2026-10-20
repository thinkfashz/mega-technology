# POST /auth/session

> **Estado:** propuesto. El prototipo no tiene login: el perfil es local.
> El mock responde `501 NOT_IMPLEMENTED`.

Inicia sesión y devuelve un token con rol.

```http
POST /api/auth/session
Content-Type: application/json

{
  "email": "camila@example.cl",
  "password": "••••••••"
}
```

## Respuesta `200`

```json
{
  "token": "eyJhbGciOi…",
  "expiresAt": "2026-10-27T14:30:00.000Z",
  "user": {
    "id": "u_8f2a",
    "name": "Camila Rojas",
    "email": "camila@example.cl",
    "role": "customer"
  }
}
```

## Reglas

1. Contraseña ≥ 8 caracteres; hash con Argon2id o bcrypt (nunca texto plano).
2. Token JWT firmado (HS256/RS256) o sesión opaca en cookie `HttpOnly`.
3. Roles: `customer`, `admin`. El rol viaja en el token y se valida en cada request.
4. Rate limit por IP y por email (p. ej. 5 intentos / 15 min).
5. Mensaje genérico en credenciales inválidas: “Email o contraseña incorrectos”.
6. Logout: `DELETE /auth/session` (propuesto) invalida el refresh token.

## Errores

| HTTP | code | Cuándo |
|---|---|---|
| 401 | `UNAUTHORIZED` | Credenciales inválidas. |
| 422 | `VALIDATION` | Email o contraseña mal formados. |
| 429 | `RATE_LIMITED` | Demasiados intentos. |

## Por qué no está en el prototipo

El objetivo era probar la compra y el panel sin fricción. Agregar login antes de
tener backend solo agrega una pantalla falsa. Cuando exista API real, este endpoint
habilita:

- “Mis pedidos” por usuario (no por dispositivo).
- Panel admin protegido.
- Sincronización de carrito y favoritos entre dispositivos.
- Recuperación de contraseña y verificación de email.
