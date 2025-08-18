#!/bin/bash

# SSH OpenProject Monitor - Status Script
# Verifica el estado de los servicios

echo "📊 Estado de SSH OpenProject Monitor v3.2"
echo "=============================================="

# Verificar procesos
echo ""
echo "🔍 Procesos activos:"
BACKEND_PROC=$(ps aux | grep "ssh_openproject_monitor.py" | grep -v grep | wc -l)
FRONTEND_PROC=$(ps aux | grep "serve -s build" | grep -v grep | wc -l)

if [ $BACKEND_PROC -gt 0 ]; then
    echo "   ✅ Backend: Corriendo"
    ps aux | grep "ssh_openproject_monitor.py" | grep -v grep | awk '{print "      PID: "$2", CPU: "$3"%, MEM: "$4"%"}'
else
    echo "   ❌ Backend: Detenido"
fi

if [ $FRONTEND_PROC -gt 0 ]; then
    echo "   ✅ Frontend: Corriendo"
    ps aux | grep "serve -s build" | grep -v grep | awk '{print "      PID: "$2", CPU: "$3"%, MEM: "$4"%"}'
else
    echo "   ❌ Frontend: Detenido"
fi

# Verificar puertos
echo ""
echo "🌐 Puertos en uso:"
BACKEND_PORT=$(netstat -tlnp 2>/dev/null | grep ":8080" | wc -l)
FRONTEND_PORT=$(netstat -tlnp 2>/dev/null | grep ":3000" | wc -l)

if [ $BACKEND_PORT -gt 0 ]; then
    echo "   ✅ Puerto 8080: Activo (Backend)"
else
    echo "   ❌ Puerto 8080: Inactivo"
fi

if [ $FRONTEND_PORT -gt 0 ]; then
    echo "   ✅ Puerto 3000: Activo (Frontend)"
else
    echo "   ❌ Puerto 3000: Inactivo"
fi

# Verificar conectividad
echo ""
echo "🔗 Conectividad:"

# Test Backend
if curl -s http://localhost:8080/api/version > /dev/null 2>&1; then
    echo "   ✅ Backend API: Responde correctamente"
    VERSION=$(curl -s http://localhost:8080/api/version | python3 -c "import json, sys; print(json.load(sys.stdin)['version'])" 2>/dev/null)
    echo "      Versión: $VERSION"
else
    echo "   ❌ Backend API: No responde"
fi

# Test Frontend
if curl -s http://localhost:3000/ > /dev/null 2>&1; then
    echo "   ✅ Frontend: Responde correctamente"
    TITLE=$(curl -s http://localhost:3000/ | grep -o '<title>.*</title>' | sed 's/<[^>]*>//g')
    echo "      Título: $TITLE"
else
    echo "   ❌ Frontend: No responde"
fi

# URLs de acceso
echo ""
echo "🌐 URLs de acceso:"
echo "   - Frontend: http://45.137.194.210:3000/"
echo "   - Backend:  http://45.137.194.210:8080/"
echo "   - API Info: http://45.137.194.210:8080/api/version"

# Información adicional
echo ""
echo "📋 Comandos útiles:"
echo "   - Iniciar:  /opt/ssh-monitor/start_monitor.sh"
echo "   - Detener:  /opt/ssh-monitor/stop_monitor.sh"
echo "   - Estado:   /opt/ssh-monitor/status_monitor.sh"
echo "   - Logs:     tail -f /opt/ssh-monitor/backend.log"
echo "              tail -f /opt/ssh-monitor/frontend.log"
