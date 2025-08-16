# 🚀 SSH Monitor + OpenProject - ROADMAP COMPLETO

## 📍 **ESTADO ACTUAL DEL PROYECTO** (Agosto 16, 2025)

### ✅ **FASE 1: BACKEND COMPLETADO** 
**🎯 OBJETIVO**: Separar métricas SSH y OpenProject + Implementar nuevas APIs

#### **Backend Python Flask - FUNCIONAL ✅**
- **Archivo**: `ssh_openproject_monitor.py`
- **Puerto**: 8080
- **Estado**: Funcionando completamente

#### **Nuevas Funciones Implementadas ✅**
1. `get_openproject_users_from_db()` - Conecta a PostgreSQL, obtiene usuarios reales
2. `get_openproject_failed_logins()` - Parsea logs de Docker para intentos fallidos
3. `get_openproject_successful_logins()` - Query a BD para logins exitosos (24h)
4. `get_openproject_active_users()` - Analiza logs recientes para usuarios activos
5. `detect_potential_intruders()` - Detecta anomalías de seguridad

#### **APIs REST Nuevas - FUNCIONANDO ✅**
- `/api/summary` - **MEJORADO** con métricas separadas SSH vs OpenProject
- `/api/openproject/failed-logins` - Intentos fallidos OpenProject
- `/api/openproject/successful-logins` - Logins exitosos OpenProject  
- `/api/openproject/active-users` - Usuarios actualmente activos
- `/api/openproject/users-db` - Lista completa de usuarios registrados
- `/api/security/intrusion-detection` - Análisis de seguridad

#### **Métricas Actuales Funcionando ✅**
**SSH Server (últimas 24h):**
- Ataques SSH: 0 (geoblocking funcionando)
- Conexiones exitosas: 41
- Sesiones activas: 0
- IPs bloqueadas: Variable

**OpenProject Application (tiempo real):**
- Total usuarios registrados: 26
- Intentos fallidos (24h): 3
- Logins exitosos (24h): 2  
- Usuarios activos (1h): 3
- Conexiones web activas: 11

### ✅ **COMMITS REALIZADOS**
- Nuevas funciones OpenProject implementadas
- APIs REST funcionando
- Separación clara SSH vs OpenProject
- Documentación actualizada

---

## 🎯 **FASE 2: FRONTEND REACT** (EN PROGRESO)
**🎯 OBJETIVO**: Crear dashboard moderno con React + Tailwind CSS

### **Arquitectura Frontend Propuesta**
```
frontend-react/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── MetricsGrid.jsx        # 8 métricas principales
│   │   │   ├── SSHSection.jsx         # 4 métricas SSH
│   │   │   └── OpenProjectSection.jsx # 4 métricas OpenProject
│   │   ├── Map/
│   │   │   ├── WorldMap.jsx           # Mapa con controles
│   │   │   └── MapControls.jsx        # Toggle atacantes/usuarios
│   │   ├── Activity/
│   │   │   ├── SSHActivity.jsx        # Panel SSH
│   │   │   ├── OpenProjectActivity.jsx # Panel OpenProject
│   │   │   └── ActivityTabs.jsx       # Sistema de tabs
│   │   └── UI/
│   │       ├── StatCard.jsx           # Componente reutilizable
│   │       ├── DataTable.jsx          # Tabla genérica
│   │       └── Badge.jsx              # Badges trusted/untrusted
│   ├── hooks/
│   │   ├── useRealTimeData.js         # Hook para APIs
│   │   └── useWebSocket.js            # Tiempo real (futuro)
│   ├── services/
│   │   └── api.js                     # Cliente HTTP
│   └── App.jsx                        # Aplicación principal
```

### **Métricas Dashboard React**
**Layout Responsive en 2 Secciones:**

#### **🛡️ Sección SSH Server (4 cards)**
1. **Intentos Fallidos SSH** - Últimas 24h
2. **Conexiones Exitosas SSH** - Últimas 24h  
3. **Sesiones Activas SSH** - Tiempo real
4. **IPs Bloqueadas** - Fail2ban + Geoblocking

#### **📊 Sección OpenProject (4 cards)**
1. **Intentos Fallidos OP** - Login failures últimas 24h
2. **Logins Exitosos OP** - Usuarios conectados 24h
3. **Usuarios Activos OP** - Activos ahora (con alerta si > 26)
4. **Total Registrados** - Base de usuarios (26 usuarios)

### **Mapa Mundial Mejorado**
- 🔴 **Toggle Atacantes SSH** - Mostrar/ocultar
- 🟢 **Toggle Usuarios SSH Autorizados** - Mostrar/ocultar
- 🟡 **Toggle Usuarios OpenProject** - Mostrar/ocultar
- **Clustering** para múltiples ataques desde misma región

### **Panel de Actividad Mejorado**
**Dos tabs separados:**
- **SSH Activity**: IP, Usuario Real, País, Estado, Fecha
- **OpenProject Activity**: Nombre Real (no "User 5"), IP, País, Última actividad

---

## 🔧 **ESPECIFICACIONES TÉCNICAS**

### **Backend (Actual - Funcionando)**
- **Framework**: Flask Python 3.12
- **Base de datos**: PostgreSQL (Docker: op_db)
- **GeoIP**: MaxMind GeoLite2-City.mmdb
- **Logs**: journalctl (SSH) + docker logs (OpenProject)

### **Frontend (A Implementar)**
- **Framework**: React 18
- **Styling**: Tailwind CSS 3.3
- **Maps**: React-Leaflet
- **HTTP Client**: Axios
- **Build**: Vite (desarrollo rápido)
- **Puerto**: 3000 (desarrollo)

### **Integración Backend-Frontend**
- **Backend Flask**: Puerto 8080 (APIs)
- **Frontend React**: Puerto 3000 (desarrollo)
- **CORS**: Configurado en Flask para permitir puerto 3000
- **Deploy**: Frontend build servido por Flask (producción)

---

## 📋 **PLAN DE IMPLEMENTACIÓN FRONTEND**

### **Paso 1: Setup Proyecto React (30 min)**
```bash
cd /opt/ssh-monitor
npx create-react-app frontend-react
cd frontend-react
npm install axios tailwindcss react-leaflet recharts framer-motion
npx tailwindcss init
```

### **Paso 2: Componentes Base (1-2 horas)**
1. **StatCard.jsx** - Card de métrica reutilizable
2. **MetricsGrid.jsx** - Grid de 8 métricas (2 secciones)
3. **App.jsx** - Layout principal con polling cada 10s

### **Paso 3: Mapa Interactivo (1 hora)**
1. **WorldMap.jsx** - Integración React-Leaflet
2. **MapControls.jsx** - Toggles para filtros
3. **Clustering** - Agrupar ataques por región

### **Paso 4: Panel de Actividad (1 hora)**
1. **ActivityTabs.jsx** - Sistema de pestañas
2. **DataTable.jsx** - Tabla responsive genérica
3. **SSHActivity.jsx** + **OpenProjectActivity.jsx**

### **Paso 5: Integración y Testing (30 min)**
1. **Conexión con APIs** - Polling automático
2. **Error handling** - Estados de carga/error
3. **Responsive design** - Mobile-first

---

## 🎯 **OBJETIVOS FINALES**

### **Funcionalidades Clave**
✅ **Separación clara**: SSH vs OpenProject  
✅ **Datos reales**: Conexión directa a PostgreSQL  
✅ **Métricas precisas**: Últimas 24h vs tiempo real  
🔄 **Dashboard moderno**: React + Tailwind CSS  
🔄 **Mapas interactivos**: Controles de visibilidad  
🔄 **Responsive design**: Mobile-friendly  

### **Indicadores de Éxito**
- Dashboard responsive funcionando en puerto 3000
- 8 métricas actualizándose cada 10 segundos
- Mapa con controles de filtros funcionando
- Panel de actividad con nombres reales de usuarios
- Build de producción integrado con Flask

### **Criterios de Calidad**
- Tiempo de carga < 2 segundos
- Responsive en móvil/desktop/tablet
- Actualizaciones sin parpadeo
- Error handling robusto
- Código limpio y mantenible

---

## 📁 **ESTRUCTURA FINAL ESPERADA**

```
/opt/ssh-monitor/
├── ssh_openproject_monitor.py     # ✅ Backend Flask (funcionando)
├── frontend-react/               # 🔄 Frontend React (en desarrollo)
│   ├── src/components/          # Componentes React
│   ├── public/                  # Assets estáticos
│   └── dist/                    # Build de producción
├── templates/                   # ❌ Frontend viejo (deprecar)
├── venv/                       # Python virtual environment
├── trusted_ips.json            # Configuración IPs
├── GeoLite2-City.mmdb         # Base datos GeoIP
├── ROADMAP.md                 # 📋 Este archivo
├── README.md                  # Documentación usuario
└── AI_README.md               # Guía para IAs

```

---

## 🚨 **INFORMACIÓN CRÍTICA PARA IA**

### **Estado del Sistema**
- **Backend**: ✅ Funcional en puerto 8080
- **APIs**: ✅ Todas respondiendo correctamente
- **Base de datos**: ✅ PostgreSQL conectada (26 usuarios)
- **Commits**: ✅ Cambios guardados en Git

### **Siguiente Paso Inmediato**
**CREAR FRONTEND REACT** - Toda la lógica de backend está lista y funcionando.

### **Comandos de Verificación Rápida**
```bash
# Verificar backend funcionando
curl -s http://localhost:8080/api/summary

# Verificar PostgreSQL
docker exec op_db psql -U postgres -d openproject -c "SELECT COUNT(*) FROM users WHERE status = 1;"

# Ver logs en tiempo real
cd /opt/ssh-monitor && source venv/bin/activate && python ssh_openproject_monitor.py
```

### **URLs de Desarrollo**
- **Backend APIs**: http://localhost:8080/api/*
- **Dashboard actual**: http://localhost:8080/
- **Frontend React** (futuro): http://localhost:3000/

---

**📅 Fecha de creación**: Agosto 16, 2025  
**🔄 Última actualización**: Agosto 16, 2025  
**👨‍💻 Estado**: Fase 2 en progreso - Frontend React  
**⚡ Prioridad**: Alta - Sistema crítico funcionando, mejorando UX
