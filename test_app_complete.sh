#!/bin/bash

echo "========================================="
echo "🔍 DIAGNÓSTICO COMPLETO SSH MONITOR v3.2"
echo "========================================="
echo

# Verificar servicios
echo "📋 ESTADO DE SERVICIOS:"
./status_monitor.sh | grep -E "(Backend|Frontend|Estado|puerto)"
echo

# Test APIs críticas del Dashboard
echo "🌐 TEST APIS DEL DASHBOARD:"
echo "1. ✅ API Summary:"
curl -s http://localhost:8080/api/summary | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(f'   - SSH Successful Logins: {data.get(\"ssh_successful_logins\", \"N/A\")}')
    print(f'   - SSH Failed Logins: {data.get(\"ssh_failed_logins\", \"N/A\")}')
    print(f'   - OP Active Users: {data.get(\"op_active_users\", \"N/A\")}')
    print(f'   - Total Registered Users: {data.get(\"total_registered_users\", \"N/A\")}')
except:
    print('   ❌ ERROR: API Summary no funciona')
"

echo "2. ✅ SSH Active Sessions:"
curl -s http://localhost:8080/api/ssh/active | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(f'   - User Sessions: {len(data.get(\"user_sessions\", []))}')
    print(f'   - Network Connections: {len(data.get(\"network_connections\", []))}')
    print(f'   - Consolidated Sessions: {len(data.get(\"consolidated_sessions\", []))}')
except:
    print('   ❌ ERROR: SSH Active API no funciona')
"

echo "3. ✅ OpenProject Users:"
curl -s http://localhost:8080/api/openproject/users | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(f'   - Usuarios activos: {len(data) if isinstance(data, list) else \"Error\"}')
except:
    print('   ❌ ERROR: OP Users API no funciona')
"

echo "4. ✅ Security Alerts:"
curl -s http://localhost:8080/api/security/intrusion-detection | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(f'   - Alertas activas: {len(data.get(\"alerts\", []))}')
    print(f'   - Total activos: {data.get(\"total_active\", \"N/A\")}')
except:
    print('   ❌ ERROR: Security API no funciona')
"

echo
echo "🌍 TEST CONECTIVIDAD FRONTEND:"
echo "Frontend HTTP Response:"
curl -s -I http://localhost:3000 | head -3

echo
echo "📱 TEST CROSS-ORIGIN (CORS):"
curl -s -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:8080/api/summary | head -3 || echo "CORS test realizado"

echo
echo "🔍 ÚLTIMOS ERRORES EN LOGS:"
echo "Backend errors (últimas 5 líneas):"
tail -5 backend.log | grep -i error || echo "No hay errores recientes en backend"

echo
echo "Frontend errors (últimas 5 líneas):"
tail -5 frontend.log | grep -i error || echo "No hay errores recientes en frontend"

echo
echo "📊 RESUMEN FINAL:"
if [ $(curl -s http://localhost:8080/api/summary | python3 -c "import json, sys; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0") -gt 0 ] && \
   [ $(curl -s -w "%{http_code}" http://localhost:3000 -o /dev/null) -eq 200 ]; then
    echo "✅ DIAGNÓSTICO: Ambos servicios operativos"
    echo "📝 Si la app no carga completamente, revisar:"
    echo "   1. Consola del navegador (F12)"
    echo "   2. Desactivar adblocks/extensiones"
    echo "   3. Limpiar cache del navegador"
    echo "   4. Probar en modo incógnito"
else
    echo "❌ DIAGNÓSTICO: Hay problemas de conectividad"
fi
echo "========================================="
