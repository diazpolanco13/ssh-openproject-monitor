# SSH & OpenProject Monitor Dashboard

Dashboard en tiempo real para monitoreo de seguridad SSH y actividad de usuarios en OpenProject.

## Características

### 🔒 Monitoreo SSH
- Detección de ataques de fuerza bruta
- Visualización de intentos fallidos por IP
- Mapa geográfico de origen de ataques
- Gestión de IPs confiables (whitelist)
- Monitoreo de sesiones activas

### 👥 Monitoreo OpenProject
- Seguimiento de usuarios conectados
- Historial de actividad por usuario
- Integración con logs del sistema

### 📊 Dashboard Web
- Interfaz en tiempo real
- Mapas interactivos con Folium
- APIs RESTful para datos en JSON
- Visualización de estadísticas
- Geolocalización de IPs

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
pip install flask folium geoip2 requests maxminddb
```

### Base de datos GeoIP
```bash
# Descargar GeoLite2-City.mmdb de MaxMind
# Colocar en el directorio del proyecto
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
- `/api/attacks` - Ataques SSH detectados
- `/api/sessions` - Sesiones SSH activas
- `/api/openproject` - Actividad OpenProject
- `/api/trusted-ips` - IPs confiables

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
ssh_openproject_monitor.py  # Aplicación principal
├── venv/                   # Entorno virtual Python
├── templates/              # Templates HTML
├── static/                # CSS, JS, recursos
└── logs/                  # Archivos de log
```

## Tecnologías

- **Backend**: Python 3, Flask
- **Frontend**: HTML5, CSS3, JavaScript
- **Mapas**: Folium (Leaflet)
- **GeoIP**: MaxMind GeoLite2
- **Servicios**: systemd
- **Logs**: journalctl, rsyslog

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
**Versión**: 1.0.0
