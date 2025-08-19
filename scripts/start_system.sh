#!/bin/bash

echo "🚀 INICIANDO SISTEMA SSH MONITOR - $(date)"
echo "================================================"

# Función para mostrar estado
show_status() {
    echo "📊 Estado actual:"
    netstat -tulpn | grep -E "(8091|3000|8080)" | head -5
    echo ""
}

# Verificar si PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    npm install -g pm2
fi

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
if curl -s http://localhost:8091/api/server/status > /dev/null; then
    echo "✅ Backend iniciado correctamente (PID: $BACKEND_PID)"
else
    echo "❌ Error: Backend no responde"
    exit 1
fi

# 2. Iniciar Frontend React con PM2
echo "🎨 PASO 2: Iniciando Frontend React con PM2 (Puerto 3000)..."
cd /opt/ssh-monitor/frontend-react

# Detener proceso anterior si existe
pm2 delete react-app 2>/dev/null || true

# Iniciar con PM2
pm2 start npm --name "react-app" -- run dev

# Configurar para que inicie automáticamente
pm2 startup 2>/dev/null || true
pm2 save

# Esperar que el frontend esté listo
echo "⏳ Esperando que el frontend esté listo..."
sleep 10

# Verificar frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend iniciado correctamente con PM2"
    echo "📱 PM2 Status:"
    pm2 status
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
echo "   - Dashboard Remoto: http://45.137.194.210:3000"
echo "   - API Backend: http://localhost:8091/api/"

echo ""
echo "🔍 Para monitorear logs:"
echo "   - Backend: tail -f /opt/ssh-monitor/backend.log"
echo "   - Frontend: pm2 logs react-app"
echo "   - PM2 Status: pm2 status"

echo ""
echo "🛑 Para detener: ./scripts/stop_system.sh"
echo "🔄 Para reiniciar React: pm2 restart react-app"
