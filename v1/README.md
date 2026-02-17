# bot-demandas-enlinea

**Autor:** Ramón Dario Rozo Torres 
**Versión:** 1.0.0

## 📋 Descripción General

Este proyecto es un bot desarrollado en **Node.js** que automatiza la radicación de demandas en línea en el portal oficial de la Rama Judicial de Colombia (`https://procesojudicial.ramajudicial.gov.co/demandaenlinea`). El bot simula el flujo que hoy realiza un usuario humano: acepta los términos y condiciones del modal inicial, diligencia los campos de los 6 bloques del formulario (selects, textos, sujetos procesales, adjuntos), interactúa con el **reCAPTCHA** (resolución vía Browserless) y finalmente envía la demanda, minimizando errores manuales y tiempos operativos.

La ejecución se realiza únicamente en **horarios y días laborales configurados**: inicialmente **lunes a viernes de 08:00 a 12:00 y de 13:00 a 17:00**, excluyendo **fines de semana y festivos en Colombia**. Un módulo de configuración de horarios y días laborales centraliza esta lógica y permitirá ajustes desde un frontend en versiones posteriores.

El sistema está pensado para ser **escalable por carteras**. En el **MVP** se trabaja con un primer tipo de cartera: **Carteras Propias**. Posteriormente se incorporarán otras carteras (por ejemplo **Carteras Sudameris**) con sus propias estrategias de radicación y fuentes de datos, sin modificar el núcleo del sistema gracias a la arquitectura hexagonal y al uso de estrategias por cartera.


## 🤝 Contribución

Puedes abrir el repositorio aquí: [https://dev.azure.com/MontecheloPipelines/urlfinalrepo](https://dev.azure.com/MontecheloPipelines/urlfinalrepo)

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

## 🚀 Levantamiento y uso (con Docker)

El sistema pendiente construir el levantamiento y uso.

### Requisitos previos

- **Docker** y **Docker Compose** instalados.
- Levantar siempre apuntando environment a ambiente **QA**: **VPN activa** antes de levantar el stack.
- Archivo **`.env`** configurado (copiar desde `.env.example`
- Solicitar las credenciales de la BD de QA al equipo de desarrollo)
- Redis se levanta en ip local 127.0.0.1 junto al puerto 6379.

### Paso a paso

1. **Ubicarse en la raíz de la versión v1** (donde estará `docker-compose.yml`):
   ```bash
   cd bot-demandas-enlinea/v1
   ```

2. **Variables de entorno** Copiar archivo `.env.example` a `.env` y ajustar las variables de entorno apuntando a ambiente QA.

3. **Crear imágenes** Construir imágenes sin caché:
   ```bash
   docker compose build --no-cache
   ```

4. **Levantar todos los servicios**:
   - Con logs en consola:
     ```bash
     docker compose up
     ```
   - En segundo plano (detached):
     ```bash
     docker compose up -d
     ```

5. **Abrir Swagger** en el navegador para controlar el sistema:
   - **URL:** [http://localhost:5006/docs](http://localhost:5006/docs)
   - Ahí aparecen todos los endpoints. Para ejecutar uno: **"Try it out"** → rellenar parámetros si pide → **"Execute"** → ver el resultado (código HTTP y body).

**Notas importantes:**
- Cuando se levanta el sitema el bot no se inicia automaticamente, se debe iniciar manualmente mediante el endpoint `/start` o `/execute` desde Swagger UI.


## 📞 Soporte

- **Creador:** Ramón Dario Rozo Torres 

## 🐞 Bugs o problemas conocidos

### Alcance al servidor de QA (172.17.8.141)
- Verificar que la VPN esté activa.
- Hacer un telnet a la ip 172.17.8.141 y puerto 3306 para verificar que se pueda conectar a la BD.
- Activar el telnet si no está activo en tu sistema operativo.
- Problemas de red entre docker y el servidor de QA por causas de networking 172.17.x.x, por lo que se debe:
  - Validar el comando `ip route` en tu sistema operativo para verificar que la red de docker no esté en el mismo segmento de red 172.17.x.x.
  - Cambiar la red por defecto de docker en el archivo `/etc/docker/daemon.json` agregando la siguiente configuración para evitar conflictos de networking 172.17.x.x:
    ```json
        {
          "bip": "172.30.0.1/16"
        }
    ```
 - Reiniciar Docker:
    ```bash
    sudo service docker restart
    ```
 - Validar la configuración con el comando `ip route` nuevamente.
 - Volver a realizar el telnet a la ip 172.17.8.141 y puerto 3306 para verificar que se pueda conectar a la BD.
 - Levantar el stack de docker nuevamente.

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
