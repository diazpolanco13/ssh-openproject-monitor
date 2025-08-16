# SSH & OpenProject Monitor Dashboard - AI Configuration Guide

## 🤖 Para Asistentes de IA: Contexto Completo del Proyecto v2.0

### 📋 PROPÓSITO DEL SISTEMA
Este sistema es un **dashboard de monitoreo en tiempo real avanzado** que combina:
1. **Seguridad SSH**: Detecta ataques de fuerza bruta, sesiones activas, y geolocaliza IPs atacantes
2. **Monitoreo OpenProject Completo**: Rastrea 26+ usuarios, conexiones activas, base de datos PostgreSQL
3. **Visualización Web Moderna**: Dashboard interactivo con mapas geográficos y 10+ APIs RESTful
4. **Integración Base de Datos**: Conexión directa a PostgreSQL de OpenProject en Docker

### 🎯 OBJETIVO PRINCIPAL
Monitorear la seguridad completa del servidor que ejecuta OpenProject, proporcionando visibilidad total sobre:
- Intentos de acceso SSH maliciosos con geolocalización
- Sesiones SSH legítimas activas en tiempo real
- Usuarios OpenProject: 26 registrados, 3 activos, logins exitosos/fallidos
- Origen geográfico de ataques con MaxMind GeoIP2
- IPs confiables vs sospechosas con whitelist automática
- Conexiones web simultáneas (11+ conexiones típicas)
- Análisis de 4000+ entradas de logs de OpenProject

### 🏗️ ARQUITECTURA DEL SISTEMA v2.0

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SERVIDOR UBUNTU                                │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────┐ ┌──────────┐ │
│  │   OpenProject   │  │   SSH Daemon     │  │  fail2ban   │ │PostgreSQL│ │
│  │   (Docker)      │  │   (sshd)         │  │             │ │  op_db   │ │
│  │   Porto 80/443  │  │   Porto 22       │  │   Active    │ │  Users   │ │
│  └─────────────────┘  └──────────────────┘  └─────────────┘ └──────────┘ │
│           │                      │                   │            │      │
│           ▼                      ▼                   ▼            ▼      │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │              SISTEMA DE LOGS + DATABASE ACCESS                       │ │
│  │  journalctl/rsyslog + docker exec op_db psql commands               │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                   │                                        │
│                                   ▼                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │              ENHANCED DASHBOARD MONITOR (Puerto 8080)                │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────────────────┐ │ │
│  │  │  SSH Parser │ │ OP DB Query │ │        Flask Web App v2.0           │ │ │
│  │  │             │ │             │ │                                     │ │ │
│  │  │ journalctl  │ │ PostgreSQL  │ │  SSH APIs:                          │ │ │
│  │  │ | grep sshd │ │ docker exec │ │    /api/ssh/attacks                 │ │ │
│  │  │ 41 success  │ │ op_db psql  │ │    /api/ssh/active                  │ │ │
│  │  │ 0 attacks   │ │ 26 users    │ │    /api/ssh/successful              │ │ │
│  │  └─────────────┘ └─────────────┘ │                                     │ │ │
│  │                                  │  OpenProject APIs:                  │ │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                GeoIP + Enhanced Analytics                         │ │ │
│  │  │  MaxMind GeoLite2-City.mmdb + Real-time Metrics                   │ │ │
│  │  │  3 failed logins, 2 successful, 3 active users                    │ │ │
│  │  └─────────────────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 📁 ESTRUCTURA DEL PROYECTO

```
/opt/ssh-monitor/
├── ssh_openproject_monitor.py    # 🔥 APLICACIÓN PRINCIPAL
├── ssh-monitor.service           # Configuración systemd
├── trusted_ips.json             # Lista de IPs confiables
├── GeoLite2-City.mmdb           # Base de datos GeoIP (MaxMind)
├── venv/                        # Entorno virtual Python
├── templates/                   # Plantillas HTML del dashboard
│   ├── dashboard.html           # Template principal actual
│   └── [otros templates]        # Versiones de desarrollo
├── README.md                    # Documentación usuario
├── INSTALL.md                   # Guía instalación rápida
├── AI_README.md                 # 📋 ESTE ARCHIVO - Guía para IA
└── app.log                     # Logs de la aplicación
```

### 🔧 CONFIGURACIÓN TÉCNICA DETALLADA

#### **Dependencias Python Críticas:**
```python
flask==2.3.3           # Framework web
folium==0.14.0         # Mapas interactivos  
geoip2==4.7.0          # Geolocalización IPs
requests==2.31.0       # HTTP requests
maxminddb==2.2.0       # Lectura base datos GeoIP
```

#### **Puertos y Servicios:**
- **Dashboard Web**: `http://localhost:8080`
- **OpenProject**: `http://localhost:80` (Docker)
- **SSH**: Puerto `22`
- **Servicio systemd**: `ssh-monitor.service`

#### **Fuentes de Datos:**
1. **SSH Logs**: `journalctl -u ssh.service | grep sshd`
2. **OpenProject Logs**: `docker logs openproject_web_1`
3. **GeoIP**: MaxMind GeoLite2-City database
4. **IPs Confiables**: `trusted_ips.json`

### 🚀 PROCESO DE CONFIGURACIÓN PARA IA

#### **1. Verificar Entorno Actual:**
```bash
# Verificar OpenProject
docker ps | grep openproject
curl -s http://localhost/ | head -5

# Verificar SSH
systemctl status ssh
journalctl -u ssh.service --since "1 hour ago" | grep sshd | head -5

# Verificar Python
python3 --version
which python3
```

#### **2. Configurar Dashboard:**
```bash
cd /opt/ssh-monitor
python3 -m venv venv
source venv/bin/activate
pip install flask folium geoip2 requests maxminddb

# Descargar GeoIP (requiere registro MaxMind)
# wget https://download.maxmind.com/app/geoip_download?...
# O usar base existente si está disponible
```

#### **3. Configurar Servicio:**
```bash
sudo cp ssh-monitor.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable ssh-monitor
sudo systemctl start ssh-monitor
```

#### **4. Validar Funcionamiento:**
```bash
# Verificar servicio
sudo systemctl status ssh-monitor
sudo journalctl -u ssh-monitor -f

# Probar APIs
curl http://localhost:8080/api/attacks
curl http://localhost:8080/api/sessions  
curl http://localhost:8080/api/openproject
curl http://localhost:8080/api/trusted-ips

# Acceder dashboard
curl http://localhost:8080
```

### 🔍 FUNCIONALIDADES ESPECÍFICAS

#### **APIs Disponibles:**
- **GET /api/attacks**: Lista ataques SSH detectados con geolocalización
- **GET /api/sessions**: Sesiones SSH activas actuales
- **GET /api/openproject**: Usuarios conectados a OpenProject  
- **GET /api/trusted-ips**: Lista IPs marcadas como confiables
- **GET /**: Dashboard web principal con mapas

#### **Datos que Procesa:**
1. **SSH Failed Logins**: Extrae IP, usuario, timestamp de intentos fallidos
2. **SSH Successful Sessions**: Identifica conexiones exitosas activas
3. **OpenProject Users**: Parsea logs de Docker para usuarios conectados
4. **Geolocation**: Convierte IPs a coordenadas geográficas
5. **Trust Status**: Clasifica IPs como confiables/sospechosas

### 🐛 DEBUGGING Y TROUBLESHOOTING

#### **Comandos de Diagnóstico:**
```bash
# Logs del dashboard
sudo journalctl -u ssh-monitor -f

# Verificar parsing SSH
journalctl -u ssh.service --since "1 hour ago" | grep "Failed password"

# Verificar OpenProject
docker logs openproject_web_1 --since 1h | grep -i "user\|login"

# Verificar puerto dashboard
netstat -tlnp | grep 8080

# Verificar procesos
ps aux | grep ssh_openproject_monitor
```

#### **Problemas Comunes:**
1. **Dashboard no carga**: Verificar puerto 8080, permisos venv
2. **No muestra ataques**: Verificar logs SSH con journalctl
3. **Sin datos OpenProject**: Verificar nombre contenedor Docker
4. **Sin geolocalización**: Verificar archivo GeoLite2-City.mmdb
5. **Servicio no inicia**: Verificar ruta venv en ssh-monitor.service

### 🔄 CONFIGURACIÓN ESPECÍFICA OPENPROJECT

#### **Identificar Contenedor OpenProject:**
```bash
# Encontrar contenedor correcto
docker ps | grep openproject
docker logs [CONTAINER_NAME] --since 1h | head -10

# Configurar en código si es diferente
# Editar ssh_openproject_monitor.py línea ~200:
# result = subprocess.run(['docker', 'logs', 'NOMBRE_REAL_CONTENEDOR'], ...)
```

#### **Verificar Logs OpenProject:**
```bash
# Ver estructura de logs
docker logs openproject_web_1 --since 1h | grep -E "(user|login|session)" | head -5

# Identificar patrones de usuario
docker logs openproject_web_1 --since 1h | grep -i "started\|session\|user" | head -10
```

### 📊 PERSONALIZACIÓN AVANZADA

#### **Modificar IPs Confiables:**
```json
// trusted_ips.json
{
  "trusted_ips": [
    "TU_IP_VPN",
    "IP_OFICINA", 
    "IP_CASA",
    "127.0.0.1"
  ]
}
```

#### **Ajustar Parsing OpenProject:**
Si los logs de OpenProject tienen formato diferente, modificar función `get_openproject_activity()` en líneas ~190-220 del archivo principal.

### 🎯 OBJETIVO FINAL PARA IA

**Al completar la configuración, deberías tener:**
1. ✅ Dashboard accesible en `http://localhost:8080`
2. ✅ Mapa con puntos rojos (ataques) y verdes (IPs confiables)
3. ✅ APIs devolviendo datos JSON válidos
4. ✅ Servicio systemd ejecutándose automáticamente
5. ✅ Logs mostrando actividad SSH y OpenProject en tiempo real

**Indicadores de éxito:**
- `curl http://localhost:8080/api/attacks` devuelve array con objetos IP/coordenadas
- Dashboard muestra mapa interactivo con marcadores geográficos
- Logs `sudo journalctl -u ssh-monitor -f` muestran actividad sin errores

### 📝 NOTAS IMPORTANTES PARA IA

1. **Siempre verificar OpenProject primero**: El objetivo es monitorear una instancia OpenProject específica
2. **Adaptable**: Si OpenProject está en otro puerto/configuración, ajustar URLs y comandos Docker
3. **Logs variables**: Patrones de logs SSH pueden variar según distribución Ubuntu
4. **GeoIP requerido**: Sin base de datos GeoIP, mapas no funcionarán
5. **Permisos críticos**: Dashboard necesita acceso a journalctl y docker logs

**Este README permite a cualquier IA entender completamente el contexto, propósito, y configuración técnica necesaria para replicar o mantener este sistema de monitoreo.**
