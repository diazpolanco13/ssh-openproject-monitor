#!/bin/bash

# SSH OpenProject Monitor - Stop Script
# Detiene tanto el backend como el frontend

echo "🛑 Deteniendo SSH OpenProject Monitor..."

# Leer PIDs si existen
if [ -f /opt/ssh-monitor/backend.pid ]; then
    BACKEND_PID=$(cat /opt/ssh-monitor/backend.pid)
    echo "🔧 Deteniendo backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null
    rm -f /opt/ssh-monitor/backend.pid
fi

if [ -f /opt/ssh-monitor/frontend.pid ]; then
    FRONTEND_PID=$(cat /opt/ssh-monitor/frontend.pid)
    echo "🌐 Deteniendo frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null
    rm -f /opt/ssh-monitor/frontend.pid
fi

# Matar cualquier proceso restante por nombre
echo "🧹 Limpieza final..."
pkill -f "ssh_openproject_monitor.py" 2>/dev/null
pkill -f "serve -s build" 2>/dev/null

echo ""
echo "✅ SSH OpenProject Monitor detenido completamente"
echo ""
