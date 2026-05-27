# Actualizar estado judicial del cliente al completar radicado

**Fecha:** 2026-05-27
**Autor:** Ramon Dario Rozo Torres

---

## Contexto

Al completar el flujo de registro de una demanda en línea con radicado exitoso, la tabla `clients` de la base de datos externa (cartera) no reflejaba que el cliente había sido judicializado ni almacenaba el número de radicado. Esto generaba inconsistencia entre el estado de la demanda registrada y el estado del cliente en la cartera.

---

## Problema

El flujo final de ciclo de registro exitoso actualizaba las tablas `lawsuits` y `lawsuits_filings` de la base de datos externa, pero la tabla `clients` quedaba sin cambios. En consecuencia:

- El campo `judicial_status` del cliente no pasaba a `'judicializado'`.

---

## Solución

Se agregó una instrucción `UPDATE` sobre la tabla `clients` dentro del bloque que se ejecuta cuando `demandaRegistrada === true`, justo después del `UPDATE` existente sobre `lawsuits_filings`. El cruce se realiza usando `management_demands_online.client_id` contra `clients.id`.

### Cruce entre tablas

| Tabla origen | Campo origen | Tabla destino | Campo destino |
|---|---|---|---|
| `management_demands_online` | `client_id` | `clients` | `id` |

### Campos actualizados en `clients`

| Campo en `clients` | Fuente del valor | Descripción |
|---|---|---|
| `judicial_status` | `'judicializado'` (fijo) | Marca al cliente como judicializado |

---

## Cambios realizados

### Archivo: `v1/src/application/services/demandsOnlineAutomation.service.ts`

Se añadió el bloque SQL a continuación del `UPDATE` existente sobre `lawsuits_filings`, dentro del mismo condicional `if (updatedDemanda.name_data_base && updatedDemanda.lawsuit_id)`:

```typescript
// Antes: el bloque terminaba tras actualizar lawsuits_filings
await this.dataBasesRepository.runQueryOnBase(baseName, sqlFilings, [
  updatedDemanda.number_filed ?? '-',
  updatedDemanda.updated_at,
  1,
  detailFinal,
  updatedDemanda.lawsuit_id,
]);

// Después: se agregó la actualización de clients
if (updatedDemanda.client_id) {
  const sqlClients = `
    UPDATE \`${baseName}\`.clients
    SET judicial_status = ?
    WHERE id = ?
  `;
  await this.dataBasesRepository.runQueryOnBase(baseName, sqlClients, [
    'judicializado',
    updatedDemanda.client_id,
  ]);
}
```

---

## Flujo completo al completarse el registro

1. El bot confirma que `demandaRegistrada === true`.
2. Se determina el valor de `detailFinal` según la acción del modal **Confirmar Datos**.
3. Se actualiza `management_demands_online` con `management_status = 'Registrada'`, `lawsuit_status = 'Presentada por aplicativo'`, `number_filed` y `updated_at`.
4. Si existe `name_data_base` y `lawsuit_id`:
   - Se actualiza `lawsuits` (estado, documento, usuario).
   - Se actualiza `lawsuits_filings` (número de radicado, fecha de radicación, usuario responsable, comentario).
   - **[Nuevo]** Si existe `client_id`, se actualiza `clients` (estado judicial).

---

## Garantías del UPDATE

- **Guard de nulidad**: el bloque solo se ejecuta si `client_id` es truthy; si el registro no tuviese `client_id`, el UPDATE se omite sin interrumpir el flujo.
- **Valor fijo**: `judicial_status` siempre se escribe como `'judicializado'` al completarse el radicado exitoso.

---

## Entregable

Al completar el registro de una demanda en línea, la tabla `clients` de la cartera quedará actualizada con:

| Campo en `clients` | Valor asignado | Fuente |
|---|---|---|
| `judicial_status` | `'judicializado'` | Fijo al momento del radicado exitoso |
