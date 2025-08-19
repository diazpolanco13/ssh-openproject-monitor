#!/bin/bash

echo "🚀 SISTEMA SSH MONITOR - MENÚ DE ADMINISTRACIÓN"
echo "==============================================="
echo ""
echo "Selecciona una opción:"
echo ""
echo "📊 ESTADO Y MONITOREO:"
echo "   1) Ver estado completo del sistema"
echo "   2) Ver versión del sistema"
echo ""
echo "🔧 GESTIÓN DEL SISTEMA:"
echo "   3) Iniciar sistema completo"
echo "   4) Detener sistema completo"
echo "   5) Reiniciar sistema completo"
echo ""
echo "🎨 GESTIÓN FRONTEND (PM2):"
echo "   6) Estado PM2 del frontend"
echo "   7) Logs del frontend React"
echo "   8) Reiniciar solo frontend"
echo "   9) Monitor PM2 visual"
echo ""
echo "🛡️  GESTIÓN DE SEGURIDAD:"
echo "   10) Desactivar firewall y seguridad"
echo "   11) Reactivar firewall y seguridad"
echo ""
echo "🧪 TESTING Y DESARROLLO:"
echo "   12) Simular ataques SSH (testing)"
echo "   13) Monitorear estado en tiempo real"
echo ""
echo "   0) Salir"
echo ""

read -p "Ingresa tu opción (0-13): " option

case $option in
    1)
        echo "🔍 Ejecutando: Estado completo del sistema..."
        ./scripts/system_status.sh
        ;;
    2)
        echo "📋 Ejecutando: Mostrar versión..."
        ./scripts/show_version.sh
        ;;
    3)
        echo "🚀 Ejecutando: Iniciar sistema completo..."
        ./scripts/start_system.sh
        ;;
    4)
        echo "🛑 Ejecutando: Detener sistema completo..."
        ./scripts/stop_system.sh
        ;;
    5)
        echo "🔄 Ejecutando: Reiniciar sistema completo..."
        ./scripts/stop_system.sh
        sleep 3
        ./scripts/start_system.sh
        ;;
    6)
        echo "📊 Ejecutando: Estado PM2 del frontend..."
        ./scripts/pm2_manage.sh status
        ;;
    7)
        echo "📝 Ejecutando: Logs del frontend React..."
        ./scripts/pm2_manage.sh logs
        ;;
    8)
        echo "🔄 Ejecutando: Reiniciar solo frontend..."
        ./scripts/pm2_manage.sh restart
        ;;
    9)
        echo "📱 Ejecutando: Monitor PM2 visual..."
        ./scripts/pm2_manage.sh monit
        ;;
    10)
        echo "🔥 Ejecutando: Desactivar seguridad..."
        ./scripts/disable_firewall.sh
        ;;
    11)
        echo "🛡️  Ejecutando: Reactivar seguridad..."
        ./scripts/enable_firewall.sh
        ;;
    12)
        echo "🧪 Ejecutando: Simular ataques SSH..."
        ./scripts/simulate_ssh_attacks.sh
        ;;
    13)
        echo "📊 Ejecutando: Monitor en tiempo real..."
        ./scripts/status_monitor.sh
        ;;
    0)
        echo "👋 Saliendo del menú..."
        exit 0
        ;;
    *)
        echo "❌ Opción inválida. Usa números del 0 al 13."
        exit 1
        ;;
esac

echo ""
echo "✅ Operación completada. Presiona Enter para continuar..."
read
