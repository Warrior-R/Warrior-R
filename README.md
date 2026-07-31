# Carlos Guerrero

**Desarrollador Senior · Consultor y Auditor TIC — República Dominicana**

Trabajo en los dos lados de la tecnología: el que la evalúa y el que la
construye. Por un lado, auditoría y consultoría TIC, gestión de proyectos,
implementación de plataformas y adquisición de equipamiento tecnológico. Por
otro, desarrollo de producto de extremo a extremo —del modelo de datos y las
políticas de seguridad hasta la interfaz y el despliegue.

Esa combinación es deliberada: quien especifica una compra o audita un sistema
decide mejor si ha construido uno, y quien construye lo hace con otro criterio si
ha tenido que auditarlo.

📧 [carguerrero1998@gmail.com](mailto:carguerrero1998@gmail.com)

---

## Experiencia

**Auditoría TIC**
Revisión de sistemas de información, controles y procesos tecnológicos.
Evaluación de riesgos, verificación de cumplimiento y elaboración de informes con
hallazgos y recomendaciones accionables.

**Consultoría TIC**
Asesoría técnica en decisiones de tecnología: diagnóstico de la situación actual,
definición de la solución, elección de arquitectura y proveedores, y
acompañamiento durante la implementación.

**Especialista en Proyectos TIC**
Gestión de proyectos tecnológicos de principio a fin: levantamiento de
requerimientos, alcance y planificación, coordinación de los equipos y
proveedores involucrados, seguimiento de la ejecución y cierre.

**Implementación de plataforma Moodle**
Puesta en marcha de Moodle como plataforma de aprendizaje: despliegue y
configuración del entorno, estructura de cursos y categorías, esquema de roles,
permisos y matriculación, instalación de plugins y temas, integración con los
sistemas existentes, migración de contenido y acompañamiento a docentes y
administradores para que la plataforma quede en uso real.

**Compras y adquisiciones de equipos tecnológicos**
Redacción de especificaciones técnicas, análisis de necesidades reales frente a
lo solicitado, evaluación comparativa de ofertas y proveedores, y control de la
recepción y conformidad de lo adquirido.

**Desarrollo de software senior**
Diseño e implementación de sistemas completos: modelo de datos, lógica de
servidor, seguridad, interfaz, pruebas automatizadas y despliegue continuo. Los
proyectos de abajo son ejemplos concretos.

---

## Proyectos

| Proyecto | Qué es | Stack | Repo |
|---|---|---|---|
| **MercadoRD** | Marketplace y subastas con KYC obligatorio | Next.js 16 · React 19 · TypeScript · Supabase | [Público](https://github.com/Warrior-R/mercadord) |
| **Korai POS** | Punto de venta de escritorio *local-first* | Electron · React · Vite · SQLite | Privado |
| **JARVIS Hands** | Control de macOS por gestos con la webcam | Python · MediaPipe · OpenCV | Privado |
| **El Cafecito** | Podcast diario de noticias, 100 % automático | Python · GitHub Actions · TTS · Supabase | Privado |
| **Warrior Marketplace** | Prototipo de marketplace con subastas en vivo | Next.js · Prisma · NextAuth · Socket.IO | [Público](https://github.com/Warrior-R/Warrior-R) |

---

### MercadoRD — marketplace con verificación de identidad

**[github.com/Warrior-R/mercadord](https://github.com/Warrior-R/mercadord)** · público

Plataforma de compra-venta y subastas para República Dominicana, donde comprar o
vender exige haber verificado la identidad (requisito de la Ley 172-13).

- **Aplicación** — Next.js 16 (App Router), React 19, TypeScript y Tailwind CSS 4.
  Catálogo por categorías, búsqueda, fichas de producto y de vendedor, favoritos,
  mensajería, subastas con puja, carrito con ITBIS del 18 %, panel de
  administración (reportes y banners) y páginas legales.
- **Datos y sesión** — Supabase: PostgreSQL con Row Level Security, autenticación
  por correo y Google OAuth.
- **KYC** — la aprobación de identidad es **íntegramente del lado del servidor**:
  una Edge Function en Deno abre la sesión con el proveedor (Didit) y recibe el
  webhook firmado; un trigger en Postgres impide que una cuenta se marque a sí
  misma como verificada. El cliente nunca puede otorgarse la verificación.
- **Calidad** — CI en GitHub Actions con lint, chequeo de tipos, tests unitarios
  (Vitest), build y end-to-end (Playwright). Despliegue continuo en Vercel.
- **Historia** — nació como sitio estático en HTML y JavaScript sin bundler ni
  framework, y fue re-plataformado a Next.js conservando el producto en marcha.

---

### Korai POS — punto de venta para negocios dominicanos

Privado · aplicación de escritorio para Windows

Sistema de punto de venta pensado para colmados y tiendas pequeñas, que tiene que
seguir vendiendo cuando se cae el internet.

- **Local-first** — la base de datos vive en el equipo (SQLite mediante `sql.js`),
  así que el negocio opera sin conexión.
- **Módulos** — venta, inventario, cuadre de caja, reportes, administración,
  pantalla orientada al cliente y asistente de configuración inicial.
- **Hardware** — impresión de recibos en impresoras térmicas
  (`node-thermal-printer`) y lector de códigos de barras USB con atajo `F2`.
- **Alta de productos asistida** — al escanear un código desconocido se consulta
  OpenFoodFacts y el formulario llega pre-llenado con nombre, marca e imagen; solo
  falta poner precio y existencias. Caché local de los últimos 500 códigos, que
  además sirve de respaldo sin internet.
- **Distribución** — instalador NSIS para Windows x64 y actualizaciones
  automáticas vía `electron-updater` publicadas como releases de GitHub.

Electron 32 · React 18 · Vite 5 · Zustand · React Router

---

### JARVIS Hands — control de macOS con gestos de la mano

Privado · macOS (Apple Silicon e Intel)

Controlar el Mac con la mano frente a la webcam: mover el cursor, hacer clic,
arrastrar, hacer scroll, subir el volumen o el brillo, cambiar de app.

- **Visión** — MediaPipe `HandLandmarker` (Tasks API) sobre OpenCV; 21 puntos de
  la mano por fotograma, con la inferencia en su propio hilo para que no frene la
  captura ni el render.
- **Precisión** — filtro *One Euro* para suavizar el cursor sin introducir
  retardo, y mapeo correcto en pantallas Retina.
- **Gestos entrenables sin programar** — se pueden enseñar **poses** nuevas (se
  reconocen por plantillas, invariantes a posición, escala y rotación) y **gestos
  de movimiento** (reconocedor tipo *$1* con auto-segmentación de la trayectoria).
  A cada uno se le asigna un atajo de teclado, abrir una app, escribir un texto o
  una función del sistema. Quedan activos al instante.
- **Dos manos, roles separados** — una mano lleva el cursor y la otra hace los
  gestos, para que el puntero nunca se congele mientras gesticulas.
- **Teclado flotante en el aire** — hasta 10 punteros simultáneos (un dedo, un
  puntero) sobre un overlay transparente que no roba el foco a la app activa.
- Empaquetado como `.app` de doble clic y suite de tests que valida la lógica de
  gestos sin necesidad de cámara.

Python · MediaPipe · OpenCV · pynput

---

### El Cafecito — podcast diario de noticias, sin intervención humana

Privado · publica solo, de lunes a viernes

Un robot que cada mañana investiga las noticias de República Dominicana, escribe
el guion, lo narra con dos voces dominicanas, genera la portada y publica el
episodio. Nadie toca nada.

```
Google News RSS  →  guion (Claude)  →  TTS 2 voces es-DO  →  portada generada
                 →  Supabase Storage  →  feed.xml  →  Spotify / Apple / YouTube Music
```

- **Corre en GitHub Actions** con `cron`, así que no depende de que haya un
  computador encendido.
- **Voces** — `es-DO-RamonaNeural` y `es-DO-EmilioNeural` vía `edge-tts`, con
  control de ritmo y pausas; ensamblado con ffmpeg.
- **Portadas generadas por código** a partir de los titulares del día (SVG → PNG).
- **Distribución estándar** — se publica un feed RSS válido, de modo que las
  plataformas absorben cada episodio nuevo por su cuenta, sin subir nada a mano.
- **Coste de operación prácticamente cero** apoyándose en capas gratuitas.
- Cada episodio cierra con una nota de transparencia: las voces son sintéticas.

Python · GitHub Actions · edge-tts · ffmpeg · Node.js · Supabase Storage

---

### Warrior Marketplace — prototipo de marketplace con subastas en vivo

**[github.com/Warrior-R/Warrior-R](https://github.com/Warrior-R/Warrior-R)** · público

Exploración previa a MercadoRD, centrada en el modelo de datos y en las subastas
en tiempo real.

- **Modelo de dominio** en Prisma sobre PostgreSQL: verificación de identidad por
  etapas (pendiente → documento → biométrica → completa), productos con precio
  fijo y/o subasta, pujas con paso mínimo y precio de compra inmediata, órdenes
  con métodos de pago locales (transferencia, pago móvil, contra entrega),
  reseñas bidireccionales comprador–vendedor, lista de seguimiento y
  notificaciones.
- **Tiempo real** con Socket.IO para las pujas.
- **Categorización asistida por IA** de los anuncios mediante el SDK de Anthropic.
- Next.js 16 · React 19 · NextAuth v5 · Radix UI · Zustand · Zod · Framer Motion

---

## Stack

**Frontend** — TypeScript · React · Next.js (App Router) · Tailwind CSS · Radix UI · Zustand

**Backend y datos** — PostgreSQL · Supabase (RLS, Auth, Storage, Edge Functions en Deno) · Prisma · Socket.IO

**Escritorio** — Electron · Vite · SQLite

**Python** — MediaPipe · OpenCV · automatización y pipelines de contenido

**Plataformas** — Moodle (LMS): implementación, configuración e integración

**Infra** — Vercel · GitHub Actions (CI/CD y cron) · Playwright · Vitest

---

<sub>Los proyectos marcados como privados son trabajo real cuyo código no es
público. Con gusto los explico o los muestro en una conversación.</sub>
