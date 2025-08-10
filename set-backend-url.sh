#!/bin/bash
# Script para actualizar VITE_BACKEND_URL en .env automáticamente en Codespaces

# Detecta la URL pública del backend en Codespaces
BACKEND_URL=$(printenv | grep -Eo 'https://[a-z0-9-]+-3001\.app\.github\.dev')

if [ -z "$BACKEND_URL" ]; then
  echo "No se detectó la URL pública del backend. Copia y pega manualmente."
  exit 1
fi

# Actualiza el archivo .env del frontend
FRONT_ENV="/workspaces/AMS-Crochet-ProyectoFinal/.env"
if [ -f "$FRONT_ENV" ]; then
  sed -i "" "s|^VITE_BACKEND_URL=.*|VITE_BACKEND_URL=$BACKEND_URL|" "$FRONT_ENV"
else
  echo "VITE_BACKEND_URL=$BACKEND_URL" > "$FRONT_ENV"
fi

echo "VITE_BACKEND_URL actualizado a: $BACKEND_URL"
