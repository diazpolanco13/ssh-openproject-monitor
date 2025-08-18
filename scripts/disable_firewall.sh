#!/bin/bash

echo "🔥 DESACTIVANDO SISTEMA DE SEGURIDAD - $(date)"
echo "==============================================="

# Función para mostrar estado
show_status() {
    echo ""
    echo "📊 Estado actual:"
    echo "   - UFW: $(ufw status | head -1)"
    echo "   - Fail2ban: $(systemctl is-active fail2ban)"
    echo "   - iptables rules: $(iptables -L INPUT -n | wc -l) reglas"
}

echo "⚠️  ADVERTENCIA: Esto desactivará TODA la protección del servidor"
echo "   Solo usar en emergencias o mantenimiento"
echo ""

read -p "¿Estás seguro? (escribe 'SI' para continuar): " confirm

if [ "$confirm" != "SI" ]; then
    echo "❌ Operación cancelada"
    exit 1
fi

echo ""
echo "🔧 PASO 1: Desactivando UFW..."
ufw --force disable
echo "✅ UFW desactivado"

echo ""
echo "🛑 PASO 2: Deteniendo Fail2ban..."
systemctl stop fail2ban
systemctl disable fail2ban
echo "✅ Fail2ban detenido y deshabilitado"

echo ""
echo "🔧 PASO 3: Limpiando reglas iptables..."
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X
iptables -t mangle -F
iptables -t mangle -X
iptables -P INPUT ACCEPT
iptables -P FORWARD ACCEPT
iptables -P OUTPUT ACCEPT
echo "✅ Reglas iptables limpiadas"

echo ""
echo "🔧 PASO 4: Desactivando rate limiting..."
# Buscar y detener procesos de rate limiting
pkill -f "rate-limiting-ssh.sh" 2>/dev/null
echo "✅ Rate limiting desactivado"

echo ""
echo "🔧 PASO 5: Desactivando geoblocking..."
# Buscar y detener procesos de geoblocking
pkill -f "advanced-geoblock.sh" 2>/dev/null
echo "✅ Geoblocking desactivado"

show_status

echo ""
echo "🚨 SISTEMA DE SEGURIDAD COMPLETAMENTE DESACTIVADO"
echo "   El servidor está EXPUESTO a ataques"
echo "   Usar ./scripts/enable_firewall.sh para reactivar"
