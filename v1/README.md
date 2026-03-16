# bot-demandas-enlinea

**Autor:** Ramón Dario Rozo Torres 
**Versión:** 1.0.0

## 📋 Descripción General

Este proyecto es un bot desarrollado en **Node.js** que automatiza la radicación de demandas en línea en el portal oficial de la Rama Judicial de Colombia (`https://procesojudicial.ramajudicial.gov.co/demandaenlinea`). El bot simula el flujo que hoy realiza un usuario humano: acepta los términos y condiciones del modal inicial, diligencia los campos de los 6 bloques del formulario (selects, textos, sujetos procesales, adjuntos), interactúa con el **reCAPTCHA** (resolución vía Browserless) y finalmente envía la demanda, minimizando errores manuales y tiempos operativos.

La ejecución se realiza únicamente en **horarios y días laborales configurados**: inicialmente **lunes a viernes de 08:00 a 12:00 y de 13:00 a 17:00**, excluyendo **fines de semana y festivos en Colombia**. Un módulo de configuración de horarios y días laborales centraliza esta lógica y permitirá ajustes desde un frontend en versiones posteriores.

El sistema está pensado para ser **escalable por carteras**. En el **MVP** se trabaja con un primer tipo de cartera: **Carteras Propias**. Posteriormente se incorporarán otras carteras (por ejemplo **Carteras Sudameris**) con sus propias estrategias de radicación y fuentes de datos, sin modificar el núcleo del sistema gracias a la arquitectura hexagonal y al uso de estrategias por cartera.

### Estado actual (v1)

En esta versión está implementada la **API de configuración** sobre **NestJS**, **TypeORM** y **MySQL**, con arquitectura hexagonal:

- **Catálogos base:** tipo de entorno (`environment_type`), tipo de estado (`state_type`), tipo de cartera (`portfolio_type`).
- **Configuración operativa:** bases de datos por entorno/cartera (`data_bases`), horarios de atención por cartera (`attention_schedule`), configuración cartera–ciudad (`portfolio_city_config`).
- **API REST** con prefijo `api/v1`, documentada con **Swagger** en `/docs`.
- **Migraciones** TypeORM para crear las tablas y **seeds** para datos iniciales (dev/qa/pro, carteras Propias y Sudameris, ejemplos de `portfolio_city_config`).

Pendiente para fases posteriores: automatización con Puppeteer/Browserless, colas BullMQ, endpoints de radicación de demandas y orquestador completo.

## 🤝 Contribución

Puedes abrir el repositorio aquí: [https://dev.azure.com/MontecheloPipelines/SquadMiosV2/_git/bot-demandas-enlinea](https://dev.azure.com/MontecheloPipelines/SquadMiosV2/_git/bot-demandas-enlinea)

### Flujo de Trabajo

1. Crear rama desde `master`:

   ```bash
   git checkout -b feature/nombre_tu_rama
   ```

2. Realizar cambios y commits descriptivos:

   ```bash
   git commit -m "feat: descripción clara del cambio"
   ```

3. Hacer push a tu rama:

   ```bash
   git push origin feature/nombre_tu_rama
   ```

4. Crear Pull Request hacia la rama de integración (`quality` o la definida por el equipo).  
5. Una vez aprobado, merge a `master` y coordinar despliegue.

### Estándares de Código

- Seguir la estructura de carpetas actual.
- Usar nomenclatura clara y consistente.
- Documentar funciones complejas.
- Probar localmente con Docker antes de subir cambios.
- Mantener actualizada la documentación de endpoints si se agregan o modifican.


## 🏗️ Arquitectura del Sistema

El sistema se basa en **arquitectura Hexagonal (Ports & Adapters)**, alineada con los principios de **Clean Architecture**. El dominio y los casos de uso permanecen independientes de la tecnología de scraping (Puppeteer/Browserless), las bases de datos y los proveedores externos, lo que permite evolucionar el sistema y cambiar adaptadores sin impactar las reglas de negocio.

**Stack central:** **NestJS** (API y orquestación), **Puppeteer** (automatización), **Swagger** (documentación de la API) y **Browserless** (navegador en la nube, proxies y resolución de captchas).

```text
                   +-------------------------------+
                   |      Interfaces de Entrada   |
                   |-------------------------------|
                   |  - API REST (NestJS + Swagger)|
                   |  - Jobs / Schedulers (cron)   |
                   |  - CLI / Scripts de soporte   |
                   +-----------------------+-------+
                                           |
                                   (Casos de uso)
                                           |
                   +-----------------------v-------+
                   |       Capa de Aplicación      |
                   |-------------------------------|
                   |  - OrquestadorDemandaService  |
                   |  - Servicios por Cartera      |
                   |  - Configuración horarios    |
                   +-----------------------+-------+
                                           |
                               (Puertos de Dominio)
                                           |
                   +-----------------------v-------+
                   |         Capa de Dominio       |
                   |-------------------------------|
                   | Entidades y VOs:              |
                   |  - Demanda, Cartera, Campaña  |
                   |  - SujetoProcesal, Archivo    |
                   | Puertos (interfaces):         |
                   |  - BrowserAutomationPort      |
                   |  - CaptchaSolverPort          |
                   |  - CarteraRepositoryPort      |
                   |  - DemandaJobRepositoryPort   |
                   |  - HorarioLaboralPort         |
                   +-----------------------+-------+
                                           |
                               (Adaptadores externos)
                                           |
   +------------------------+--------------v---------------------------+
   |                    Capa de Infraestructura                         |
   |-------------------------------------------------------------------|
   | - BrowserlessPuppeteerAdapter (Puppeteer + Browserless Cloud)      |
   | - Repositorios MySQL (BD configuración + BD por cartera)          |
   | - Redis + BullMQ (cola de trabajos del bot)                       |
   | - Adaptador horarios / calendario (días laborales, festivos CO)   |
   | - Logging, métricas, notificaciones                               |
   +-------------------------------------------------------------------+
```

## 📦 Stack Tecnológico

**Núcleo del proyecto:** **NestJS** · **Puppeteer** · **Swagger** · **Browserless**

### Backend

| Tecnología              | Versión / Librería         | Descripción                                                                     |
| ----------------------- | -------------------------- | ------------------------------------------------------------------------------- |
| **Node.js**             | 22.13.1+ (LTS recomendada) | Runtime principal (TypeScript).                                                 |
| **TypeScript**          | 5.x                        | Tipado estático y mejor mantenibilidad.                                         |
| **NestJS**              | Última LTS                 | Framework para API REST, módulos, inyección de dependencias y organización por capas. |
| **Puppeteer**           | Última estable             | Automatización de navegador; conexión vía `puppeteer.connect` a Browserless.   |
| **Browserless Cloud**   | Servicio externo           | Navegadores en la nube, proxies y resolución de captchas (`solveCaptchas`).    |
| **Swagger / OpenAPI**   | Última                     | Documentación interactiva de la API REST (integrado con NestJS).               |
| **puppeteer-extra** + **stealth-plugin** | Última | Refuerzo anti-detección en el cliente de automatización.                      |
| **BullMQ**              | Última estable             | Colas de trabajos sobre Redis (opcional según volumen).                        |
| **dotenv** / config     | Última estable             | Variables de entorno y configuración por ambiente.                             |
| **Jest** / **Vitest**   | Última                     | Pruebas unitarias e integración.                                                |

### Base de Datos

| Tecnología        | Versión       | Descripción                                                  |
| ----------------- | ------------- | ------------------------------------------------------------ |
| **MySQL**         | 5.7 / 8.0     | Motor principal relacional                                   |
| **BD Configuración** |           | Catálogo de carteras, campañas, estrategias y mapeos        |
| **BD por Cartera** |             | Cada cartera puede tener su propia BD (multi-tenant físico) |
| **Redis**         | 6+            | Cola de trabajos (BullMQ) y caché liviano                   |

### DevOps / Infra

| Tecnología                     | Versión | Descripción                                           |
| ------------------------------ | ------- | ----------------------------------------------------- |
| **Docker**                     | 20.10+  | Contenedorización de servicios.                       |
| **Docker Compose**             | 1.29+   | Orquestación local (API, Redis, MySQL).              |
| **Swagger UI / OpenAPI**      | Latest  | Documentación interactiva de la API REST.            |
| **Azure DevOps / GitHub Actions** | N/A  | Pipelines CI/CD (build, tests, despliegue).          |
| **Browserless Cloud**         | N/A     | Servicio gestionado de navegador + proxies + captcha. |

## 📁 Estructura del Proyecto

```text
v1/
├── src/
│   ├── domain/                        # Núcleo de negocio (entidades, VOs, puertos)
│   │   ├── entities/                  # environmentType, stateType, portfolioType, dataBases, attentionSchedule, portfolioCityConfig
│   │   ├── value-objects/            # IDs y validaciones (EnvironmentTypeId, StateTypeId, DataBasesId, CityViewsId, etc.)
│   │   └── ports/                    # Contratos de repositorios (por entidad)
│   ├── application/                   # Casos de uso y servicios de aplicación
│   │   ├── services/                 # EnvironmentTypeService, DataBasesService, AttentionScheduleService, PortfolioCityConfigService, etc.
│   │   ├── use-cases/                # Archivos de casos de uso (por dominio)
│   │   └── utils/                    # Utilidades (ej. string.utils)
│   ├── infrastructure/                # Adaptadores concretos
│   │   └── persistence/              # TypeORM
│   │       ├── entities/             # Entidades TypeORM (mapeo tabla)
│   │       ├── migrations/           # Migraciones (environment_type, state_type, portfolio_type, data_bases, attention_schedule, portfolio_city_config)
│   │       ├── repositories/         # Implementación de los puertos (por entidad)
│   │       ├── seeds/                # Datos iniciales (run-seeds.ts + seeds por tabla)
│   │       └── data_source.ts        # DataSource para CLI de migraciones/seeds
│   └── interfaces/                    # API REST
│       ├── http/
│       │   ├── controller/           # Controladores NestJS por recurso
│       │   └── dto/                  # DTOs con class-validator y Swagger
│       └── modules/                  # Módulos NestJS (HealthModule, EnvironmentTypeModule, StateTypeModule, etc.)
├── package.json
├── tsconfig.json
└── README.md
```

## 🧩 Componentes Principales

- **CRUD de catálogos:** tipos de entorno (dev/docker/qa/pro), estados (Active/Inactive) y carteras (Propias, Sudameris).
- **CRUD dataBases:** configuración de bases de datos por entorno y cartera; listado de bases y consulta por entorno/cartera.
- **CRUD attentionSchedule:** horarios de atención por cartera. Un registro por horario: `days` es un **array JSON** de días en español (Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo), más `start_time`, `end_time`, `detail`, `state_type_id` y `responsible`. Restricción única `(portfolio_type_id, start_time, end_time)`. Validación de duplicados (409 si ya existe ese tramo horario para la cartera). GET `/byPortfolio?portfolio_type_id=&days=` devuelve 404 si el `portfolio_type_id` no existe; opcionalmente filtra por un día. PUT sin cambios responde 400 con "No changes to update". Mensajes de error en inglés.
- **CRUD portfolioCityConfig:** configuración cartera–ciudad; por id o por `id_data_bases` + `id_city_views` (404 si no existe); `vCitiesFetch` para consultar la vista `v_cities` de la primera base del registro.
- **API REST (NestJS + Swagger):** prefijo `api/v1`, validación con `class-validator`, documentación en `/docs`.

*Pendientes para fases posteriores:* orquestador de demandas, Puppeteer/Browserless, BullMQ/Redis, endpoints de radicación.

- **Orquestador de Demandas**: coordina el flujo completo de radicación por cartera y campaña, respetando horarios laborales configurados.
- **Módulo de Cartera / Estrategias**: encapsula la lógica por tipo de cartera (MVP: **Carteras Propias**; futuro: **Carteras Sudameris**, etc.), permitiendo distintas reglas de mapeo y validación por cartera y campaña. Diseñado para escalar a múltiples carteras sin cambiar el núcleo del sistema.
- **Módulo de configuración de horarios y días laborales**: define las ventanas horarias en las que el bot puede ejecutarse (p. ej. 08:00–12:00 y 13:00–17:00), los días laborables (lunes a viernes por defecto) y excluye **fines de semana y festivos en Colombia**. Permite consultar si “ahora” es momento de ejecutar (puerto `HorarioLaboralPort`) y será configurable desde frontend en versiones posteriores.
- **Adaptador Puppeteer/Browserless**: automatiza el portal `demandaenlinea` conectando Puppeteer a Browserless (modal de términos, formulario, adjuntos, captcha y envío).
- **Módulo reCAPTCHA**: delegado a Browserless (`solveCaptchas`); se mantiene el puerto `CaptchaSolverPort` por si se requiere una estrategia alternativa en el futuro.
- **Módulo de Integración BD**: lee datos de las bases de datos de cartera y de la BD de configuración (ciudades, carteras, campañas).
- **Cola de Trabajos (BullMQ + Redis)**: encola, reintenta y monitorea los procesos de radicación.
- **API REST (NestJS + Swagger)**: expone endpoints para disparar procesos, consultar estados y administrar configuraciones; documentación interactiva vía Swagger.

## 🧱 Patrones de Diseño

- **Hexagonal (Ports & Adapters)**: el dominio solo depende de puertos (`BrowserAutomationPort`, `DemandaRepositoryPort`, `HorarioLaboralPort`, etc.); la infraestructura los implementa mediante adaptadores, permitiendo cambiar Browserless, BD o calendario sin tocar reglas de negocio.
- **Repository**: acceso a demandas, carteras y configuración mediante interfaces; implementaciones concretas sobre MySQL (una BD de configuración y una BD por cartera cuando aplique).
- **Strategy**: distintas estrategias de radicación por cartera/campaña (mapeo de especialidad y clase de proceso, validaciones específicas), facilitando agregar Carteras Sudameris u otras sin modificar el orquestador.
- **Adapter / Facade**: `BrowserlessPuppeteerAdapter` encapsula la conexión a Browserless (endpoint, `solveCaptchas`, timeouts y manejo de errores).
- **Template Method / Command**: flujo de radicación en pasos reutilizables (abrir portal → información inicial → sujetos procesales → adjuntos → captcha → envío).
- **Value Objects**: NIT, correo, horario de ejecución, código de ciudad, etc., para garantizar consistencia y validación en el dominio.

## 🚀 Funcionalidades

### Funcionalidades Core

- **Automatizar radicación de demandas** en el portal `demandaenlinea`, simulando el flujo humano completo (NestJS + Puppeteer + Browserless).
- **Ejecución solo en horario laboral**: el bot opera dentro de las ventanas horarias y días laborables configurados, excluyendo fines de semana y festivos en Colombia.
- **Soportar múltiples carteras y campañas**: MVP con **Carteras Propias**; extensible a **Carteras Sudameris** y otras, cada una con su estrategia y fuente de datos.
- **Manejo de adjuntos** (mínimo 1 archivo, máximo 75 MB según restricciones del portal).
- **PDF de la demanda en adjuntos:** generación del PDF vía servicio de campaña/cliente, descarga desde el **S3 File Manager API** y carga automática en el portal (tipo de archivo **DEMANDA**). Ver sección [Flujo: PDF de la demanda y adjunto en el portal](#-flujo-pdf-de-la-demanda-y-adjunto-en-el-portal).
- **Gestión de reintentos** ante fallos temporales (timeout, reCAPTCHA, errores del portal).
- **Registro y trazabilidad** de cada intento de radicación (logs estructurados, auditoría).
- **Ejecución programada** (jobs) y ejecución manual vía API; documentación de la API con **Swagger**.

### Lógica de días hábiles y horarios

- **Horarios de atención por cartera (`attention_schedule`)**  
  - Cada registro define:
    - `portfolio_type_id`
    - `days` (array JSON de días en español: `["Lunes", "Martes", ...]`)
    - `start_time`, `start_recess`, `end_recess`, `end_time` (HH:mm 24h)
    - `state_type_id` y `responsible`
  - El servicio `BotControlService.checkRuntimeConditions`:
    - Consulta los horarios activos (`state_type_name = 'Active'`) para la cartera asociada a la configuración `data_bases` seleccionada.
    - Verifica que el **día actual** (`Lunes`, `Martes`, etc.) esté incluido en `days`.
    - Verifica que la **hora actual** esté dentro de alguno de los tramos válidos:
      - Entre `start_time` y `start_recess`, o
      - Entre `end_recess` y `end_time`.

- **Días festivos por país (`holiday`)**  
  - La tabla `holiday` almacena días festivos por país (en este proyecto, **Colombia**: `country_code = 'CO'`), con los campos:
    - `date`, `name`, `country_code`, `type`, `is_working_day`, `detail`, `state_type_id`.
  - En cada evaluación de condiciones de ejecución (`checkRuntimeConditions`), el bot:
    - Calcula la fecha actual (sin hora) y consulta `holiday` mediante `findByDateAndCountry(date, 'CO')`.
    - Si encuentra un registro y `is_working_day = 0`, **no permite ejecutar el bot** y devuelve una razón del tipo:
      - `"Hoy (2026-03-23) es festivo no laborable para el bot: DÍA DE SAN JOSÉ"`.
  - Esto permite modelar excepciones donde, aun siendo día hábil en `attention_schedule`, el bot **no debe trabajar** por ser festivo según la tabla `holiday`.

## 📎 Flujo: PDF de la demanda y adjunto en el portal

Cuando el bot llega a **Archivos adjuntos** del portal [demandaenlinea](https://procesojudicial.ramajudicial.gov.co/demandaenlinea), selecciona el tipo **DEMANDA** y debe dejar el PDF correcto en el registro que se está gestionando (`management_demands_online`). El flujo técnico es el siguiente.

### 1. Generar PDF y ruta en storage (`path_law_doc`)

- El bot llama al servicio configurado en **`GENERATE_PDF_DEMAND_SERVICE`** (backend de generación de PDF por campaña/cliente).
- **Método y ruta:** `POST {GENERATE_PDF_DEMAND_SERVICE}/generatedemandonlinepdf`
- **Cuerpo (JSON):** `client_id` y `campaign_id` tomados del registro **`management_demands_online`** en curso.
- **Respuesta:** se espera un campo **`path_demanda_pdf`** (ruta relativa del archivo en el storage, p. ej. `cartera_propia_QA/demandas_/demanda_3141238_b2fdec85.pdf`).
- Ese valor se persiste en la columna **`path_law_doc`** del mismo registro para trazabilidad y para la descarga posterior.

### 2. Descargar el PDF (backend S3 / storage local)

La descarga la realiza este bot contra el API documentado en Swagger:

- **Documentación interactiva:** [S3 File Manager API – Swagger UI](https://s3backaws.mysoul.software/docs)

**Endpoint usado por el bot (descarga del archivo):**

| Elemento | Valor |
|----------|--------|
| **Método** | `GET` |
| **Ruta (OpenAPI)** | `/v1/api/local/download/{file_path}` |
| **URL de ejemplo** | `https://s3backaws.mysoul.software/v1/api/local/download/{file_path}` |
| **Parámetro de ruta `file_path`** | Ruta relativa del PDF en el storage — es el valor de **`path_law_doc`** devuelto en el paso 1. En la URL debe ir **codificada** (los `/` se envían como `%2F`), igual que en la doc. Ejemplo: `cartera_propia_QA/demandas_/demanda_3141238_b2fdec85.pdf` → segmento URL `cartera_propia_QA%2Fdemandas_%2Fdemanda_3141238_b2fdec85.pdf`. |
| **Autenticación** | Cabecera **`X-API-Key`**, con el valor de **`DOWNLOAD_PDF_DEMAND_SERVICE_API_KEY`** (autorización tipo *APIKeyHeader* en Swagger). |
| **Respuesta exitosa** | Cuerpo binario PDF (`Content-Type: application/pdf`); el nombre sugerido suele venir en `Content-Disposition` (p. ej. `demanda_3141238_b2fdec85.pdf`). |

**Variable de entorno para la base del API de descarga:**

- **`DOWNLOAD_PDF_DEMAND_SERVICE`**: base **sin** `/local/download`, por ejemplo:  
  `https://s3backaws.mysoul.software/v1/api`  
  El bot construye:  
  `{DOWNLOAD_PDF_DEMAND_SERVICE}/local/download/{encodeURIComponent(path_law_doc)}`

### 3. Temporal en disco y subida al portal

Para no mezclar PDFs entre varias demandas gestionadas a la vez:

- **Carpeta temporal (por registro):**  
  `{tmpdir}/{management_demands_online.id}-{portfolio_type_id}-{client_id}`  
  Ejemplos: `1-1-149`, `154-1-205`.
- **Nombre del archivo dentro de la carpeta:** igual al archivo en S3 → **`basename(path_law_doc)`** (mismo nombre que al bajar del servicio).
- Si la carpeta ya existe, se **eliminan los archivos previos** y se guarda solo el PDF recién descargado (sobrescritura explícita del flujo actual).
- Tras **adjuntar** el archivo en el portal (`input[type=file]` + tipo DEMANDA), se **borra toda la carpeta** temporal; el flujo queda limpio para la siguiente gestión.

### 4. Variables de entorno resumidas

```env
# Generación del PDF (client_id + campaign_id del registro en gestión)
GENERATE_PDF_DEMAND_SERVICE=https://tu-api-generacion.com

# Descarga del PDF (base del S3 File Manager API; ver /docs)
DOWNLOAD_PDF_DEMAND_SERVICE=https://s3backaws.mysoul.software/v1/api
DOWNLOAD_PDF_DEMAND_SERVICE_API_KEY=sk_...   # X-API-Key
```

### 5. Código relacionado

- Adaptador HTTP: `src/infrastructure/http/demandPdfHttp.adapter.ts`
- Puerto: `src/domain/ports/demandPdf.ports.ts`
- Orquestación en el portal (select DEMANDA, descarga, adjunto): `src/infrastructure/browser/browserlessPuppeteer.adapter.ts`

## 🔍 Endpoints Principales

Todos bajo el prefijo **`api/v1`**. Documentación interactiva: **`http://localhost:5006/docs`** (o el `PORT_API` configurado).

| Recurso | Método | Descripción |
|--------|--------|-------------|
| **health** | GET | Verificación de que el servicio está vivo. |
| **environmentType** | GET, GET /:id, POST, PUT /:id, DELETE /:id | CRUD tipo de entorno (dev, docker, qa, pro). |
| **stateType** | GET, GET /:id, POST, PUT /:id, DELETE /:id | CRUD tipo de estado (Active, Inactive). |
| **portfolioType** | GET, GET /:id, POST, PUT /:id, DELETE /:id | CRUD tipo de cartera (Propias, Sudameris). |
| **dataBases** | GET, GET /:id, GET /byEnvAndPortf, POST, PUT /:id, DELETE /:id | CRUD bases de datos por entorno/cartera. |
| **attentionSchedule** | GET, GET /:id, GET /byPortfolio, POST, PUT /:id, DELETE /:id | CRUD horarios de atención por cartera. POST: body con `days` (array de días en español), `portfolio_type_id`, `start_time`, `end_time`, `detail`, `state_type_id`, `responsible`; un solo registro por request. GET /byPortfolio: query `portfolio_type_id` (obligatorio), `days` (opcional); 404 si el portfolio_type_id no existe. PUT: 400 "No changes to update" si no hay cambios. |
| **portfolioCityConfig** | GET, GET /:id, GET /byDataBasesAndCityViews, GET /vCitiesFetch, POST, PUT /:id, DELETE /:id | CRUD configuración cartera–ciudad; por ids devuelve 404 si no existe; `vCitiesFetch` consulta la vista `v_cities` de la primera base del registro. |


## 🔒 Seguridad

- **Acceso controlado a la API**: autenticación mediante API Key o JWT para los endpoints sensibles.
- **Manejo de secretos**: credenciales de BD, claves de servicios de reCAPTCHA y otros secretos solo en `.env` (no versionado).
- **VPN / Segmentación de red**: acceso a las BDs de cartera y QA exclusivamente a través de VPN corporativa.
- **Logs y auditoría**: registro de quién dispara procesos y seguimiento de cada radicación.
- **Mínimos privilegios**: usuarios de BD y del sistema con permisos limitados al mínimo necesario.

---

## 📦 Instalación

### Base de datos

La API usa una **BD de configuración única**. El nombre se define en `.env`:

```env
DB_CONFIG_DATABASE=dbd_demands_online
```

En esa BD se crean, vía **migraciones TypeORM**, las tablas:

- `environment_type` — tipos de entorno (dev, docker, qa, pro)
- `state_type` — tipos de estado (Active, Inactive)
- `portfolio_type` — tipos de cartera (Propias, Sudameris)
- `data_bases` — bases de datos por entorno y cartera
- `attention_schedule` — horarios de atención por cartera (un registro por tramo horario; columna `days` en JSON, p. ej. `["Lunes","Martes","Miércoles","Jueves","Viernes"]`; UNIQUE `portfolio_type_id`, `start_time`, `end_time`)
- `portfolio_city_config` — configuración cartera–ciudad (id_data_bases, id_city_views, name_departament, name_city, city, detail, etc.)

Los **seeds** cargan datos iniciales: entornos, estados, carteras, registros de `data_bases` (dev/docker/qa/pro para Propias y Sudameris), horarios de atención y ejemplos de `portfolio_city_config`.

Si empiezas desde cero, sigue estos pasos:

1. **Crear la base de datos** – Ejecuta el siguiente SQL (elimina la BD si existe y la crea con charset y collation):

   ```sql
   DROP DATABASE IF EXISTS dbd_demands_online;

   CREATE DATABASE dbd_demands_online
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_0900_ai_ci;
   ```

   O desde terminal usando las variables de tu `.env`:

   ```bash
   mysql -h $DB_CONFIG_HOST -P $DB_CONFIG_PORT -u $DB_CONFIG_USER -p -e "
     DROP DATABASE IF EXISTS bot_demandas_online;
     CREATE DATABASE bot_demandas_online CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
   "
   ```

2. **Configurar `.env`** – Copia `.env.example` a `.env` y define:

   ```env
   DB_CONFIG_HOST=localhost
   DB_CONFIG_PORT=3306
   DB_CONFIG_USER=tu_usuario
   DB_CONFIG_PASSWORD=tu_password
   DB_CONFIG_DATABASE=bot_demandas_online
   ```

3. **Ejecutar migraciones** – Crea todas las tablas de configuración:

   ```bash
   cd v1
   npm run migrations
   ```

4. **Cargar seeds** – TRUNCATE de las tablas de configuración e inserción de datos iniciales:

   ```bash
   npm run seeds
   ```

5. **Revertir la última migración** (si aplica):

   ```bash
   npm run migrations:revert
   ```

6. **Arrancar la API**:

   ```bash
   npm run dev
   ```

   API: `http://localhost:5006` (o `PORT_API`). Swagger: `http://localhost:5006/docs`.

---

## 🚀 Levantamiento y uso (con Docker)

Esta versión usa **Docker + Docker Compose** con **un servicio por ambiente** (dev, qa, pro) y un Redis por ambiente, todos con `network_mode: host`.  
Así, dentro de los contenedores, `localhost` sigue apuntando a tu máquina (WSL/Ubuntu) y puedes usar tu MySQL local o el servidor de QA/PRO según definas en el `.env`.

### Requisitos previos

- **Docker** y **Docker Compose** instalados.
- Archivo **`.env`** configurado (copiar desde `.env.example`).
- Para ambiente **QA/PRO**: **VPN activa** antes de levantar el stack y credenciales de BD correctas (`DB_CONFIG_*` apuntando al servidor correspondiente).
- Asegúrate de que MySQL acepte conexiones desde el host donde corren los contenedores.

### Servicios por ambiente

En `v1/docker-compose.yml` se definen los siguientes servicios:

- **APIs**
  - `bot-demandas-enlinea-v1-dev`  → API ambiente **dev**  (puerto HTTP `5006`)
  - `bot-demandas-enlinea-v1-qa`   → API ambiente **qa**   (puerto HTTP `5007`)
  - `bot-demandas-enlinea-v1-pro`  → API ambiente **pro**  (puerto HTTP `5008`)

- **Redis**
  - `bot-demandas-enlinea-v1-redis-dev` → Redis para **dev** (puerto `6379`)
  - `bot-demandas-enlinea-v1-redis-qa`  → Redis para **qa**  (puerto `6380`)
  - `bot-demandas-enlinea-v1-redis-pro` → Redis para **pro** (puerto `6381`)

Cada servicio API comparte el mismo código e imagen Docker, pero se diferencia por:

- `NODE_ENV` (`dev`, `qa`, `pro`)
- `PORT_API` (5006, 5007, 5008)
- `REDIS_PORT` (6379, 6380, 6381)

> **Importante:** con `network_mode: host` no se usan directivas `ports:`; los puertos anteriores son los que escucha directamente tu host.

### 1. Posicionarse en el proyecto

```bash
cd bot-demandas-enlinea/v1
```

### 2. Configurar variables de entorno

1. Copiar el archivo de ejemplo:

   ```bash
   cp .env.example .env
   ```

2. Ajustar al menos:

   ```env
   # MySQL configuración
   DB_CONFIG_HOST=localhost          # o IP/host de QA/PRO
   DB_CONFIG_PORT=3306
   DB_CONFIG_USER=tu_usuario
   DB_CONFIG_PASSWORD=tu_password
   DB_CONFIG_DATABASE=bot_demandas_online

   # Redis (host siempre localhost con network_mode: host)
   REDIS_HOST=localhost
   # REDIS_PORT lo sobreescribe docker-compose (6379 / 6380 / 6381)
   ```

   - Para **dev** suele apuntar a tu MySQL local.
   - Para **qa/pro** apunta al servidor de QA/PRO (requiere VPN).

### 3. Construir imágenes

Construir (o reconstruir) las imágenes sin caché:

```bash
docker compose build --no-cache
```

Esto construirá la imagen `bot-demandas-enlinea-v1:latest` usada por los tres servicios API.

### 4. Levantar por ambiente

#### Solo ambiente dev

```bash
docker compose up -d bot-demandas-enlinea-v1-redis-dev bot-demandas-enlinea-v1-dev
```

- API dev: `http://localhost:5006`
- Swagger dev: `http://localhost:5006/docs`
- Redis dev: `localhost:6379`

#### Solo ambiente qa

```bash
docker compose up -d bot-demandas-enlinea-v1-redis-qa bot-demandas-enlinea-v1-qa
```

- API qa: `http://localhost:5007`
- Swagger qa: `http://localhost:5007/docs`
- Redis qa: `localhost:6380`

> Asegúrate de que el `.env` tenga `DB_CONFIG_*` apuntando al servidor de QA y de tener la **VPN activa**.

#### Solo ambiente pro

```bash
docker compose up -d bot-demandas-enlinea-v1-redis-pro bot-demandas-enlinea-v1-pro
```

- API pro: `http://localhost:5008`
- Swagger pro: `http://localhost:5008/docs`
- Redis pro: `localhost:6381`

#### Levantar todos los ambientes a la vez

Si necesitas tener dev, qa y pro levantados en paralelo:

```bash
docker compose up -d
```

Esto levantará las 3 APIs y los 3 Redis, cada uno en su puerto.

### 5. Uso de Swagger

Para cualquier ambiente:

- Abrir la URL de Swagger correspondiente:
  - Dev: [http://localhost:5006/docs](http://localhost:5006/docs)
  - Qa:  [http://localhost:5007/docs](http://localhost:5007/docs)
  - Pro: [http://localhost:5008/docs](http://localhost:5008/docs)
- En Swagger, usar **"Try it out"** → completar parámetros → **"Execute"** para invocar los endpoints.

**Notas importantes:**
- Cuando se levanta el sistema el bot no se inicia automáticamente; se debe iniciar manualmente mediante el endpoint que se defina para ello (por ejemplo `/start` o `/execute`) desde Swagger UI.

### Resumen práctico: local vs Docker

- **Para desarrollar** (recomendado):
  - Ejecutar localmente con:
    - `npm run migrations`
    - `npm run seeds`
    - `npm run dev`
  - Deja en `.env` algo como:
    - `ENV_API=dev`
    - `DB_CONFIG_HOST=localhost`
    - `DB_CONFIG_DATABASE=dbd_demands_online`

- **Para probar con Docker Compose**:
  - Desde `v1/`:
    - `docker compose build --no-cache`
    - `docker compose up` (o `docker compose up -d`)
    - `docker compose down`
  - Asegúrate de tener en `.env`:
    - `ENV_API=docker`  → el `docker-compose.yml` ejecuta internamente `npm run docker`
    - `DB_CONFIG_HOST=localhost` (con `network_mode: host`, apunta a tu MySQL local)

De esta manera, en desarrollo aprovechas el *watch* de Nest (`npm run dev`), y cuando necesites validar “como en servidor” sólo usas los tres comandos Docker indicados arriba.

### Mapeo de `ENV_API` por entorno

En el `.env` se usa la variable `ENV_API` para indicar **cómo** debe arrancar la API:

- `ENV_API=dev`  
  - Uso típico: desarrollo local con `npm run dev`.  
  - Comando manual: `npm run dev` (NestJS con *watch*).  
  - Requiere que `DB_CONFIG_HOST` apunte a tu MySQL local o a QA/PRO si tienes VPN.

- `ENV_API=docker`  
  - Uso típico: cuando levantas con `docker compose`.  
  - El `docker-compose.yml` hace `command: npm run ${ENV_API}` → `npm run docker` → `node dist/main`.  
  - Ideal para pruebas de imagen en tu máquina (misma configuración que en servidor).

- `ENV_API=qa`  
  - Uso típico: ejecutar la API apuntando al entorno de **QA** (por ejemplo, desde un servidor de QA).  
  - Comando equivalente: `npm run qa` → `node dist/main`.  
  - **Requisito obligatorio:** tener la **VPN activa** (o estar dentro de la red corporativa) y configurar:
    - `DB_CONFIG_HOST=172.17.8.141` (o el host de QA que te den)
    - resto de credenciales `DB_CONFIG_*` de QA.

- `ENV_API=pro`  
  - Uso típico: entorno de **producción**.  
  - Comando equivalente: `npm run pro` → `node dist/main`.  
  - Debe usar las credenciales y host de BD de producción, con la conectividad asegurada por la red corporativa.

> **Importante en QA:** sin VPN activa (o sin ruta válida a `172.17.8.141:3306`) la API no podrá conectarse a la BD de QA, ni en local ni dentro de Docker. Siempre valida primero con `telnet 172.17.8.141 3306`.


## 📞 Soporte

- **Creador:** Ramón Dario Rozo Torres 

## 🐞 Bugs o problemas conocidos

### Alcance al servidor de QA (172.17.8.141)
- Verificar que la VPN esté activa.
- Hacer un telnet a la ip 172.17.8.141 y puerto 3306 para verificar que se pueda conectar a la BD.
- Activar el telnet si no está activo en tu sistema operativo.
- Problemas de red entre docker y el servidor de QA por causas de networking 172.17.x.x, por lo que se debe:
  - Validar el comando `ip route` en tu sistema operativo (WSL) para verificar que la red de Docker no esté en el mismo segmento de red 172.17.x.x (por ejemplo, que NO aparezca `172.17.0.0/16 dev br-XXXX`).
  - Cambiar la red por defecto de Docker en el archivo `/etc/docker/daemon.json` agregando la siguiente configuración para evitar conflictos de networking 172.17.x.x:
    ```json
        {
          "bip": "172.30.0.1/16"
        }
    ```
  - **Eliminar redes Docker antiguas que usen 172.17.x.x (por ejemplo `v1_default`)**:
    - Desde WSL, en la carpeta del proyecto:
      ```bash
      cd ~/projects-enviromental-dev/bot-demandas-enlinea/v1
      docker compose down          # detiene contenedores y libera la red por defecto del compose
      docker network ls            # revisar redes existentes
      docker network rm v1_default # eliminar red antigua si sigue apareciendo
      ```
    - Volver a validar con `ip route` que ya no exista la ruta `172.17.0.0/16 dev br-...`.
  - Reiniciar Docker:
    ```bash
    sudo service docker restart
    ```
  - Validar la configuración con el comando `ip route` nuevamente.
  - Volver a realizar el telnet a la ip 172.17.8.141 y puerto 3306 para verificar que se pueda conectar a la BD.
  - Levantar el stack de docker nuevamente:
    ```bash
    cd ~/projects-enviromental-dev/bot-demandas-enlinea/v1
    docker compose build --no-cache
    docker compose up -d
    ```

 - Si usas subsystem ubuntu sobre windows y WSL2 debe tambien crear el archivo .wslconfig dentro de windows en la ruta `C:\Users\TU_USUARIO\.wslconfig` y agregar la siguiente configuración:
    ```ini
      [wsl2]
      networkingMode=mirrored
      dnsTunneling=true
    ```
 - Reiniciar WSL2:
    ```bash
    wsl --shutdown
    ```
 - Volver a realizar el telnet a la ip 172.17.8.141 y puerto 3306 para verificar que se pueda conectar a la BD.
 - Levantar el stack de docker nuevamente.
 
### Puppeteer / Chrome local en WSL2 (`BROWSERLESS_SHOW_BROWSER=true`)

Si se habilita el modo de navegador local (`BROWSERLESS_SHOW_BROWSER=true`) para ver gráficamente cómo el bot automatiza el portal, en WSL2 puede aparecer el error:

> `Failed to launch the browser process ... error while loading shared libraries: libasound.so.2: cannot open shared object file`

Esto significa que el Chrome que descarga Puppeteer para Linux necesita librerías del sistema que no están instaladas en la distro WSL. Para solucionarlo:

```bash
sudo apt-get update

sudo apt-get install -y \
  libasound2t64 \
  libnss3 \
  libxss1 \
  libatk-bridge2.0-0t64 \
  libatk1.0-0t64 \
  libgtk-3-0t64 \
  libdrm2 \
  libgbm1 \
  libxkbcommon0 \
  libxcomposite1 \
  libxrandr2 \
  libxdamage1 \
  libpango-1.0-0 \
  libcairo2
```

Además, es necesario:

- Tener un entorno gráfico disponible en WSL2 (WSLg en Windows 11 o un servidor X).
- Haber descargado el Chrome de Puppeteer (una sola vez) dentro del proyecto:

  ```bash
  cd ~/projects-enviromental-dev/bot-demandas-enlinea/v1
  npx puppeteer browsers install chrome
  ```

Si no se requiere ver el navegador, se recomienda dejar `BROWSERLESS_SHOW_BROWSER=false` en el `.env` y usar únicamente Browserless remoto.


## 📄 Licencia

**© 2026 MONTECHELO S.A.S - Todos los derechos reservados**
