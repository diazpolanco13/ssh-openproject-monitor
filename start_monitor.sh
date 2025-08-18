#!/bin/bash

# SSH OpenProject Monitor - Startup Script
# Inicia tanto el backend como el frontend

echo "🚀 Iniciando SSH OpenProject Monitor v3.2..."

# Directorio base
cd /opt/ssh-monitor

# Matar procesos anteriores si existen
echo "🧹 Limpiando procesos anteriores..."
pkill -f "ssh_openproject_monitor.py" 2>/dev/null
pkill -f "serve -s build" 2>/dev/null
sleep 2

# Iniciar backend en background
echo "🔧 Iniciando backend (puerto 8080)..."
if [ -d "/opt/ssh-monitor/venv" ]; then
    echo "   Usando entorno virtual..."
    nohup /opt/ssh-monitor/venv/bin/python /opt/ssh-monitor/ssh_openproject_monitor.py > backend.log 2>&1 &
else
    echo "   Usando Python del sistema..."
    nohup python3 ssh_openproject_monitor.py > backend.log 2>&1 &
fi
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Esperar que el backend esté listo
sleep 5

# Iniciar frontend en background
echo "🌐 Iniciando frontend (puerto 3001)..."
cd frontend
nohup npx serve -s build -l 3001 > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Guardar PIDs para control posterior
cd ..
echo $BACKEND_PID > backend.pid
echo $FRONTEND_PID > frontend.pid

# Verificar que los servicios estén funcionando
echo "🔍 Verificando servicios..."
sleep 3

# Verificar backend
if curl -s http://localhost:8081/api/version > /dev/null 2>&1; then
    echo "   ✅ Backend funcionando correctamente"
else
    echo "   ❌ Backend no responde"
fi

# Verificar frontend
if curl -s http://localhost:3001/ > /dev/null 2>&1; then
    echo "   ✅ Frontend funcionando correctamente"
else
    echo "   ❌ Frontend no responde"
fi

echo ""
echo "✅ SSH OpenProject Monitor iniciado exitosamente!"
echo ""
echo "📊 URLs de acceso:"
echo "   - Dashboard: http://45.137.194.210:3001"
echo "   - API Backend: http://45.137.194.210:8081"
echo ""
echo "📋 Control de procesos:"
echo "   - Backend PID: $BACKEND_PID"
echo "   - Frontend PID: $FRONTEND_PID"
echo ""
echo "🛑 Para detener: bash /opt/ssh-monitor/stop_monitor.sh"
echo ""
