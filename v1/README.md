# bot-demandas-enlinea

**Autor:** Ramón Dario Rozo Torres 
**Versión:** 1.0.0

## 📋 Descripción General

Este proyecto es un bot desarrollado en **Node.js** que automatiza la radicación de demandas en línea en el portal oficial de la Rama Judicial de Colombia (`https://procesojudicial.ramajudicial.gov.co/demandaenlinea`). El bot simula el flujo que hoy realiza un usuario humano: acepta los términos y condiciones del modal inicial, diligencia los campos de los 6 bloques del formulario (selects, textos, sujetos procesales, adjuntos), interactúa con el **reCAPTCHA** (resolución vía Browserless) y finalmente envía la demanda, minimizando errores manuales y tiempos operativos.

La ejecución se realiza únicamente en **horarios y días laborales configurados**: inicialmente **lunes a viernes de 08:00 a 12:00 y de 13:00 a 17:00**, excluyendo **fines de semana y festivos en Colombia**. Un módulo de configuración de horarios y días laborales centraliza esta lógica y permitirá ajustes desde un frontend en versiones posteriores.

El sistema está pensado para ser **escalable por carteras**. En el **MVP** se trabaja con un primer tipo de cartera: **Carteras Propias**. Posteriormente se incorporarán otras carteras (por ejemplo **Carteras Sudameris**) con sus propias estrategias de radicación y fuentes de datos, sin modificar el núcleo del sistema gracias a la arquitectura hexagonal y al uso de estrategias por cartera.


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
bot-demandas-enlinea/
├── v1/
│   ├── src/
│   │   ├── domain/                    # Núcleo de negocio (entidades, VOs, puertos)
│   │   │   ├── entities/              # Demanda, Cartera, SujetoProcesal, Campaña, etc.
│   │   │   ├── value-objects/         # Nit, Correo, HorarioLaboral, CodigoCiudad, etc.
│   │   │   └── ports/                 # BrowserAutomationPort, DemandaRepositoryPort, HorarioLaboralPort, etc.
│   │   ├── application/               # Casos de uso y lógica de orquestación
│   │   │   ├── use-cases/             # OrquestarRadicacionDemanda, ConsultarPendientes, ActualizarEstado, etc.
│   │   │   └── strategies/            # Estrategias por cartera/campaña (CarterasPropias, Sudameris, ...)
│   │   ├── infrastructure/            # Adaptadores concretos (límite exterior del hexágono)
│   │   │   ├── browser/               # BrowserlessPuppeteerAdapter (Puppeteer + Browserless)
│   │   │   ├── persistence/           # Repositorios MySQL (configuración + BD por cartera)
│   │   │   ├── scheduling/            # Adaptador de horarios / calendario (días laborales, festivos CO)
│   │   │   └── queues/                # Procesadores BullMQ (colas de radicación)
│   │   └── interfaces/                # API REST y demás interfaces de entrada
│   │       ├── http/                  # Controladores NestJS (demandas, carteras, config/horarios)
│   │       └── modules/               # Módulos NestJS (DemandaModule, CarteraModule, ConfigModule, ...)
│   ├── test/                          # Pruebas unitarias e integración
│   ├── docker/                        # Archivos relacionados a Docker y docker-compose
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md                      # Documentación específica de la versión v1
└── README.md                          # Documentación general del repositorio
```

## 🧩 Componentes Principales

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
- **Gestión de reintentos** ante fallos temporales (timeout, reCAPTCHA, errores del portal).
- **Registro y trazabilidad** de cada intento de radicación (logs estructurados, auditoría).
- **Ejecución programada** (jobs) y ejecución manual vía API; documentación de la API con **Swagger**.

## 🔍 Endpoints Principales

Endpoints planeados para la API REST (NestJS), documentados con Swagger:

- `GET /health` – Verificación de que el servicio está vivo.
- `POST /api/v1/demandas` – Crea un trabajo de radicación para una cartera/campaña.
- `GET /api/v1/demandas/{id}` – Consulta el estado de una demanda (pendiente, en proceso, exitosa, error).
- `POST /api/v1/demandas/{id}/reintentar` – Reintenta la radicación de una demanda que falló.
- `GET /api/v1/carteras` – Lista carteras y campañas configuradas.
- `GET /api/v1/config/horarios` – Consulta la configuración de horarios y días laborales (y en el futuro, ajustes vía frontend).

Documentación automática de la API:

- `Swagger UI` – Documentación interactiva generada desde OpenAPI.
- `http://localhost:5006/docs` (puerto y ruta ajustables según configuración final).


## 🔒 Seguridad

- **Acceso controlado a la API**: autenticación mediante API Key o JWT para los endpoints sensibles.
- **Manejo de secretos**: credenciales de BD, claves de servicios de reCAPTCHA y otros secretos solo en `.env` (no versionado).
- **VPN / Segmentación de red**: acceso a las BDs de cartera y QA exclusivamente a través de VPN corporativa.
- **Logs y auditoría**: registro de quién dispara procesos y seguimiento de cada radicación.
- **Mínimos privilegios**: usuarios de BD y del sistema con permisos limitados al mínimo necesario.

---

## 📦 Instalación

### Base de datos

La API se apoya en una **BD de configuración única** (multi-cartera y multi-campaña) y, opcionalmente, en una BD por cartera.  
La BD de configuración por defecto en esta versión es **`dbd_demands_online`**, controlada por la variable:

```env
DB_CONFIG_DATABASE=dbd_demands_online
```

En esa BD se crean, vía **migraciones TypeORM**, las tablas de catálogo y configuración que ya ves en el código:

- `environment_type`  
- `state_type`  
- `portfolio_type`  
- `campaing_type`  
- `data_bases` (BDs por entorno/cartera/campaña)  
- `attention_schedule` (horarios por cartera/campaña)  
- `departament`  
- `city`  
- `specialty_process` (especialidades del portal Demanda en Línea)  
- `class_process` (clases de proceso por especialidad)  
- `class_process_config` (cruce cartera + campaña + clases de proceso)

Los seeds llenan estas tablas con datos base (entornos dev/qa/pro, tipos de estado, carteras **Propias/Sudameris**, campañas **Claro/Tuya**, catálogos de departamentos/ciudades y el cruce inicial de clases de proceso por cartera/campaña).

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
     DROP DATABASE IF EXISTS dbd_demands_online;
     CREATE DATABASE dbd_demands_online
       CHARACTER SET utf8mb4
       COLLATE utf8mb4_0900_ai_ci;
   "
   ```

2. **Configurar `.env`** – Copia `.env.example` a `.env` (si aplica) y define la BD de configuración:

   ```env
   DB_CONFIG_DATABASE=dbd_demands_online
   ```

   Ajusta también `DB_CONFIG_HOST`, `DB_CONFIG_PORT`, `DB_CONFIG_USER` y `DB_CONFIG_PASSWORD` según tu MySQL.

3. **Ejecutar migraciones (estructura)** – Crea/actualiza **todas las tablas** de configuración (`environment_type`, `state_type`, `portfolio_type`, `campaing_type`, `data_bases`, `attention_schedule`, `departament`, `city`, `specialty_process`, `class_process`, `class_process_config`):

   ```bash
Obtener la fecha y hora actual en formato ISO:
node -e "console.log(Date.now())"

   cd bot-demandas-enlinea/v1
   npm run migrations          # alias corto
   # o, equivalente:
   # npm run migration:run
   ```

4. **Cargar seeds de configuración** – Hace `TRUNCATE config_data_bases` y vuelve a insertar todas las filas definidas en los seeds:

   ```bash
   npm run seeds               # alias corto
   # o, equivalente:
   # npm run seed:run
   ```

5. **Revertir la última migración de estructura** (si aplica):

   ```bash
   npm run migration:revert
   ```

6. **Reset completo de estructura + datos de configuración** (por ejemplo, para dejar la BD “de cero” con los seeds actuales):

   ```bash
   npm run migration:revert    # elimina la tabla config_data_bases
   npm run migrations          # vuelve a crear la tabla (estructura limpia)
   npm run seeds               # TRUNCATE + inserta todos los seeds
   ```

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


## 📄 Licencia

**© 2026 MONTECHELO S.A.S - Todos los derechos reservados**
