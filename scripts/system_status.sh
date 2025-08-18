#!/bin/bash

echo "📊 ESTADO COMPLETO DEL SISTEMA - $(date)"
echo "========================================="

echo ""
echo "🔧 SERVICIOS PRINCIPALES:"
echo "   - Backend Flask (Puerto 8091): $(systemctl is-active ssh-monitor)"
echo "   - UFW Firewall: $(ufw status | head -1)"
echo "   - Fail2ban: $(systemctl is-active fail2ban)"
echo "   - SSH: $(systemctl is-active ssh)"

echo ""
echo "🌐 PUERTOS ACTIVOS:"
netstat -tulpn | grep -E "(8091|3000|8080|22|80)" | while read line; do
    echo "   $line"
done

echo ""
echo "📱 FRONTEND REACT:"
if curl -s http://localhost:3000 > /dev/null; then
    echo "   ✅ Puerto 3000: ACTIVO"
else
    echo "   ❌ Puerto 3000: INACTIVO"
fi

echo ""
echo "🔌 BACKEND API:"
if curl -s http://localhost:8091/api/health > /dev/null; then
    echo "   ✅ Puerto 8091: ACTIVO"
else
    echo "   ❌ Puerto 8091: INACTIVO"
fi

echo ""
echo "🐳 DOCKER CONTAINERS:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(openproject|postgres)"

echo ""
echo "💾 RECURSOS DEL SISTEMA:"
echo "   - CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "   - Memoria: $(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
echo "   - Disco: $(df -h / | awk 'NR==2{print $5}')"

echo ""
echo "📝 LOGS RECIENTES:"
echo "   - SSH (últimas 5 líneas):"
journalctl -u ssh.service --since "5 minutes ago" | grep sshd | tail -5 | while read line; do
    echo "     $line"
done

echo ""
echo "🎯 RESUMEN:"
if systemctl is-active ssh-monitor | grep -q "active"; then
    echo "   🟢 Sistema funcionando correctamente"
else
    echo "   🔴 Sistema con problemas"
fi
