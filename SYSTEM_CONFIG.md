# Configuración Actual del Sistema - Snapshot para IA

## 🖥️ ESTADO ACTUAL DEL SERVIDOR

### Información del Sistema
```bash
# OS: Ubuntu Linux
# Usuario: root
# Directorio del proyecto: /opt/ssh-monitor
# Puerto OpenProject: 80 (Docker)
# Puerto Dashboard: 8080
# Puerto SSH: 22
```

### OpenProject Actual
```bash
# Verificar contenedor OpenProject:
docker ps | grep openproject

# Logs OpenProject disponibles en:
docker logs openproject_web_1 --since 1h

# URL OpenProject:
http://localhost/
```

### SSH y Logs
```bash
# SSH logs disponibles via:
journalctl -u ssh.service | grep sshd

# fail2ban instalado y activo:
sudo systemctl status fail2ban
```

### Dashboard Monitor Funcionando
```bash
# Servicio systemd activo:
sudo systemctl status ssh-monitor

# APIs funcionando:
curl http://localhost:8080/api/attacks
curl http://localhost:8080/api/sessions
curl http://localhost:8080/api/openproject
curl http://localhost:8080/api/trusted-ips

# Dashboard web:
curl http://localhost:8080
```

## 📋 ARCHIVOS CLAVE ACTUALES

### ssh_openproject_monitor.py (APLICACIÓN PRINCIPAL)
- ✅ Parsea logs SSH correctamente
- ✅ Integra con contenedor OpenProject
- ✅ GeoIP funcionando con GeoLite2-City.mmdb
- ✅ APIs RESTful operativas
- ✅ Dashboard web renderiza mapas

### ssh-monitor.service (SYSTEMD)
```ini
[Unit]
Description=SSH and OpenProject Monitor Dashboard
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/ssh-monitor
ExecStart=/opt/ssh-monitor/venv/bin/python /opt/ssh-monitor/ssh_openproject_monitor.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### trusted_ips.json (IPS CONFIABLES)
```json
{
  "trusted_ips": [
    "127.0.0.1",
    "::1"
  ]
}
```

## 🔧 CONFIGURACIÓN PYTHON

### Entorno Virtual Configurado
```bash
# Ruta: /opt/ssh-monitor/venv
# Python: 3.x
# Paquetes instalados:
pip list
# flask==2.3.3
# folium==0.14.0  
# geoip2==4.7.0
# requests==2.31.0
# maxminddb==2.2.0
```

### Base de Datos GeoIP
```bash
# Archivo: /opt/ssh-monitor/GeoLite2-City.mmdb
# Tamaño: ~60MB
# Fuente: MaxMind GeoLite2
# Estado: ✅ Funcional para geolocalización
```

## 🎯 COMANDOS DE VALIDACIÓN PARA IA

### Verificar Estado Completo
```bash
# 1. Verificar OpenProject
docker ps | grep openproject
curl -s http://localhost/ | head -5

# 2. Verificar Dashboard
sudo systemctl status ssh-monitor
curl -s http://localhost:8080/api/attacks | head -5

# 3. Verificar SSH logs
journalctl -u ssh.service --since "10 minutes ago" | grep sshd | tail -5

# 4. Verificar estructura archivos
ls -la /opt/ssh-monitor/
ls -la /opt/ssh-monitor/venv/bin/
ls -la /opt/ssh-monitor/templates/

# 5. Verificar permisos
ls -la /opt/ssh-monitor/ssh_openproject_monitor.py
stat /opt/ssh-monitor/GeoLite2-City.mmdb
```

### Comandos de Diagnóstico
```bash
# Logs en tiempo real
sudo journalctl -u ssh-monitor -f

# Verificar puerto
netstat -tlnp | grep 8080

# Verificar proceso
ps aux | grep ssh_openproject_monitor

# Test rápido APIs
for endpoint in attacks sessions openproject trusted-ips; do
  echo "=== /api/$endpoint ==="
  curl -s "http://localhost:8080/api/$endpoint" | head -3
  echo -e "\n"
done
```

## 🔄 PASOS DE REPLICACIÓN EXACTA

### 1. Preparar Entorno
```bash
mkdir -p /opt/ssh-monitor
cd /opt/ssh-monitor
```

### 2. Clonar o Copiar Archivos
```bash
# Si tienes acceso a este repositorio:
git clone [URL_REPOSITORIO] .

# O copiar archivos manualmente:
# - ssh_openproject_monitor.py
# - ssh-monitor.service  
# - trusted_ips.json
# - templates/
# - GeoLite2-City.mmdb (descargar de MaxMind)
```

### 3. Configurar Python
```bash
python3 -m venv venv
source venv/bin/activate
pip install flask folium geoip2 requests maxminddb
```

### 4. Configurar Servicio
```bash
sudo cp ssh-monitor.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable ssh-monitor
sudo systemctl start ssh-monitor
```

### 5. Validar Todo
```bash
# Verificar servicio
sudo systemctl status ssh-monitor

# Verificar APIs
curl http://localhost:8080/api/attacks

# Verificar dashboard
curl http://localhost:8080
```

## 🚨 PUNTOS CRÍTICOS PARA IA

### Dependencias del Sistema
1. **Docker debe estar ejecutando OpenProject**
2. **SSH debe estar activo y logueando**
3. **journalctl debe tener permisos de lectura**
4. **Puerto 8080 debe estar libre**
5. **GeoLite2-City.mmdb debe existir y ser legible**

### Adaptaciones Necesarias
- **Nombre contenedor OpenProject**: Verificar con `docker ps`
- **Logs SSH**: Pueden estar en diferentes unidades systemd
- **IPs confiables**: Actualizar trusted_ips.json según entorno
- **Permisos**: Usuario que ejecuta debe poder leer logs

### Indicadores de Éxito
- ✅ `systemctl status ssh-monitor` muestra "active (running)"
- ✅ `curl localhost:8080` devuelve HTML del dashboard
- ✅ `/api/attacks` devuelve JSON con datos de IPs
- ✅ Dashboard muestra mapa con marcadores geográficos

**Con esta configuración, cualquier IA puede replicar exactamente el mismo sistema de monitoreo SSH/OpenProject funcionando en este servidor.**
