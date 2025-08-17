# SSH & OpenProject Monitor Dashboard - AI Configuration Guide

## 🤖 Para Asistentes de IA: Contexto Completo del Proyecto

### 📋 PROPÓSITO DEL SISTEMA
Este sistema es un **dashboard de monitoreo en tiempo real** que combina:
1. **Seguridad SSH**: Detecta ataques de fuerza bruta, sesiones activas, y geolocaliza IPs atacantes
2. **Monitoreo OpenProject**: Rastrea usuarios conectados y actividad en la instancia OpenProject
3. **Visualización Web**: Dashboard interactivo con mapas geográficos y APIs RESTful

### 🎯 OBJETIVO PRINCIPAL
Monitorear la seguridad del servidor que ejecuta OpenProject, proporcionando visibilidad completa sobre:
- Intentos de acceso SSH maliciosos
- Sesiones SSH legítimas activas  
- Usuarios conectados a OpenProject
- Origen geográfico de ataques
- IPs confiables vs sospechosas

### 🏗️ ARQUITECTURA DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────┐
│                    SERVIDOR UBUNTU                          │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │   OpenProject   │  │   SSH Daemon     │  │  fail2ban   │ │
│  │   (Docker)      │  │   (sshd)         │  │             │ │
│  │   Puerto 80/443 │  │   Puerto 22      │  │             │ │
│  └─────────────────┘  └──────────────────┘  └─────────────┘ │
│           │                      │                   │      │
│           ▼                      ▼                   ▼      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │          SISTEMA DE LOGS (journalctl/rsyslog)          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                   │                          │
│                                   ▼                          │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │         BACKEND FLASK (Puerto 8080)                     │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │ │
│  │  │  SSH Parser │ │ OP Parser   │ │   APIs REST         │ │ │
│  │  │             │ │             │ │                     │ │ │
│  │  │ journalctl  │ │ docker logs │ │  /api/openproject/  │ │ │
│  │  │ | grep sshd │ │ + postgres  │ │     users           │ │ │
│  │  │             │ │             │ │     connections     │ │ │
│  │  └─────────────┘ └─────────────┘ │     users-db        │ │ │
│  │                                  │  /api/map           │ │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │           GeoIP + Folium Maps                       │ │ │
│  │  │         (GeoLite2-City.mmdb)                        │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                   │                          │
│                                   ▼                          │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │         FRONTEND REACT (Puerto 3000)                   │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │ │
│  │  │ Dashboard   │ │ SSH Section │ │ OpenProject Section │ │ │
│  │  │ Component   │ │             │ │                     │ │ │
│  │  │             │ │ - Alerts    │ │ - Users reales      │ │ │
│  │  │ - Stats     │ │ - Sessions  │ │ - IPs y países      │ │ │
│  │  │ - Map (HTML)│ │ - Map data  │ │ - Última conexión   │ │ │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 🔗 ARQUITECTURA HÍBRIDA (Flask + React)
- **Backend**: Python Flask (puerto 8080) - APIs y generación de mapas Folium
- **Frontend**: React (puerto 3000) - Interfaz moderna con componentes especializados
- **Maps**: Folium (Python) genera HTML embebido en React via dangerouslySetInnerHTML
- **Data Flow**: React consume APIs Flask, combina datos de múltiples endpoints
- **Updates**: Intervalos inteligentes (5min alertas SSH, 15min datos OpenProject)

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
- **GET /api/openproject/users**: Usuarios activos con IP, país y actividad
- **GET /api/openproject/users-db**: Usuarios registrados en base de datos
- **GET /api/openproject/connections**: Conexiones web activas a OpenProject
- **GET /api/trusted-ips**: Lista IPs marcadas como confiables
- **GET /api/map**: Mapa HTML combinado con marcadores geográficos
- **GET /**: Dashboard React con interfaz moderna

#### **Datos que Procesa:**
1. **SSH Failed Logins**: Extrae IP, usuario, timestamp de intentos fallidos
2. **SSH Successful Sessions**: Identifica conexiones exitosas activas
3. **OpenProject Active Users**: Combina logs de actividad con datos de usuarios reales
4. **User Connection Details**: IP, país, nombre real, última conexión
5. **Geolocation**: Convierte IPs a coordenadas geográficas con GeoLite2
6. **Trust Status**: Clasifica IPs como confiables/sospechosas
7. **Real-time Updates**: Dashboard con intervalos inteligentes (5min alertas, 15min datos)

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
