#!/bin/bash

echo "📊 MONITOR EN TIEMPO REAL - SSH MONITOR SYSTEM"
echo "=============================================="
echo "Presiona Ctrl+C para salir"
echo ""

# Función para mostrar estado
show_realtime_status() {
    clear
    echo "📊 MONITOR EN TIEMPO REAL - $(date)"
    echo "=============================================="
    
    # Estado de servicios
    echo "🔧 SERVICIOS:"
    if netstat -tulpn | grep -q ":8091"; then
        echo "   ✅ Backend Flask (8091): ACTIVO"
    else
        echo "   ❌ Backend Flask (8091): INACTIVO"
    fi
    
    if netstat -tulpn | grep -q ":3000"; then
        echo "   ✅ Frontend React (3000): ACTIVO"
    else
        echo "   ❌ Frontend React (3000): INACTIVO"
    fi
    
    # Estado PM2
    echo ""
    echo "🎨 ESTADO PM2:"
    if command -v pm2 &> /dev/null; then
        pm2 status 2>/dev/null || echo "   No hay procesos PM2 ejecutándose"
    else
        echo "   PM2 no instalado"
    fi
    
    # Recursos del sistema
    echo ""
    echo "💾 RECURSOS DEL SISTEMA:"
    local cpu=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    local memory=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')
    local disk=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    echo "   - CPU: ${cpu}%"
    echo "   - Memoria: ${memory}%"
    echo "   - Disco: ${disk}%"
    
    # Conexiones activas
    echo ""
    echo "🌐 CONEXIONES ACTIVAS:"
    local connections=$(netstat -tulpn | grep -E "(8091|3000)" | wc -l)
    echo "   - Puertos monitoreados: $connections conexiones activas"
    
    # Últimos logs SSH
    echo ""
    echo "📝 ÚLTIMOS LOGS SSH (últimas 3 líneas):"
    journalctl -u ssh -n 3 --no-pager 2>/dev/null | tail -3 | sed 's/^/     /' || echo "     No se pueden obtener logs SSH"
    
    echo ""
    echo "🔄 Actualizando cada 5 segundos... (Ctrl+C para salir)"
}

# Trap para manejar Ctrl+C
trap 'echo -e "\n👋 Monitor detenido."; exit 0' INT

# Loop principal
while true; do
    show_realtime_status
    sleep 5
done
