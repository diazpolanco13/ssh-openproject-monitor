# Frontend React - SSH + OpenProject Monitor

Dashboard moderno en React para el sistema de monitoreo SSH + OpenProject.

## 🚀 Inicio Rápido

### Desarrollo
```bash
cd /opt/ssh-monitor/frontend
npm install
npm start
# Abre http://localhost:3000
```

### Producción
```bash
npm run build
# Archivos en ./build/ listos para despliegue
```

## 🏗️ Arquitectura

### Componentes Principales
- **Dashboard.js** - Layout principal y gestión de estado
- **OpenProjectSection.js** - Monitoreo usuarios OpenProject (⭐ componente estrella)
- **SSHSection.js** - Ataques y conexiones SSH
- **GeographicalMap.js** - Mapas geográficos con Leaflet
- **SecurityAlerts.js** - Alertas de seguridad en tiempo real

### Flujo de Datos
```
Dashboard.js (estado central)
    ↓
APIs Backend (http://localhost:8080)
    ↓
Componentes (props)
    ↓
UI (React + Tailwind)
```

## 🔧 Configuración

### Variables de Entorno (.env)
```bash
REACT_APP_API_URL=http://localhost:8080
GENERATE_SOURCEMAP=false
```

### Dependencias Principales
- **React 18** - Framework principal
- **Tailwind CSS** - Estilos utilitarios
- **Lucide React** - Iconografía
- **Leaflet** - Mapas interactivos

## 📱 Características UI/UX

### Responsive Design
- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)  
- ✅ Mobile (320px - 767px)

### Temas y Colores
- **Primary**: Azul (#1A67A3)
- **Success**: Verde (#1F883D)
- **Warning**: Amarillo (#FFB020)
- **Danger**: Rojo (#DA3633)
- **Neutral**: Grises diversos

### Actualización Automática
- Fetch datos cada 5 minutos
- Indicadores visuales de carga
- Manejo de errores graceful

## 🔍 OpenProjectSection.js - Detalles Técnicos

### Funcionalidades Avanzadas
```javascript
// Filtrado de usuarios fantasmas
const realUsers = data.activeConnections.filter(conn => 
  data.users.find(user => user.id === conn.user_id)
);

// Ordenamiento inteligente
.sort((a, b) => {
  if (a.isActive && !b.isActive) return -1;
  return b.lastActivity - a.lastActivity;
});
```

### Estados de Usuario
- **🟢 Conectado** - Activo en los últimos minutos
- **🟡 Actividad Reciente** - Último login < 24 horas
- **⚫ Inactivo** - Sin actividad reciente

## 🛠️ Scripts Disponibles

### `npm start`
Servidor de desarrollo con hot reload en puerto 3000.

### `npm run build`
Build optimizado para producción con minificación.

### `npm test`
Ejecuta tests unitarios con Jest.

### `npm run eject`
⚠️ **Irreversible** - Expone configuración de Webpack.

## 📦 Estructura de Archivos

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/          # Componentes React
│   │   ├── Dashboard.js     # 🏠 Principal
│   │   ├── OpenProjectSection.js # ⭐ OpenProject
│   │   ├── SSHSection.js    # 🔒 SSH
│   │   ├── GeographicalMap.js # 🗺️ Mapas
│   │   └── ...
│   ├── utils/
│   │   └── leafletConfig.js # ⚙️ Config mapas
│   ├── App.js              # 🚀 App principal
│   ├── App.css             # 🎨 Estilos globales
│   └── index.js            # 📍 Entry point
├── build/                  # 📦 Build producción
├── package.json            # 📋 Dependencias
└── tailwind.config.js      # 🎨 Config Tailwind
```

## 🔗 Integración Backend

### APIs Consumidas
```javascript
// Datos OpenProject
const response = await fetch('/api/openproject/users');
const users = await response.json();

// Datos SSH
const sshData = await fetch('/api/ssh/attacks');
```

### Manejo de Errores
```javascript
try {
  const data = await fetchData();
  setData(data);
} catch (error) {
  console.error('Error fetching data:', error);
  setError('Failed to load data');
}
```

## 🚀 Despliegue

### Build Estático
```bash
npm run build
# Copiar ./build/ al servidor web
```

### Con Nginx
```nginx
server {
    listen 3000;
    root /opt/ssh-monitor/frontend/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8080;
    }
}
```

## 🐛 Troubleshooting

### Build falla
```bash
# Limpiar cache
rm -rf node_modules package-lock.json
npm install
```

### APIs no responden
```bash
# Verificar backend
curl http://localhost:8080/api/openproject/users
# Verificar CORS en navegador
```

### Estilos rotos
```bash
# Verificar Tailwind
npm run build
# Verificar importaciones CSS
```

---

**Nota**: Este frontend está optimizado para trabajar con el backend Flask en puerto 8080. Asegúrate de que el backend esté corriendo antes de iniciar el frontend.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
