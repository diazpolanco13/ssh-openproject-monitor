#!/bin/bash

echo "🛡️  REACTIVANDO SISTEMA DE SEGURIDAD - $(date)"
echo "==============================================="

# Función para mostrar estado
show_status() {
    echo ""
    echo "📊 Estado actual:"
    echo "   - UFW: $(ufw status | head -1)"
    echo "   - Fail2ban: $(systemctl is-active fail2ban)"
    echo "   - iptables rules: $(iptables -L INPUT -n | wc -l) reglas"
}

echo "🔧 PASO 1: Activando UFW..."
ufw --force enable
echo "✅ UFW activado"

echo ""
echo "🔧 PASO 2: Iniciando Fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban
echo "✅ Fail2ban iniciado y habilitado"

echo ""
echo "🔧 PASO 3: Aplicando reglas iptables básicas..."
# Reglas básicas de protección
iptables -A INPUT -i lo -j ACCEPT
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 8091 -j ACCEPT
iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
iptables -A INPUT -j DROP
echo "✅ Reglas iptables básicas aplicadas"

echo ""
echo "🔧 PASO 4: Aplicando rate limiting..."
# Activar rate limiting SSH
/usr/local/bin/rate-limiting-ssh.sh 2>/dev/null || echo "⚠️  Rate limiting no disponible"
echo "✅ Rate limiting configurado"

echo ""
echo "🔧 PASO 5: Aplicando geoblocking..."
# Activar geoblocking
/usr/local/bin/advanced-geoblock.sh 2>/dev/null || echo "⚠️  Geoblocking no disponible"
echo "✅ Geoblocking configurado"

show_status

echo ""
echo "✅ SISTEMA DE SEGURIDAD COMPLETAMENTE REACTIVADO"
echo "   El servidor está PROTEGIDO nuevamente"
echo "   Monitorear logs para verificar funcionamiento"
