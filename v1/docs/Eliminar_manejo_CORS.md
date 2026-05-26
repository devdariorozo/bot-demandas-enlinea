# Eliminación del manejo de CORS

**Fecha:** 2026-05-22
**Autor:** Ramon Dario Rozo Torres

---

## Contexto

Se tomó la decisión de deshabilitar el manejo de CORS en el proyecto por solicitud del area de cloud. La configuración se conserva comentada en el código fuente para poder reactivarse en el futuro sin necesidad de reconstruirla desde cero.

---

## Cambios realizados

### Archivo: `v1/src/main.ts`

Se comentaron los siguientes bloques de código:

#### 1. Import de tipos Express (línea 5)

```typescript
// Antes (activo):
import type { Request, Response, NextFunction } from 'express';

// Ahora (comentado):
// import type { Request, Response, NextFunction } from 'express'; // Usado por el bloque CORS (deshabilitado)
```

Estos tipos solo eran necesarios para el handler Express-level de errores CORS. Al no estar en uso, se comentaron junto con el bloque que los requería.

#### 2. Lectura de variable de entorno y configuración de orígenes permitidos

```typescript
// const corsRaw = process.env.CORS_ALLOWED_ORIGINS?.trim() ?? '';
// const corsAllowAll = corsRaw === '*';
// const corsAllowedOrigins = corsAllowAll
//   ? []
//   : corsRaw
//       .split(',')
//       .map((origin) => origin.trim())
//       .filter((origin) => origin.length > 0);
```

La variable de entorno `CORS_ALLOWED_ORIGINS` acepta:
- `*` para permitir todos los orígenes.
- Una lista separada por comas para orígenes específicos (ej. `https://app.montechelo.com.co,https://admin.montechelo.com.co`).
- Vacío (`''`) para no restringir ningún origen.

#### 3. Habilitación de CORS en NestJS (`app.enableCors`)

```typescript
// app.enableCors({
//   origin: (origin, callback) => {
//     if (!origin || corsAllowAll || corsAllowedOrigins.length === 0) {
//       return callback(null, true);
//     }
//     if (corsAllowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }
//     return callback(new Error(`Origin ${origin} not allowed by CORS`));
//   },
//   credentials: true,
// });
```

#### 4. Handler Express-level para errores CORS

Este handler capturaba los errores generados por el middleware `cors` antes de que llegaran al pipeline de NestJS. Sin él, un origen no autorizado habría producido un error 500 sin formato estándar.

```typescript
// const expressApp = app.getHttpAdapter().getInstance() as {
//   use: (...args: unknown[]) => void;
// };
// expressApp.use(
//   (err: Error, _req: Request, res: Response, next: NextFunction) => {
//     if (err?.message?.includes('not allowed by CORS')) {
//       res.status(403).json({
//         status: 403,
//         type: 'warning',
//         title: 'Acceso denegado',
//         message: 'Origen no autorizado para acceder a este recurso.',
//         data: null,
//       });
//       return;
//     }
//     next(err);
//   },
// );
```

### Archivo: `v1/.env` y `v1/.env.example`

Se comentó la variable de entorno que alimentaba la configuración CORS:

```env
# CORS: lista de origins separados por comas. Usar * para paso abierto (sin restricciones).
# CORS_ALLOWED_ORIGINS=*
```

---

## Cómo reactivar CORS

1. Abrir `v1/src/main.ts`.
2. Descomentar el import de tipos Express (línea ~5).
3. Descomentar los bloques delimitados por los comentarios:
   - `--- CORS deshabilitado temporalmente. Conservar para reactivación futura. ---`
   - `--- Fin bloque CORS ---`
4. Definir la variable de entorno `CORS_ALLOWED_ORIGINS` en el entorno correspondiente (`.env`, configuración de Docker, Jenkins, etc.).
5. Compilar y desplegar.

---

## Variable de entorno requerida al reactivar

| Variable | Descripción | Ejemplo |
|---|---|---|
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos, separados por coma. Usar `*` para permitir todos. | `https://app.montechelo.com.co` |
