#!/bin/bash

echo "🚀 INICIANDO SISTEMA SSH MONITOR - $(date)"
echo "================================================"

# Función para mostrar estado
show_status() {
    echo "📊 Estado actual:"
    netstat -tulpn | grep -E "(8091|3000|8080)" | head -5
    echo ""
}

# 1. Iniciar Backend Flask
echo "🔧 PASO 1: Iniciando Backend Flask (Puerto 8091)..."
cd /opt/ssh-monitor
source venv/bin/activate
nohup python3 ssh_openproject_monitor.py > backend.log 2>&1 &
BACKEND_PID=$!

# Esperar que el backend esté listo
echo "⏳ Esperando que el backend esté listo..."
sleep 5

# Verificar backend
if curl -s http://localhost:8091/api/health > /dev/null; then
    echo "✅ Backend iniciado correctamente (PID: $BACKEND_PID)"
else
    echo "❌ Error: Backend no responde"
    exit 1
fi

# 2. Iniciar Frontend React
echo "🎨 PASO 2: Iniciando Frontend React (Puerto 3000)..."
cd /opt/ssh-monitor/frontend-react
nohup npm start > frontend.log 2>&1 &
FRONTEND_PID=$!

# Esperar que el frontend esté listo
echo "⏳ Esperando que el frontend esté listo..."
sleep 10

# Verificar frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend iniciado correctamente (PID: $FRONTEND_PID)"
else
    echo "❌ Error: Frontend no responde"
fi

# 3. Mostrar estado final
echo ""
echo "🎯 SISTEMA INICIADO COMPLETAMENTE"
echo "=================================="
show_status

echo "📱 URLs de acceso:"
echo "   - Dashboard React: http://localhost:3000"
echo "   - Dashboard Flask: http://localhost:8080"
echo "   - API Backend: http://localhost:8091/api/"

echo ""
echo "🔍 Para monitorear logs:"
echo "   - Backend: tail -f /opt/ssh-monitor/backend.log"
echo "   - Frontend: tail -f /opt/ssh-monitor/frontend-react/frontend.log"

echo ""
echo "🛑 Para detener: ./scripts/stop_system.sh"
