# AMS Crochet - Proyecto Final

Este proyecto es una aplicación web para la gestión y venta de productos de crochet. Incluye un backend en Flask y un frontend en React, conectados mediante una API REST.

## Estructura
- **Backend:** Python (Flask), base de datos SQLite.
- **Frontend:** React + Vite.

## ¿Cómo probar el proyecto en Codespaces?

1. **Configura las variables de entorno**
   - En el archivo `.env`, asegúrate de que la variable `VITE_BACKEND_URL` apunte a la URL pública del backend (puerto 3001 expuesto como público).

2. **Inicia el backend**
   - Abre una terminal y ejecuta:
     ```
     python3 src/app.py
     ```
   - Verifica que el backend está corriendo y que el puerto 3001 está expuesto como público en Codespaces.

3. **Inicia el frontend**
   - Abre otra terminal y ejecuta:
     ```
     npm install
     npm run dev
     ```
   - El frontend se abrirá en el puerto 3000 (también debe estar expuesto como público).

4. **Accede a la aplicación**
   - Abre la URL pública del frontend en tu navegador.
   - Puedes iniciar sesión, ver productos y probar el CRUD.

## Notas
- Si tienes problemas de conexión, revisa que los puertos estén expuestos y que las variables de entorno sean correctas.
- Si cambias el archivo `.env`, reinicia el servidor del frontend.

---

**Autor:** AlejandroMS1049
