/**
 * Servidor HTTP simple para la aplicación de Gestión de Producción
 * Este servidor evita problemas de CORS al cargar archivos locales
 */

const express = require('express');
const path = require('path');
const app = express();
const port = 3001;

// Servir archivos estáticos desde la carpeta de la aplicación
app.use(express.static(path.join(__dirname, 'app-mejorada')));

// Ruta principal redirige a index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'app-mejorada', 'index.html'));
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
  console.log(`Abre tu navegador en http://localhost:${port} para ver la aplicación`);
}); 