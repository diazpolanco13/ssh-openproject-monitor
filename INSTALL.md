# Guía de Instalación Rápida

## 1. Clonar repositorio
```bash
git clone <tu-repositorio-url>
cd ssh-openproject-monitor
```

## 2. Configurar entorno
```bash
python3 -m venv venv
source venv/bin/activate
pip install flask folium geoip2 requests maxminddb
```

## 3. Descargar base de datos GeoIP
- Registrarse en MaxMind (gratuito)
- Descargar GeoLite2-City.mmdb
- Colocar en el directorio del proyecto

## 4. Configurar servicio
```bash
sudo cp ssh-monitor.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable ssh-monitor
sudo systemctl start ssh-monitor
```

## 5. Verificar funcionamiento
```bash
# Verificar servicio
sudo systemctl status ssh-monitor

# Verificar logs
sudo journalctl -u ssh-monitor -f

# Acceder dashboard
curl http://localhost:8080
```

## 6. Configuración de firewall (opcional)
```bash
sudo ufw allow 8080
```

## Troubleshooting
- Revisar logs: `sudo journalctl -u ssh-monitor`
- Verificar puerto: `netstat -tlnp | grep 8080`
- Validar permisos: archivo debe ser ejecutable
