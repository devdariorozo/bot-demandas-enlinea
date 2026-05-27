# Registrar fecha de radicación de demanda en línea

**Fecha:** 2026-05-27
**Autor:** Ramon Dario Rozo Torres

---

## Contexto

Al completar el flujo de registro de una demanda en línea, la fecha de radicación no se estaba persistiendo en la tabla `lawsuits_filings` de la base de datos externa (cartera). Esto impedía visualizar en la vista `/mios/cartera/demandas/demandas` los campos:

- **Fecha de radicación** (`filing_date`)
- **# Radicado** (`filing_number`)

---

## Problema

El flujo final de ciclo de registro actualizaba únicamente la tabla `lawsuits` con el estado de la demanda, el documento adjunto y el usuario. Sin embargo, la tabla `lawsuits_filings`, que es la que alimenta los campos de radicación visibles en Soul, no recibía ninguna actualización al completarse el registro exitoso.

---

## Solución

Se agregó una segunda instrucción `UPDATE` sobre la tabla `lawsuits_filings` dentro del bloque que se ejecuta cuando `demandaRegistrada === true` y la demanda tiene una base de datos externa asociada (`name_data_base` + `lawsuit_id`).

### Cruce entre tablas

| Tabla origen | Campo origen | Tabla destino | Campo destino |
|---|---|---|---|
| `lawsuits` | `id` | `lawsuits_filings` | `lawsuit_id` |

### Campos actualizados en `lawsuits_filings`

| Campo en `lawsuits_filings` | Fuente del valor | Descripción |
|---|---|---|
| `filing_number` | `management_demands_online.number_filed` | Número de radicado capturado durante el flujo |
| `filing_date` | `management_demands_online.updated_at` | Fecha del momento en que se completó el registro |
| `updater_user` | `1` (fijo) | Usuario responsable del sistema |
| `comments` | `detailFinal` | Detalle del resultado del flujo (ej. `Demanda en linea registrada con exito y sincronizada (modal Confirmar Datos: SI).`) |

---

## Cambios realizados

### Archivo: `v1/src/application/services/demandsOnlineAutomation.service.ts`

Se añadió el bloque SQL a continuación del `UPDATE` existente sobre `lawsuits`, dentro del condicional `if (updatedDemanda.name_data_base && updatedDemanda.lawsuit_id)`:

```typescript
// Antes: solo se actualizaba lawsuits
const sql = `
  UPDATE \`${baseName}\`.lawsuits
  SET
    path_law_doc = ?,
    lawsuit_status = ?,
    user_id = ?,
    user_name = ?
  WHERE id = ?
`;
await this.dataBasesRepository.runQueryOnBase(baseName, sql, [
  updatedDemanda.path_law_doc ?? '',
  updatedDemanda.lawsuit_status ?? 'Presentada por aplicativo',
  updatedDemanda.user_id ?? 1,
  updatedDemanda.user_name ?? 'BOT demands online',
  updatedDemanda.lawsuit_id,
]);

// Después: se agregó la actualización de lawsuits_filings
const sqlFilings = `
  UPDATE \`${baseName}\`.lawsuits_filings
  SET
    filing_number = ?,
    filing_date = ?,
    updater_user = ?,
    comments = ?
  WHERE lawsuit_id = ?
`;
await this.dataBasesRepository.runQueryOnBase(baseName, sqlFilings, [
  updatedDemanda.number_filed ?? '-',
  updatedDemanda.updated_at,
  1,
  detailFinal,
  updatedDemanda.lawsuit_id,
]);
```

---

## Flujo completo al completarse el registro

1. El bot confirma que `demandaRegistrada === true`.
2. Se determina el valor de `detailFinal` según la acción del modal **Confirmar Datos**:
   - `SI` simulado → `"Demanda en linea registrada con exito y sincronizada (modal Confirmar Datos: SI)."`
   - `NO` simulado → `"Demanda en linea registrada con exito y sincronizada (modal Confirmar Datos: NO simulado)."`
   - Sin acción modal → `"Demanda en linea registrada con exito y sincronizada con lawsuits externa."`
3. Se actualiza `management_demands_online` con `management_status = 'Registrada'`, `lawsuit_status = 'Presentada por aplicativo'`, `number_filed` y `updated_at`.
4. Si existe `name_data_base` y `lawsuit_id`:
   - Se actualiza `lawsuits` (estado, documento, usuario).
   - **[Nuevo]** Se actualiza `lawsuits_filings` (número de radicado, fecha de radicación, usuario responsable, comentario).

---

## Entregable

Al completar el registro de una demanda en línea, la vista `/mios/cartera/demandas/demandas` en Soul mostrará correctamente:

| Campo visible en Soul | Campo en BD | Fuente |
|---|---|---|
| Fecha de radicación | `lawsuits_filings.filing_date` | `management_demands_online.updated_at` al momento del registro |
| # Radicado | `lawsuits_filings.filing_number` | `management_demands_online.number_filed` capturado por el bot |
