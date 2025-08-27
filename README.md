# Cliente Frontend JWT (Prueba Técnica)

Breve: este repositorio es una implementación de cliente frontend para una prueba técnica de 3 horas. Permite autenticar con JWT, ver/editar perfil y subir foto. Incluye además un servidor mock local (Node) y un script `run_all.bat` para automatizar el arranque y pruebas.

````markdown
# Cliente Frontend JWT (Prueba Técnica)

Breve: este repositorio es una implementación de cliente frontend para una prueba técnica de 3 horas. Permite autenticar con JWT, ver/editar perfil y subir foto. Incluye además un servidor mock local (Node) y un script `run_all.bat` para automatizar el arranque y pruebas.

## Contenido del repo

- `index.html` — Interfaz principal (Bootstrap).
- `src/app.js` — Lógica del cliente: login, obtener perfil, editar y subir foto.
- `src/styles.css` — Estilos (diseño tipo perfil LinkedIn).
- `server.js` — Mock API (Express) para pruebas locales.
- `package.json` — Dependencias del mock server.
- `run_all.bat` — Script para Windows que arranca servidores, abre la UI y ejecuta pruebas automáticas.
- `test_login.json`, `test_update.json` — payloads de prueba usados por `run_all.bat`.

# Cliente Frontend JWT (Prueba Técnica)

Breve: este repositorio es una implementación de cliente frontend para una prueba técnica de 3 horas. Permite autenticar con JWT, ver/editar perfil y subir foto. Incluye además un servidor mock local (Node) y un script `run_all.bat` para automatizar el arranque y pruebas.

## Contenido del repo

- `index.html` — Interfaz principal (Bootstrap).
- `src/app.js` — Lógica del cliente: login, obtener perfil, editar y subir foto.
- `src/styles.css` — Estilos (diseño tipo perfil LinkedIn).
- `server.js` — Mock API (Express) para pruebas locales.
- `package.json` — Dependencias del mock server.
- `run_all.bat` — Script para Windows que arranca servidores, abre la UI y ejecuta pruebas automáticas.
- `test_login.json`, `test_update.json` — payloads de prueba usados por `run_all.bat`.

## Herramientas necesarias

- Node.js / npm (para el mock server)
- Python (para servir archivos estáticos con `python -m http.server`)
- curl (incluido en Windows 10+)
- PowerShell (se usa en el `.bat` para parsear JSON)

Todo lo anterior suele estar disponible en un entorno de desarrollo estándar; asegúrate de tener `node`, `npm` y `python` en tu PATH.

## Objetivo de la prueba

Desarrollar una interfaz frontend que consuma las siguientes APIs autenticadas con JWT. El cliente debe:

- Solicitar `access` y `refresh` tokens en login.
- Guardar `access_token` en `localStorage`.
- Usar `Authorization: Bearer <access_token>` en las llamadas protegidas.
- Mostrar y permitir editar el perfil completo, y subir foto de perfil.

## Endpoints (especificación)

Base: `http://46.202.88.87:8010/usuarios/api` (el mock local usa `http://localhost:8010`)

- POST `/login/` -> devuelve `access` y `refresh`.
- GET `/perfil/` -> requiere `Authorization: Bearer <access>`.
- PUT `/usuario/perfil/` -> requiere `Authorization` y recibe JSON.
- PATCH `/perfil/foto/` -> requiere `Authorization` y multipart/form-data con campo `foto`.

## Credenciales de prueba

Usa (también en `test_login.json`):

```json
{
	"username": "carlosandresmoreno",
	"password": "90122856_Hanz"
}
```

## Estructura esperada para editar perfil (PUT)

Envía `Content-Type: application/json` y `Authorization: Bearer <access_token>`.

Ejemplo de cuerpo:

```json
{
	"user": { "first_name": "Carlos", "last_name": "Apellido" },
	"telefono": "1234",
	"tipo_usuario": "instructor",
	"tipo_naturaleza": "natural",
	"biografia": "dsdsds",
	"documento": "1234",
	"linkedin": "https://www.linkedin.com/in/carlos/",
	"twitter": "https://www.linkedin.com/in/carlos/",
	"github": "https://www.linkedin.com/in/carlos/",
	"sitio_web": "https://www.linkedin.com/in/carlos/",
	"esta_verificado": "false"
}
```

## Subir foto (PATCH)

Envía `multipart/form-data` con campo `foto`. Ejemplo con JavaScript (FormData) incluido en la descripción de la prueba.

## Ejecutar (paso a paso)

Opción A — método recomendado (usar mock local y `run_all.bat`)

1. Abre la carpeta del proyecto en el Explorador de Windows.
2. Haz doble clic en `run_all.bat` o ejecútalo desde cmd: `run_all.bat`.

Qué hace `run_all.bat` (resumen claro)

`run_all.bat` automatiza el arranque del entorno de pruebas y ejecuta comprobaciones básicas en Windows. En concreto:

- Inicia el mock API (Node) con `npm start` en una ventana de cmd. El mock queda escuchando en http://localhost:8010.
- Inicia un servidor estático con Python (`python -m http.server 8000`) en otra ventana de cmd para servir la UI en http://localhost:8000.
- Abre el navegador por defecto apuntando a http://localhost:8000.
- Realiza una petición POST de login usando `test_login.json` y guarda la respuesta en `login_response.json`.
- Extrae el token `access` del JSON de respuesta (mediante PowerShell) y lo muestra en consola.
- Realiza una petición PUT de prueba a `/usuario/perfil/` usando `test_update.json` y el token extraído; guarda la respuesta en `update_response.json`.
- Deja la ventana abierta (`pause`) para que puedas revisar los logs y resultados.

Dependencias que usa el script:

- Node.js y npm (para `npm start`).
- Python (para `python -m http.server`).
- curl (para enviar las peticiones HTTP desde el .bat).
- PowerShell (para parsear JSON y extraer el token dentro del .bat).

Uso recomendado:

- Ejecuta `run_all.bat` directamente (doble clic) o desde una consola: `run_all.bat`.
- Si prefieres ejecutar cada paso manualmente (para depuración), sigue la sección "Opción B — ejecutar manualmente".

## Opción B — ejecutar manualmente

1. Instala dependencias del mock (solo si quieres usar el mock):

```bash
npm install
```

2. Levanta el mock (opcional):

```bash
npm start
# mock API en http://localhost:8010
```

3. Sirve la UI (otra terminal):

```bash
python -m http.server 8000
# abre http://localhost:8000
```

4. Abre `http://localhost:8000` en tu navegador y usa las credenciales de prueba.

## Sobre CORS y el servidor remoto

- El cliente está configurado para usar el servidor remoto `http://46.202.88.87:8010/usuarios/api` por defecto.
- Si el servidor remoto no permite CORS desde tu navegador, usa el mock local (recomendado) o un proxy.

## Comprobaciones incluidas

- `run_all.bat` realiza una verificación básica: POST `/login/` y PUT `/usuario/perfil/` y muestra las respuestas.

## Entrega

- Este repo contiene todo lo necesario para probar la aplicación localmente. Para entrega en GitHub, sube el repo y adjunta instrucciones (este README).

---
Nota: todo lo anterior forma parte de la solución preparada para la prueba técnica descrita arriba.

## Estilos CSS

La interfaz usa un CSS ligero en `src/styles.css` para lograr una apariencia tipo perfil (inspirado en LinkedIn): cubierta (cover), foto circular solapada, y estilos responsivos.

Si quieres ajustar el diseño, edita `src/styles.css` y recarga la página en el navegador.

Contenido actual de `src/styles.css`:

```css
body { background: #f3f6f8; }

/* Cover and profile */
.profile-header .cover { height: 160px; background: linear-gradient(135deg,#0a66c2,#004182); }
.profile-photo-wrap { width:120px; height:120px; margin-top:-60px; }
.profile-photo { width:120px; height:120px; border-radius:50%; border:4px solid #fff; object-fit:cover; background:#e9ecef; }

.card { border-radius: 8px; }

#profile-name { font-weight:600; }
#profile-headline { color: #e6eefc; }

@media (max-width: 768px) {
	.profile-photo-wrap { width:96px; height:96px; margin-top:-48px; }
	.profile-photo { width:96px; height:96px; }
}
```

Consejos rápidos:

- Para ver cambios en CSS, recarga la página (F5) o limpia cache si no ves los cambios.
- Si quieres pruebas automatizadas de estilos, puedo añadir una pequeña hoja alternativa y un toggle en la UI para alternar temas.

## Demo

Aquí tienes un GIF de demostración incluido en el repositorio. Si estás viendo este README en GitHub se mostrará en línea.

![Demo del flujo de la UI](src/VIDEO.gif)

Si el GIF no se carga, abre `src/VIDEO.gif` directamente en tu navegador o en el explorador de archivos.


Aquí tienes un GIF de demostración incluido en el repositorio. Si estás viendo este README en GitHub se mostrará en línea.

![Demo del flujo de la UI](src/VIDEO.gif)

Si el GIF no se carga, abre `src/VIDEO.gif` directamente en tu navegador o en el explorador de archivos.

