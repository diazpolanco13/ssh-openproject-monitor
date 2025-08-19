#!/bin/bash

echo "🔧 GESTIÓN PM2 - SSH MONITOR"
echo "=============================="

case "$1" in
    "status")
        echo "📊 Estado de PM2:"
        pm2 status
        ;;
    "logs")
        echo "📝 Logs del Frontend React:"
        pm2 logs react-app --lines 50
        ;;
    "restart")
        echo "🔄 Reiniciando Frontend React..."
        pm2 restart react-app
        ;;
    "stop")
        echo "⏹️  Deteniendo Frontend React..."
        pm2 stop react-app
        ;;
    "start")
        echo "▶️  Iniciando Frontend React..."
        pm2 start react-app
        ;;
    "monit")
        echo "📱 Abriendo monitor PM2..."
        pm2 monit
        ;;
    *)
        echo "Uso: $0 {status|logs|restart|stop|start|monit}"
        echo ""
        echo "Comandos disponibles:"
        echo "  status  - Ver estado de todas las apps"
        echo "  logs    - Ver logs del frontend"
        echo "  restart - Reiniciar frontend"
        echo "  stop    - Detener frontend"
        echo "  start   - Iniciar frontend"
        echo "  monit   - Monitor visual"
        exit 1
        ;;
esac
