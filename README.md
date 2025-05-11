# Sistema de Gestión de Producción

Sistema para gestionar y monitorizar la producción, personal, inventario y nóminas.

## Funcionalidades

- **Gestión de Personal**: Registro y administración de empleados
- **Operaciones**: Control de operaciones diarias
- **Inventario**: Gestión de productos y materiales
- **Notas**: Sistema de notas y recordatorios
- **Nómina**: Gestión de horas trabajadas y pagos

## Problema de CORS al cargar archivos HTML localmente

Al abrir la aplicación directamente desde archivos locales (usando el protocolo `file://`), surgen errores de CORS (Cross-Origin Resource Sharing) al intentar cargar plantillas HTML mediante `fetch()`. Esto es un comportamiento de seguridad normal de los navegadores modernos.

## Solución: Usar un servidor web local

Hemos creado un pequeño servidor web usando Express para servir la aplicación y evitar estos problemas.

### Requisitos previos

- Node.js instalado (versión 12 o superior)
- npm (viene con Node.js)

### Instrucciones para ejecutar la aplicación

1. **Instalar dependencias**

   Abre una terminal en la carpeta raíz del proyecto y ejecuta:

   ```bash
   npm install
   ```

2. **Iniciar el servidor**

   Una vez instaladas las dependencias, inicia el servidor con:

   ```bash
   npm start
   ```

   O si prefieres que el servidor se reinicie automáticamente cuando haces cambios:

   ```bash
   npm run dev
   ```

3. **Acceder a la aplicación**

   Abre tu navegador y ve a:

   ```
   http://localhost:3000
   ```

   La aplicación debería cargarse correctamente sin errores de CORS.

## Solución alternativa (sin servidor)

Si prefieres seguir usando la aplicación sin servidor, hemos modificado el código para cargar las plantillas directamente en JavaScript en lugar de usar `fetch`. Esta solución ya está implementada en el código.

## Notas

- El servidor web solo sirve archivos estáticos; no hay backend ni base de datos.
- Todos los datos se siguen guardando en el almacenamiento local de tu navegador (`localStorage`).
- Al usar el servidor, asegúrate de acceder a la aplicación usando la URL `http://localhost:3000` en lugar de abrir directamente los archivos HTML.

## Instalación

1. Clonar el repositorio
2. Abrir el archivo `app-mejorada/index.html` en un navegador web

## Uso de Git

Para contribuir al proyecto utilizando Git:

```bash
# Clonar el repositorio
git clone [url-del-repositorio]

# Crear una nueva rama para trabajar
git checkout -b nombre-de-la-rama

# Añadir cambios
git add .

# Confirmar cambios
git commit -m "Descripción clara del cambio realizado"

# Subir cambios
git push origin nombre-de-la-rama
```

## Estructura del Proyecto

- `/app-mejorada`: Versión principal de la aplicación
  - `/css`: Estilos
  - `/js`: Scripts de JavaScript
  - `/templates`: Plantillas HTML
  - `/img`: Imágenes

## Datos

Los datos se almacenan localmente utilizando LocalStorage del navegador.

## Licencia

Este proyecto es para uso interno.

## Contacto

Para más información, contactar al administrador del sistema. 