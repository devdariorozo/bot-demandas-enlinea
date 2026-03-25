# bot-demandas-enlinea

**Autor:** Ramón Dario Rozo Torres
**Versión:** 1.0.0

Bot de radicación automática de demandas en línea ante la Rama Judicial de Colombia ([demandaenlinea](https://procesojudicial.ramajudicial.gov.co/demandaenlinea)). Simula el flujo humano completo: acepta términos, diligencia los 6 bloques del formulario, adjunta el PDF de la demanda, resuelve el reCAPTCHA vía Browserless y envía. Opera exclusivamente en horario laboral configurable, excluyendo fines de semana y festivos de Colombia.

---

## Stack

- **Runtime/Framework:** Node.js 22 LTS · TypeScript 5 · NestJS 10
- **Automatización:** Puppeteer 24 + Browserless (navegador en la nube + resolución de captchas)
- **Persistencia:** MySQL 8 · TypeORM 0.3 (sin `synchronize`)
- **API:** REST con prefijo `api/v1` · Swagger en `/docs`
- **Despliegue:** Docker + Docker Compose (tres servicios: dev / qa / pro)

---

## Arquitectura

Hexagonal (Ports & Adapters). El dominio depende solo de puertos (interfaces + Symbol tokens); la infraestructura implementa los adaptadores.

```
src/
├── domain/
│   ├── entities/        # Interfaces/tipos del dominio (no clases TypeORM)
│   ├── ports/           # Contratos: BrowserAutomationPort, ManagementDemandsOnlineRepository,
│   │                    #   DataBasesRepository, DemandPdfPort, BotControlPort, ...
│   └── value-objects/   # IDs con validación (StateTypeId, etc.)
├── application/
│   └── services/        # DemandsOnlineAutomationService (orquestador principal)
│                        # DemandsPendingSyncService · BotControlService · ...
├── infrastructure/
│   ├── browser/         # BrowserlessPuppeteerAdapter → implementa BrowserAutomationPort
│   └── persistence/
│       ├── entities/    # Entidades TypeORM
│       ├── repositories/# Implementaciones concretas de cada repositorio
│       ├── migrations/  # Numeradas 177197872900X_
│       └── seeds/       # Datos iniciales (run-seeds.ts)
└── interfaces/
    ├── http/            # Controllers · DTOs (class-validator)
    └── modules/         # Módulos NestJS (uno por entidad de dominio)
```

**Path aliases** (`tsconfig`): `@domain/` · `@application/` · `@infrastructure/` · `@interfaces/`

### Dos bases de datos

| BD | Descripción |
|----|-------------|
| **BD configuración** (`DB_CONFIG_*`) | Propia del bot; todas las entidades TypeORM (catálogos, horarios, demandas a gestionar, etc.) |
| **BDs de cartera** (externas, dinámicas) | Bases MySQL de terceros. El nombre viene en `data_bases.bases` (array JSON) y en `management_demands_online.name_data_base`. El bot opera sobre ellas con `DataBasesRepository.runQueryOnBase(baseName, sql, params)`. Tablas relevantes: `lawsuits`, `clients`, `phones`, `lawsuit_court_assignments`, `campaigns`. |

---

## Lógica de sincronización de demandas pendientes

`DemandsPendingSyncService` corre en intervalo configurable (`DEMANDS_PENDING_SYNC_INTERVAL_MINUTES`, por defecto 30 min) y también al arrancar. Solo opera si el bot está iniciado y dentro de horario laboral.

**Condiciones que debe cumplir una demanda para registrarse en `management_demands_online`:**

1. Existe en `lawsuits` con `lawsuit_status = 'Pendiente'` y `deleted_at IS NULL`.
2. Tiene al menos un registro en `lawsuit_court_assignments` cuyo `city_id` esté configurado en `portfolio_city_config` para la BD de cartera activa.
3. El campo `type_quantity` de `lawsuits` tiene correspondencia en la tabla `amount_type` de la BD de configuración (por campo `duplicate`).
4. No existe ya un registro en `management_demands_online` con el mismo `lawsuit_court_assignments_id` + `name_data_base` (evita duplicados).

**Cruce de tablas (BD de cartera):**

```sql
SELECT l.id AS lawsuit_id, l.client_id, l.path_law_doc, l.lawsuit_status,
       l.type_quantity, l.campaign_id,
       lca.id AS lawsuit_court_assignments_id, lca.client_id, lca.city_id
FROM `{name_data_base}`.lawsuits l
INNER JOIN `{name_data_base}`.lawsuit_court_assignments lca ON lca.lawsuit_id = l.id
WHERE l.lawsuit_status = 'Pendiente'
  AND l.deleted_at IS NULL
  AND lca.city_id IN ({ids de ciudades configuradas en portfolio_city_config})
```

Si todas las condiciones se cumplen, se crea el registro en `management_demands_online` con `management_status = 'Abierta'`.

---

## Gestión de demandas

### Automatización (flujo general)

`DemandsOnlineAutomationService` es el orquestador central. Se lanzan tantos workers paralelos como indique `BROWSERLESS_CONCURRENT_BROWSERS`. Cada worker ejecuta el siguiente ciclo:

1. **Tomar demanda:** `findNextPending()` + `markInProcess()` — operación atómica con bloqueo pesimista; pasa `management_status` a `'En proceso'`.
2. **Resolver datos** — cruces en la BD de cartera (ver apartado siguiente).
3. **Automatizar portal** — delega a `BrowserlessPuppeteerAdapter.procesarLugarEnvioYEspecialidadYClase()`.

   **Comportamiento del select de Localidad (`#DDlLocalidad`):**
   | Escenario | Resultado |
   |-----------|-----------|
   | El select **no existe** en el portal | La ciudad no requiere localidad — el flujo continúa normalmente |
   | El select **existe** y contiene `"00 - DESCONOCIDA / DUDOSA"` o `"Sin Localidad"` | Se selecciona la opción y el flujo continúa |
   | El select **existe** pero **no contiene ninguna** de las dos opciones requeridas | El caso finaliza con `management_status = 'Novedad'` y el detail indica que el select existe pero no tiene ninguna de las opciones requeridas |
4. **Finalizar:**
   - Éxito (`demandaRegistrada: true`): actualiza `management_demands_online` con `management_status = 'Registrada'` y `lawsuit_status = 'Presentada por aplicativo'`; luego sincroniza la BD de cartera (`UPDATE lawsuits SET path_law_doc, lawsuit_status, user_id, user_name WHERE id = lawsuit_id`).
   - Fallo parcial: `management_status = 'Novedad'` con el detalle del punto de falla.

**Control de disponibilidad y cuota de Browserless (`BrowserlessHealthService`):**

Antes de cada conexión WebSocket, el adaptador ejecuta un health-check HTTP contra el servicio Browserless:

| Verificación | Resultado |
|--------------|-----------|
| Servicio no responde / timeout | Error `SERVICE_DOWN` — el caso queda en `Novedad` |
| Token inválido (`401/403`) | Error `AUTH_ERROR` — revisar `BROWSERLESS_API_TOKEN` |
| Cuota agotada (`402/429`) | Error `QUOTA_EXCEEDED` — revisar saldo en el dashboard |
| Fallo al conectar WebSocket (Puppeteer) | Se clasifica el error (cuota, auth o servicio caído) y se loggea con tipo `BROWSERLESS_HEALTH` |
| Cuota ≥ 75 % | `warn` en logs con tipo `BROWSERLESS_QUOTA` |
| Cuota ≥ 90 % | `warn` crítico: riesgo inminente de quedar sin saldo |

Todos los eventos quedan registrados en el log diario con `type: BROWSERLESS_HEALTH` o `BROWSERLESS_QUOTA`.

`BotControlService` valida en cada ciclo:
- `attention_schedule`: horarios activos por cartera; verifica día de la semana y tramo horario (con receso incluido).
- `holiday`: si hoy es festivo no laborable para Colombia (`is_working_day = 0`), el bot no ejecuta.

### Cruces de datos en la BD de cartera

Durante la gestión, el bot consulta la BD de cartera indicada en `management_demands_online.name_data_base` para obtener:

| Dato | Tablas cruzadas | Campo clave |
|------|-----------------|-------------|
| **Demandado** (nombres, identificación, dirección) | `clients` + `lawsuit_court_assignments` | `client_id`, `lawsuit_court_assignments_id` |
| **Teléfono del demandado** | `phones` | `client_id` (primer registro por `id ASC`) |
| **Demandante** (empresa/NIT) | BD configuración `company_type` + BD cartera `campaigns` | `campaign_id` → `campaigns.format` → `company_type` |
| **Apoderado** | BD configuración `lawyer_data` | `portfolio_type_id` |
| **Cuantía / clase de proceso** | BD configuración `amount_type` | `lawsuits.type_quantity` → `amount_type.duplicate` |
| **Ciudad / departamento** | BD configuración `portfolio_city_config` | `portfolio_city_config_id` del registro |

### PDF de la demanda

#### 1. Generar
`POST {GENERATE_PDF_DEMAND_SERVICE}/generatedemandonlinepdf` con `client_id` + `campaign_id` tomados del registro en gestión.
Respuesta: campo `path_demanda_pdf` (ruta relativa en storage, ej. `cartera_propia_QA/demandas_1/demanda_5106997_abc.pdf`).
Se persiste en `management_demands_online.path_law_doc`.

#### 2. Descargar
`GET {DOWNLOAD_PDF_DEMAND_SERVICE}/local/download/{encodeURIComponent(path_law_doc)}`
Header: `X-API-Key: {DOWNLOAD_PDF_DEMAND_SERVICE_API_KEY}`.
Documentación del servicio: [S3 File Manager API – Swagger](https://s3backaws.mysoul.software/docs).

#### 3. Adjuntar en el portal
Se guarda en `tmp/{id}-{portfolio_type_id}-{client_id}/{basename(path_law_doc)}`, se carga en el `input[type=file]` del portal con tipo **DEMANDA** y se borra la carpeta temporal al finalizar.

Código: `src/infrastructure/http/demandPdfHttp.adapter.ts` · `src/domain/ports/demandPdf.ports.ts`

### Depuración HTML (ENVIAR / jConfirm)

Tras clic en **ENVIAR**, el adaptador guarda el HTML completo en `v1/logs/html-debug/` para inspeccionar selectores. La ruta queda en `management_demands_online.detail`. El portal usa jConfirm para dos escenarios distintos:
- **Confirmar Datos** (botones Sí/No) → resumen exitoso → `demandaRegistrada: true`.
- **Error de validación** (solo Continuar, spinner) → `failureStage: portal_enviar_validation_error`; el bot los distingue y no los confunde.

---

## Instalación

### 1. Base de datos

```sql
CREATE DATABASE bot_demandas_online CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
```

Tablas gestionadas por migraciones: `environment_type`, `state_type`, `portfolio_type`, `data_bases`, `attention_schedule`, `portfolio_city_config`, `amount_type`, `company_type`, `lawyer_data`, `holiday`, `management_demands_online`, `bot_control`.

### 2. Variables de entorno

```bash
cp .env.example .env
```

Variables mínimas:

```env
# App
PORT_API=5006

# BD configuración
DB_CONFIG_HOST=localhost
DB_CONFIG_PORT=3306
DB_CONFIG_USER=tu_usuario
DB_CONFIG_PASSWORD=tu_password
DB_CONFIG_DATABASE=bot_demandas_online

# Browserless
BROWSERLESS_ENDPOINT=wss://...
BROWSERLESS_API_TOKEN=...
BROWSERLESS_CONCURRENT_BROWSERS=1

# PDF
GENERATE_PDF_DEMAND_SERVICE=https://...
GENERATE_PDF_DEMAND_SERVICE_API_KEY=...
DOWNLOAD_PDF_DEMAND_SERVICE=https://s3backaws.mysoul.software/v1/api
DOWNLOAD_PDF_DEMAND_SERVICE_API_KEY=sk_...

# Loop del bot (segundos)
AUTOMATION_IDLE_SLEEP_SEC=15
AUTOMATION_BETWEEN_DEMANDS_SEC=2
AUTOMATION_STANDBY_SLEEP_SEC=60
```

Ver `.env.example` para el listado completo.

### 3. Migraciones, seeds y arranque

```bash
npm run migrations   # Crea todas las tablas
npm run seeds        # Carga datos iniciales
npm run dev          # Desarrollo con hot-reload (http://localhost:5006 · /docs)
```

---

## Docker

Tres servicios API (dev / qa / pro) + un Redis por ambiente, todos con `network_mode: host`.

| Servicio | Puerto API | Puerto Redis |
|----------|-----------|--------------|
| dev | 5006 | 6379 |
| qa  | 5007 | 6380 |
| pro | 5008 | 6381 |

```bash
# Construir
docker compose build --no-cache

# Levantar un ambiente (ej. dev)
docker compose up -d bot-demandas-enlinea-v1-redis-dev bot-demandas-enlinea-v1-dev

# Todos
docker compose up -d

# Bajar
docker compose down
```

El `docker-compose.yml` ejecuta `npm run ${ENV_API}` (→ `node dist/main`). Para QA/PRO: **VPN activa obligatoria** y `DB_CONFIG_HOST` apuntando al servidor correspondiente.

---

## Endpoints

Prefijo `api/v1`. Swagger: `http://localhost:{PORT_API}/docs`

| Recurso | Operaciones | Notas |
|---------|-------------|-------|
| `health` | GET | Estado del servicio |
| `environmentType` | CRUD | Catálogo: dev, docker, qa, pro |
| `stateType` | CRUD | Catálogo: Active, Inactive |
| `portfolioType` | CRUD | Catálogo: Propias, Sudameris |
| `dataBases` | CRUD + GET /byEnvAndPortf | BD por entorno/cartera; campo `bases` es array JSON |
| `attentionSchedule` | CRUD + GET /byPortfolio | `days` array JSON en español; UNIQUE por `(portfolio_type_id, start_time, end_time)` |
| `portfolioCityConfig` | CRUD + GET /byDataBasesAndCityViews + GET /vCitiesFetch | `vCitiesFetch` consulta la vista `v_cities` de la primera base del registro |
| `amountType` | CRUD | Cuantías con `class_process` (array JSON de especialidades/clases) |
| `managementDemandsOnline` | CRUD | Cola de demandas; `management_status`: Abierta → En proceso → Registrada / Novedad |
| `botControl` | start / stop / status | Control del loop de automatización |

---

## Bugs / Problemas conocidos

### Conflicto de red Docker ↔ servidor QA (172.17.x.x)

Si el servidor de QA está en `172.17.x.x` y Docker usa la misma subred, los contenedores no alcanzan la BD.

**Diagnóstico:**
```bash
ip route   # No debe aparecer 172.17.0.0/16 dev br-XXXX
telnet 172.17.8.141 3306
```

**Solución:** cambiar el bridge por defecto de Docker en `/etc/docker/daemon.json`:
```json
{ "bip": "172.30.0.1/16" }
```

Luego limpiar redes antiguas y reiniciar Docker:
```bash
docker compose down
docker network rm v1_default   # si aún existe
sudo service docker restart
```

---

## Repositorio

[Azure DevOps – bot-demandas-enlinea](https://dev.azure.com/MontecheloPipelines/SquadMiosV2/_git/bot-demandas-enlinea)

Rama base: `master`. Flujo: `feature/nombre_rama` → PR → merge a `master`.

---

## 📄 Licencia

**© 2026 MONTECHELO S.A.S - Todos los derechos reservados**
