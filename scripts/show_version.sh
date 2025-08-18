#!/bin/bash
# Script para mostrar información completa de SSH Monitor v3.2

echo "🛡️ SSH Monitor Dashboard v3.2"
echo "============================================="
echo ""

echo "📊 ESTADO DEL SISTEMA:"
echo "Versión: v3.2 (Agosto 17, 2025)"
echo "Nombre actualizado: SSH Monitor Dashboard (antes ReactApp)"
echo "Características principales:"
echo "  ✅ Sistema de IPs de respaldo"
echo "  ✅ Iconos mejorados (Crown/Star)"
echo "  ✅ Protección automática fail2ban/UFW"
echo "  ✅ Componentes corregidos"
echo "  ✅ Nombre y favicon personalizados"
echo ""

echo "🔄 IPs AUTORIZADAS:"
cat /opt/ssh-monitor/trusted_ips.json | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    for ip_info in data.get('trusted_ips', []):
        device = ip_info.get('device', 'N/A')
        print(f\"  {ip_info['ip']} - {ip_info['description']} ({device})\")
except Exception as e:
    print(f'  Error leyendo configuración: {e}')
"
echo ""

echo "🔐 ESTADO DE SEGURIDAD:"
echo "Fail2Ban IPs protegidas:"
sudo fail2ban-client get sshd ignoreip | sed 's/^/  /'
echo ""

echo "🔥 FIREWALL (UFW) - Reglas para IPs de respaldo:"
sudo ufw status | grep "190.205.115.82" | sed 's/^/  /'
echo ""

echo "📈 SERVICIOS:"
echo "SSH Monitor:"
systemctl is-active ssh-monitor | sed 's/^/  Estado: /'
echo "Fail2Ban:"
systemctl is-active fail2ban | sed 's/^/  Estado: /'
echo ""

echo "🌐 ENDPOINTS DISPONIBLES:"
echo "  Dashboard: http://45.137.194.210:8080/"
echo "  Frontend React: http://45.137.194.210:3000/ (🛡️ SSH Monitor Dashboard v3.2)"
echo "  API Versión: http://45.137.194.210:8080/api/version"
echo "  API Summary: http://45.137.194.210:8080/api/summary"
echo ""

echo "🎨 CAMBIOS DE INTERFAZ v3.2:"
echo "  Título: 🛡️ SSH Monitor Dashboard v3.2 (actualizado)"
echo "  App Name: ssh-monitor-dashboard (package.json)"
echo "  Manifest: SSH Monitor (short_name)"
echo "  Descripción: Monitoreo en tiempo real actualizada"
echo "  Tema: Colores azules (#1e3c72, #2a5298)"
echo ""

echo "📚 DOCUMENTACIÓN ACTUALIZADA:"
echo "  README.md - Características v3.2"
echo "  SECURITY_SUMMARY.md - Configuración de respaldo"
echo "  EMERGENCY_ACCESS_GUIDE.template.md - Procedimientos actualizados"
echo "  SYSTEM_CONFIG.md - Comandos de verificación v3.2"
echo "  ROADMAP.md - Hoja de ruta completa"
