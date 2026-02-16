# bot-demandas-enlinea

**Autor:** Ramón Dario Rozo Torres 
**Versión:** 1.0.0

## 📋 Descripción General

Este proyecto es un bot desarrollado en **Node.js** que automatiza la radicación de demandas en línea en el portal oficial de la Rama Judicial de Colombia (`https://procesojudicial.ramajudicial.gov.co/demandaenlinea`).  
El bot simula el flujo que hoy realiza un usuario humano: acepta los términos y condiciones del modal inicial, diligencia los campos de los 6 bloques del formulario (selects, textos, sujetos procesales, adjuntos), interactúa con el **reCAPTCHA** y finalmente envía la demanda, minimizando errores manuales y tiempos operativos.


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

```text
Arquitectura basada en **Hexagonal / Clean Architecture**

                   +-------------------------------+
                   |      Interfaces de Entrada    |
                   |-------------------------------|
                   |  - API REST (NestJS/Express)  |
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
                   |  - Manejo de transacciones    |
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
                   +-----------------------+-------+
                                           |
                               (Adaptadores externos)
                                           |
   +------------------------+--------------v---------------------------+
   |                    Capa de Infraestructura                        |
   |------------------------------------------------------------------|
   | - PuppeteerBrowserAdapter (automatiza demandaenlinea)            |
   | - Nstbrowser/BrowserlessAdapter (opcional anti-detección)        |
   | - Adaptadores de reCAPTCHA (2Captcha, Anti-Captcha, CapSolver)   |
   | - Repositorios MySQL multi-BD (una BD por cartera + BD config)   |
   | - Redis + BullMQ (cola de trabajos del bot)                      |
   | - Logging, métricas, configuración, notificaciones (email, etc.) |
   +------------------------------------------------------------------+
```

## 📦 Stack Tecnológico

### Backend

| Tecnología         | Versión / Librería          | Descripción                                                        |
| ------------------ | --------------------------- | ------------------------------------------------------------------ |
| **Node.js**        | 22.13.1+ (LTS recomendada)  | Runtime principal (TypeScript)                                    |
| **TypeScript**     | 5.x                         | Tipado estático y mejor mantenibilidad                            |
| **NestJS / Express** | Última LTS                | Framework HTTP para exponer API REST y casos de uso               |
| **Puppeteer**      | Última estable              | Automatización de navegador (Chrome)                              |
| **puppeteer-extra** + **stealth-plugin** | Última | Disminuir fingerprint de bot y mitigación básica anti-bot        |
| **BullMQ**         | Última estable              | Manejo de colas de trabajos sobre Redis                           |
| **dotenv** / config| Última estable              | Gestión de variables de entorno y configuración por ambiente      |
| **Jest** / **Vitest** | Última                   | Pruebas unitarias e integración                                   |

### Base de Datos

| Tecnología        | Versión       | Descripción                                                  |
| ----------------- | ------------- | ------------------------------------------------------------ |
| **MySQL**         | 5.7 / 8.0     | Motor principal relacional                                   |
| **BD Configuración** |           | Catálogo de carteras, campañas, estrategias y mapeos        |
| **BD por Cartera** |             | Cada cartera puede tener su propia BD (multi-tenant físico) |
| **Redis**         | 6+            | Cola de trabajos (BullMQ) y caché liviano                   |

### DevOps / Infra

| Tecnología           | Versión    | Descripción                                 |
| -------------------- | ---------- | ------------------------------------------- |
| **Docker**           | 20.10+     | Contenedorización de servicios              |
| **Docker Compose**   | 1.29+      | Orquestación local (API, Redis, MySQL)      |
| **Swagger UI / OpenAPI** | Latest | Documentación interactiva de la API REST    |
| **Azure DevOps / GitHub Actions** | N/A | Pipelines CI/CD (build, tests, despliegue) |

## 📁 Estructura del Proyecto

```text
bot-demandas-enlinea/
├── v1/
│   ├── src/
│   │   ├── domain/              # Entidades, VOs, puertos (interfaces)
│   │   ├── application/         # Casos de uso, servicios de orquestación
│   │   ├── infrastructure/      # Adaptadores (Puppeteer, MySQL, Redis, reCAPTCHA, etc.)
│   │   └── interfaces/          # API REST, CLI, schedulers
│   ├── test/                    # Pruebas unitarias e integración
│   ├── docker/                  # Archivos relacionados a imágenes y compose
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
└── README.md (documentación general del repositorio)
```

## 🧩 Componentes Principales

- **Orquestador de Demandas**: coordina todo el flujo de creación y envío de la demanda por cartera/campaña.
- **Módulo de Cartera/Estrategias**: encapsula la lógica específica por cartera (propia, Sudameris, etc.) y campaña.
- **Adaptador Puppeteer**: automatiza el portal `demandaenlinea` (modal de términos, selects, campos, adjuntos, envío).
- **Módulo reCAPTCHA**: encapsula la integración con la solución elegida (gratuita o de pago) mediante `CaptchaSolverPort`.
- **Módulo de Integración BD**: lee la información de las distintas bases de datos de cartera y la BD de configuración.
- **Cola de Trabajos (BullMQ + Redis)**: encola, reintenta y monitorea los procesos de radicación.
- **API REST**: expone endpoints para disparar procesos, consultar estados y administrar configuraciones básicas.

## 🚀 Funcionalidades

### Funcionalidades Core

- **Automatizar radicación de demandas** en el portal `demandaenlinea`, simulando el flujo humano completo.
- **Soportar múltiples carteras y campañas**, cada una con su estrategia de radicación y su propia fuente de datos.
- **Manejo de adjuntos** (mínimo 1 archivo, máximo 75 MB por las restricciones del portal).
- **Gestión de reintentos** ante fallos temporales (timeout, reCAPTCHA, errores intermitentes del portal).
- **Registro y trazabilidad** de cada intento de radicación (logs estructurados, auditoría básica).
- **Ejecución programada** (jobs) y ejecución manual vía API para demandas puntuales o pruebas.

## 🔍 Endpoints Principales

Algunos endpoints planeados para la API REST (NestJS/Express):

- `GET /health` – Verificación simple de que el servicio está vivo.
- `POST /api/v1/demandas` – Crea un nuevo trabajo de radicación de demanda para una cartera/campaña.
- `GET /api/v1/demandas/{id}` – Consulta el estado de una demanda radicada (pendiente, en proceso, exitosa, error).
- `POST /api/v1/demandas/{id}/reintentar` – Reintenta la radicación de una demanda que falló.
- `GET /api/v1/carteras` – Lista carteras y campañas configuradas (según permisos).

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
