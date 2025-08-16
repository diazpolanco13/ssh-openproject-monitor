# SSH & OpenProject Monitor Dashboard

Dashboard en tiempo real para monitoreo de seguridad SSH y actividad de usuarios en OpenProject con métricas separadas y análisis profundo.

## Características

### 🔒 Monitoreo SSH Avanzado
- Detección de ataques de fuerza bruta en tiempo real
- Visualización de intentos fallidos por IP con geolocalización
- Mapa geográfico interactivo de origen de ataques
- Gestión de IPs confiables (whitelist automática)
- Monitoreo de sesiones SSH activas
- Estadísticas de conexiones exitosas vs fallidas
- Integración con fail2ban para bloqueo automático

### 👥 Monitoreo OpenProject Completo
- **Usuarios**: Monitoreo de 26+ usuarios en base de datos PostgreSQL
- **Accesos**: Seguimiento de logins exitosos y fallidos
- **Actividad**: Usuarios activos en tiempo real
- **Conexiones**: Monitoreo de conexiones web simultáneas
- **Seguridad**: Detección de intentos de intrusión
- **Base de datos**: Conexión directa a PostgreSQL de OpenProject
- **Logs**: Análisis de 4000+ entradas de logs

### 📊 Dashboard Web Moderno
- **Tiempo real**: Actualización automática cada 10 segundos
- **Métricas separadas**: SSH y OpenProject con APIs independientes
- **Mapas interactivos**: Folium con datos geográficos precisos
- **APIs RESTful**: 10+ endpoints para datos en JSON
- **Visualización avanzada**: Estadísticas detalladas y gráficos
- **Geolocalización**: MaxMind GeoLite2 para ubicación de IPs
- **Responsive**: Diseño adaptable a dispositivos móviles

## Instalación

### Prerrequisitos
```bash
sudo apt update
sudo apt install python3 python3-venv python3-pip
```

### Configuración del entorno
```bash
cd /opt/ssh-monitor
python3 -m venv venv
source venv/bin/activate
pip install flask folium geoip2 requests maxminddb psycopg2-binary
```

### Base de datos GeoIP
```bash
# Descargar GeoLite2-City.mmdb de MaxMind
# Colocar en el directorio del proyecto
wget https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&license_key=YOUR_KEY&suffix=tar.gz
```

### Configuración OpenProject
```bash
# Asegurar que OpenProject está corriendo en Docker
docker ps | grep openproject
# Verificar acceso a PostgreSQL
docker exec op_db psql -U postgres -d openproject -c "SELECT count(*) FROM users;"
```

### Servicio systemd
```bash
sudo cp ssh-monitor.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable ssh-monitor
sudo systemctl start ssh-monitor
```

## Uso

### Acceder al dashboard
```
http://localhost:8080
```

### APIs disponibles

#### SSH Monitoring APIs
- `/api/ssh/attacks` - Ataques SSH detectados con geolocalización
- `/api/ssh/active` - Sesiones SSH activas
- `/api/ssh/successful` - Conexiones SSH exitosas
- `/api/map` - Datos para mapa geográfico

#### OpenProject Monitoring APIs  
- `/api/openproject/users` - Usuarios en base de datos (26+)
- `/api/openproject/access` - Estadísticas de acceso completas
- `/api/openproject/connections` - Conexiones web activas
- `/api/openproject/failed-logins` - Intentos de login fallidos
- `/api/openproject/successful-logins` - Logins exitosos
- `/api/openproject/active-users` - Usuarios activos en tiempo real

#### General APIs
- `/api/summary` - Resumen completo: SSH(attacks, success), OP(failed, success, active)
- `/api/trusted-ips` - IPs confiables en whitelist

### Ejemplo de respuesta API
```json
{
  "ssh_attacks": 0,
  "ssh_successful": 41,
  "openproject_failed": 3,
  "openproject_successful": 2,
  "openproject_active": 3,
  "openproject_users_total": 26,
  "web_connections": 11
}
```

### Logs
```bash
sudo journalctl -u ssh-monitor -f
```

## Configuración

### IPs Confiables
Editar lista en el código o vía API para gestionar whitelist de IPs conocidas.

### Puertos y servicios
Por defecto ejecuta en puerto 8080. Modificar en el archivo principal según necesidades.

## Arquitectura

```
ssh_openproject_monitor.py  # Aplicación principal Flask
├── venv/                   # Entorno virtual Python
├── templates/              # Templates HTML (dashboard actual)
│   ├── dashboard_combined.html # Dashboard principal
│   └── dashboard_*.html    # Versiones anteriores
├── static/                # CSS, JS, recursos estáticos
├── logs/                  # Archivos de log del sistema
├── GeoLite2-City.mmdb     # Base de datos de geolocalización
├── trusted_ips.json       # Lista de IPs confiables
└── ssh-monitor.service    # Configuración systemd
```

### Flujo de datos
```
SSH Logs ──┐
           ├──► Python Flask App ──► APIs REST ──► Dashboard Web
OpenProject DB ──┘                 │
                                   ├──► PostgreSQL Integration
MaxMind GeoIP ─────────────────────┘
```

### Integración OpenProject
- **Docker**: Conecta con contenedor `op_db` de PostgreSQL
- **Base de datos**: Acceso directo a tabla `users` y logs
- **Tiempo real**: Monitoreo continuo de conexiones activas
- **Seguridad**: Detección de patrones de intrusión

## Tecnologías

### Backend
- **Python 3.12**: Lenguaje principal
- **Flask**: Framework web para APIs REST
- **psycopg2**: Conexión a PostgreSQL de OpenProject
- **MaxMind GeoIP2**: Geolocalización de IPs

### Frontend (Actual)
- **HTML5/CSS3**: Dashboard responsive
- **JavaScript**: Actualizaciones en tiempo real
- **Folium**: Mapas interactivos con Leaflet
- **JSON APIs**: Comunicación asíncrona

### Frontend (Próximo - React)
- **React 18**: Componentes modernos
- **Tailwind CSS**: Diseño utility-first
- **TypeScript**: Tipado estático
- **Vite**: Build tool rápido

### Base de datos
- **PostgreSQL**: OpenProject database (Docker)
- **JSON**: Archivos de configuración
- **Logs**: Sistema de archivos rsyslog

### Infraestructura
- **Docker**: OpenProject containerizado
- **systemd**: Gestión de servicios
- **fail2ban**: Bloqueo automático de IPs
- **nginx/Traefik**: Proxy reverso (opcional)

## Contribuir

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Este proyecto está bajo licencia MIT. Ver archivo LICENSE para detalles.

## Soporte

Para reportar bugs o solicitar funcionalidades, crear un issue en GitHub.

---

**Autor**: diazpolanco13  
**Email**: diazpolanco13@gmail.com  
**Versión**: 2.0.0 - Enhanced OpenProject Integration

## Changelog

### v2.0.0 (2025-08-16)
- ✅ Integración completa con base de datos PostgreSQL de OpenProject
- ✅ APIs separadas para SSH y OpenProject monitoring
- ✅ Nuevas métricas: usuarios activos, conexiones web, intentos fallidos
- ✅ Monitoreo en tiempo real de 26+ usuarios
- ✅ Análisis de 4000+ entradas de logs
- ✅ Enhanced API summary con métricas combinadas
- 🔄 Preparación para frontend React + Tailwind CSS

### v1.0.0 (2025-08-14)
- ✅ Dashboard básico SSH monitoring
- ✅ Integración inicial OpenProject
- ✅ Mapas geográficos con Folium
- ✅ APIs REST básicas
