#!/bin/bash

echo "🛑 DETENIENDO SISTEMA SSH MONITOR - $(date)"
echo "============================================="

# Función para matar proceso por puerto
kill_by_port() {
    local port=$1
    local service=$2
    
    echo "🔍 Buscando proceso en puerto $port ($service)..."
    local pid=$(lsof -t -i:$port 2>/dev/null)
    
    if [ ! -z "$pid" ]; then
        echo "🔄 Deteniendo $service (PID: $pid)..."
        kill -TERM $pid 2>/dev/null
        sleep 2
        
        # Verificar si se detuvo
        if kill -0 $pid 2>/dev/null; then
            echo "⚡ Forzando detención de $service..."
            kill -KILL $pid 2>/dev/null
        fi
        
        echo "✅ $service detenido"
    else
        echo "ℹ️  No hay proceso ejecutándose en puerto $port"
    fi
}

# 1. Detener Frontend React (Puerto 3000)
kill_by_port 3000 "Frontend React"

# 2. Detener Backend Flask (Puerto 8091)
kill_by_port 8091 "Backend Flask"

# 3. Detener Dashboard Flask (Puerto 8080)
kill_by_port 8080 "Dashboard Flask"

# 4. Verificar que no queden procesos
echo ""
echo "🔍 Verificando que no queden procesos..."
sleep 2

if netstat -tulpn | grep -E "(8091|3000|8080)" > /dev/null; then
    echo "⚠️  Aún hay procesos ejecutándose:"
    netstat -tulpn | grep -E "(8091|3000|8080)"
else
    echo "✅ Todos los procesos han sido detenidos"
fi

echo ""
echo "🎯 SISTEMA DETENIDO COMPLETAMENTE"
echo "=================================="
