# 🎨 SAE Design System - Guía de Estilo y Branding

**Sala de Análisis Estratégico (SAE) Dashboard**  
*"La verdad no debe estar dispersa"*

---

## 📋 Índice

1. [🎯 Identidad de Marca](#-identidad-de-marca)
2. [🎨 Paleta de Colores](#-paleta-de-colores)
3. [🖼️ Componentes](#️-componentes)
4. [🌟 Efectos y Transiciones](#-efectos-y-transiciones)
5. [📱 Responsive Design](#-responsive-design)
6. [🔄 Estados Interactivos](#-estados-interactivos)
7. [📏 Spacing y Typography](#-spacing-y-typography)

---

## 🎯 Identidad de Marca

### **Logo y Assets**
- **Logo**: `/favicon.png` - Escudo dorado con alas sobre fondo rojo circular
- **Nombre**: SAE Dashboard
- **Subtitle**: Análisis Estratégico
- **Slogan**: "La verdad no debe estar dispersa"
- **Organización**: Sala de Análisis Estratégico (SAE)

### **Personalidad de Marca**
- **Profesional**: Nivel empresarial y corporativo
- **Confiable**: Información crítica de seguridad
- **Elegante**: Efectos visuales sofisticados
- **Eficiente**: Auto-actualización y feedback inmediato

---

## 🎨 Paleta de Colores

### **🔴 Rojos - Alertas y Peligro**
```css
/* Principales */
--sae-red-50: rgb(254, 242, 242);     /* bg-red-50 */
--sae-red-400: rgb(248, 113, 113);    /* text-red-400 */
--sae-red-500: rgb(239, 68, 68);      /* bg-red-500 */
--sae-red-600: rgb(220, 38, 38);      /* text-red-600 */
--sae-red-700: rgb(185, 28, 28);      /* text-red-700 */
--sae-red-900: rgb(127, 29, 29);      /* text-red-900 */

/* Dark Mode */
--sae-red-300: rgb(252, 165, 165);    /* dark:text-red-300 */
--sae-red-400-dark: rgb(248, 113, 113); /* dark:text-red-400 */
--sae-red-600-dark: rgb(220, 38, 38);   /* dark:border-red-600 */
--sae-red-900-alpha: rgba(127, 29, 29, 0.2); /* dark:bg-red-900/20 */
```

**Uso**: Ataques SSH, errores, logins fallidos, alertas críticas

### **🟢 Verdes - Éxito y Seguridad**
```css
/* Principales */
--sae-green-50: rgb(240, 253, 244);   /* bg-green-50 */
--sae-green-400: rgb(74, 222, 128);   /* bg-green-400 */
--sae-green-500: rgb(34, 197, 94);    /* bg-green-500 */
--sae-green-600: rgb(22, 163, 74);    /* text-green-600 */
--sae-green-700: rgb(21, 128, 61);    /* text-green-700 */
--sae-green-900: rgb(20, 83, 45);     /* text-green-900 */

/* Dark Mode */
--sae-green-300: rgb(134, 239, 172);  /* dark:text-green-300 */
--sae-green-400-dark: rgb(74, 222, 128); /* dark:text-green-400 */
--sae-green-600-dark: rgb(22, 163, 74);  /* dark:border-green-600 */
--sae-green-900-alpha: rgba(20, 83, 45, 0.2); /* dark:bg-green-900/20 */
```

**Uso**: SSH exitosos, usuarios conectados, estado "En línea", confirmaciones

### **🔵 Azules - Primario y Información**
```css
/* Principales - Indigo/Blue Corporate */
--sae-blue-50: rgb(239, 246, 255);    /* bg-blue-50 */
--sae-blue-300: rgb(147, 197, 253);   /* ring-blue-300 */
--sae-blue-400: rgb(96, 165, 250);    /* text-blue-400 */
--sae-blue-500: rgb(59, 130, 246);    /* bg-blue-500 */
--sae-blue-600: rgb(37, 99, 235);     /* text-blue-600 */
--sae-blue-700: rgb(29, 78, 216);     /* border-blue-700 */
--sae-blue-900: rgb(30, 58, 138);     /* text-blue-900 */

/* Scrollbar Gradients */
--sae-indigo-500: rgb(99, 102, 241);  /* #6366f1 */
--sae-indigo-600: rgb(79, 70, 229);   /* #4f46e5 */
--sae-indigo-700: rgb(67, 56, 202);   /* #4338ca */
--sae-indigo-800: rgb(55, 48, 163);   /* #3730a3 */

/* Dark Mode */
--sae-blue-300-dark: rgb(147, 197, 253); /* dark:text-blue-300 */
--sae-blue-400-dark: rgb(96, 165, 250);  /* dark:text-blue-400 */
--sae-blue-500-dark: rgb(59, 130, 246);  /* dark:ring-blue-500 */
--sae-blue-900-alpha: rgba(30, 58, 138, 0.2); /* dark:bg-blue-900/20 */
```

**Uso**: OpenProject, usuarios, efectos de actualización, scrollbars, primario

### **🟣 Púrpuras - Usuarios Activos**
```css
/* Principales */
--sae-purple-50: rgb(250, 245, 255);  /* bg-purple-50 */
--sae-purple-500: rgb(168, 85, 247);  /* bg-purple-500 */
--sae-purple-600: rgb(147, 51, 234);  /* text-purple-600 */
--sae-purple-700: rgb(126, 34, 206);  /* text-purple-700 */
--sae-purple-900: rgb(88, 28, 135);   /* text-purple-900 */

/* Dark Mode */
--sae-purple-300: rgb(196, 181, 253); /* dark:text-purple-300 */
--sae-purple-600-dark: rgb(147, 51, 234); /* dark:border-purple-600 */
--sae-purple-900-alpha: rgba(88, 28, 135, 0.2); /* dark:bg-purple-900/20 */
```

**Uso**: Usuarios activos, conexiones HTTPS, métricas especiales

### **🟠 Naranjas - Proyectos y Neutral**
```css
/* Principales */
--sae-orange-100: rgb(255, 237, 213); /* bg-orange-100 */
--sae-orange-300: rgb(253, 186, 116); /* border-orange-300 */
--sae-orange-500: rgb(249, 115, 22);  /* bg-orange-500 */
--sae-orange-600: rgb(234, 88, 12);   /* text-orange-600 */
--sae-orange-700: rgb(194, 65, 12);   /* text-orange-700 */

/* Dark Mode */
--sae-orange-300-dark: rgb(253, 186, 116); /* dark:text-orange-300 */
--sae-orange-600-dark: rgb(234, 88, 12);   /* dark:border-orange-600 */
--sae-orange-900-alpha: rgba(154, 52, 18, 0.3); /* dark:bg-orange-900/30 */
```

**Uso**: Filtros OpenProject, estados neutrales

### **⚫ Grises - Base y Estructura**
```css
/* Light Mode */
--sae-gray-50: rgb(249, 250, 251);    /* bg-gray-50 */
--sae-gray-100: rgb(243, 244, 246);   /* bg-gray-100 */
--sae-gray-200: rgb(229, 231, 235);   /* border-gray-200 */
--sae-gray-400: rgb(156, 163, 175);   /* bg-gray-400 */
--sae-gray-500: rgb(107, 114, 128);   /* text-gray-500 */
--sae-gray-600: rgb(75, 85, 99);      /* text-gray-600 */
--sae-gray-700: rgb(55, 65, 81);      /* bg-gray-700 */
--sae-gray-800: rgb(31, 41, 55);      /* bg-gray-800 */
--sae-gray-900: rgb(17, 24, 39);      /* text-gray-900 */

/* Dark Mode */
--sae-gray-200-dark: rgb(229, 231, 235); /* dark:hover:text-gray-200 */
--sae-gray-300-dark: rgb(209, 213, 219); /* dark:text-gray-300 */
--sae-gray-400-dark: rgb(156, 163, 175); /* dark:text-gray-400 */
--sae-gray-500-dark: rgb(107, 114, 128); /* dark:border-gray-500 */
--sae-gray-600-dark: rgb(75, 85, 99);    /* dark:bg-gray-600 */
--sae-gray-700-dark: rgb(55, 65, 81);    /* dark:bg-gray-700 */
--sae-gray-800-dark: rgb(31, 41, 55);    /* dark:bg-gray-800 */
--sae-white-dark: rgb(255, 255, 255);    /* dark:text-white */
```

**Uso**: Fondos, bordes, texto secundario, estructuras base

### **🟡 Amarillos - Advertencias**
```css
/* Principales */
--sae-yellow-100: rgb(254, 249, 195); /* bg-yellow-100 */
--sae-yellow-500: rgb(234, 179, 8);   /* bg-yellow-500 */
--sae-yellow-800: rgb(133, 77, 14);   /* bg-yellow-800 */

/* Dark Mode */
--sae-yellow-800-alpha: rgba(133, 77, 14, 0.3); /* dark:bg-yellow-800/30 */
```

**Uso**: Actividad reciente, advertencias suaves

---

## 🖼️ Componentes

### **📊 MetricCard**
```css
/* Contenedor */
.metric-card {
  @apply rounded-lg shadow-sm hover:shadow-md;
  @apply border transition-shadow;
  @apply p-4 sm:p-6;
}

/* Layout interno */
.metric-content {
  @apply flex items-start justify-between;
}

.metric-text {
  @apply min-w-0 flex-1 pr-3;
}

.metric-icon {
  @apply p-2 sm:p-3 rounded-full flex-shrink-0;
}
```

### **🛡️ SSH Section**
```css
/* Contenedor principal */
.ssh-section {
  @apply bg-white dark:bg-gray-800;
  @apply rounded-lg shadow-sm;
  @apply border border-gray-200 dark:border-gray-700;
  @apply transition-all duration-500;
}

/* Estado de actualización */
.ssh-section.refreshing {
  @apply ring-2 ring-blue-300 dark:ring-blue-500;
}

/* Header */
.ssh-header {
  @apply px-6 py-4;
  @apply border-b border-gray-200 dark:border-gray-700;
}
```

### **🗺️ Geographical Map**
```css
.geo-map {
  @apply bg-white dark:bg-gray-800;
  @apply rounded-lg shadow-lg p-6;
  @apply transition-all duration-500;
}

.geo-map.refreshing {
  @apply ring-2 ring-blue-300 dark:ring-blue-500;
}

/* Filtros */
.geo-filter {
  @apply flex items-center space-x-2;
  @apply px-2 sm:px-3 py-1 rounded-full;
  @apply transition-all duration-200;
}

.geo-filter.active {
  @apply border;
}

.geo-filter.inactive {
  @apply opacity-50;
}
```

### **🏢 OpenProject Section**
```css
/* Estadísticas */
.op-stat-card {
  @apply rounded-lg p-4;
  @apply border transition-colors duration-200;
}

.op-stat-card.blue {
  @apply bg-blue-50 dark:bg-blue-900/20;
  @apply border-blue-200 dark:border-blue-700/50;
}

.op-stat-card.green {
  @apply bg-green-50 dark:bg-green-900/20;
  @apply border-green-200 dark:border-green-700/50;
}

.op-stat-card.red {
  @apply bg-red-50 dark:bg-red-900/20;
  @apply border-red-200 dark:border-red-700/50;
}

/* Lista de usuarios */
.op-user-list {
  @apply bg-gray-50 dark:bg-gray-700;
  @apply rounded-lg p-4 max-h-96 overflow-y-auto;
  @apply transition-colors duration-200;
  @apply scrollbar-thick;
}

.op-user-item {
  @apply py-3 px-4 rounded border;
  @apply bg-white dark:bg-gray-600;
  @apply border-gray-200 dark:border-gray-500;
  @apply transition-colors duration-200;
}
```

### **📱 Header**
```css
.sae-header {
  @apply bg-white dark:bg-gray-800;
  @apply shadow-sm border-b;
  @apply border-gray-200 dark:border-gray-700;
  @apply transition-colors duration-200;
}

.sae-logo {
  @apply h-10 w-10 sm:h-8 sm:w-8;
  @apply rounded-full shadow-sm flex-shrink-0;
}

.sae-title {
  @apply text-lg sm:text-xl font-bold;
  @apply text-gray-900 dark:text-white truncate;
}

.sae-subtitle {
  @apply text-xs sm:text-sm font-medium;
  @apply text-red-600 dark:text-red-400 truncate;
}

.status-indicator {
  @apply h-3 w-3 bg-green-400 rounded-full;
  @apply animate-pulse flex-shrink-0;
}
```

### **👣 Footer**
```css
.sae-footer {
  @apply bg-white dark:bg-gray-800;
  @apply shadow-inner border-t;
  @apply border-gray-200 dark:border-gray-700;
  @apply mt-8 py-6 transition-colors duration-200;
}

.footer-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-6;
}

.footer-section {
  @apply flex flex-col items-center md:items-start;
}

.footer-motto {
  @apply font-medium italic;
  @apply text-xs text-gray-500 dark:text-gray-400;
}
```

---

## 🌟 Efectos y Transiciones

### **🔄 Efectos de Actualización**
```css
/* Ring de actualización */
.refresh-ring {
  @apply ring-2 ring-blue-300 dark:ring-blue-500;
  @apply transition-all duration-500;
}

/* Indicador visual */
.refresh-indicator {
  @apply flex items-center space-x-2;
}

.refresh-dot {
  @apply w-2 h-2 bg-blue-500 rounded-full animate-pulse;
}

.refresh-text {
  @apply text-xs text-blue-600 dark:text-blue-400 font-medium;
}

/* Botón de refresh */
.refresh-button {
  @apply flex items-center space-x-2 px-3 py-2;
  @apply text-sm text-gray-600 dark:text-gray-400;
  @apply hover:text-gray-900 dark:hover:text-gray-200;
  @apply disabled:opacity-50 transition-colors duration-200;
}

.refresh-icon {
  @apply h-4 w-4;
}

.refresh-icon.spinning {
  @apply animate-spin;
}
```

### **🎨 Scrollbar Elegante**
```css
/* Desktop */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(156, 163, 175, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #6366f1, #4f46e5);
  border-radius: 4px;
  border: 1px solid rgba(99, 102, 241, 0.2);
  transition: all 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #4f46e5, #4338ca);
  border-color: rgba(79, 70, 229, 0.4);
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.3);
}

/* Dark Mode */
.dark ::-webkit-scrollbar-track {
  background: rgba(75, 85, 99, 0.2);
}

.dark ::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #60a5fa, #3b82f6);
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #3b82f6, #2563eb);
  box-shadow: 0 0 8px rgba(96, 165, 250, 0.4);
}
```

### **💫 Transiciones Base**
```css
/* Duración estándar */
.transition-fast { transition-duration: 200ms; }
.transition-normal { transition-duration: 300ms; }
.transition-slow { transition-duration: 500ms; }

/* Efectos comunes */
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.hover-scale:hover {
  transform: scale(1.05);
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### **🔄 Animaciones de Estado**
```css
/* Pulse para elementos activos */
.pulse-green {
  @apply animate-pulse bg-green-400;
}

.pulse-blue {
  @apply animate-pulse bg-blue-500;
}

/* Spin para refresh */
.spin-smooth {
  animation: spin 1s linear infinite;
}

/* Aparición de scrollbar */
@keyframes scrollbar-appear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

::-webkit-scrollbar-thumb {
  animation: scrollbar-appear 0.3s ease-out;
}
```

---

## 📱 Responsive Design

### **🖥️ Breakpoints**
```css
/* Tailwind CSS Breakpoints */
sm: 640px   /* Tablet pequeña */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Desktop grande */
2xl: 1536px /* Desktop extra grande */
```

### **📐 Grid Responsivo**
```css
/* Métricas principales */
.metrics-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}

/* Secciones principales */
.main-sections {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-8;
}

/* Footer */
.footer-sections {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8;
}
```

### **📱 Texto Responsivo**
```css
/* Headers */
.h1-responsive { @apply text-lg sm:text-xl; }
.h2-responsive { @apply text-base sm:text-lg; }
.h3-responsive { @apply text-sm sm:text-base; }

/* Body text */
.text-responsive { @apply text-xs sm:text-sm; }
.text-large-responsive { @apply text-sm sm:text-base; }

/* Truncation */
.text-truncate { @apply truncate min-w-0; }
```

### **📐 Spacing Responsivo**
```css
/* Padding */
.p-responsive { @apply p-4 sm:p-6; }
.px-responsive { @apply px-2 sm:px-3; }
.py-responsive { @apply py-3 sm:py-4; }

/* Margins */
.space-responsive { @apply space-x-2 sm:space-x-4; }
.gap-responsive { @apply gap-2 sm:gap-4 lg:gap-6; }

/* Flex direction */
.flex-responsive { @apply flex-col sm:flex-row; }
```

### **👀 Visibility Control**
```css
/* Ocultar en móvil */
.hide-mobile { @apply hidden sm:inline; }
.hide-mobile-block { @apply hidden sm:block; }

/* Mostrar solo en móvil */
.show-mobile { @apply sm:hidden; }

/* Responsive flex */
.flex-shrink-safe { @apply flex-shrink-0; }
.min-width-safe { @apply min-w-0; }
```

### **📏 Scrollbar Responsivo**
```css
/* Desktop - scrollbar delgado */
@media (min-width: 768px) {
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
}

/* Mobile - scrollbar más grueso */
@media (max-width: 767px) {
  ::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }
  
  .scrollbar-thick::-webkit-scrollbar {
    width: 20px;
    height: 20px;
  }
}
```

---

## 🔄 Estados Interactivos

### **🖱️ Hover States**
```css
/* Botones */
.btn-hover {
  @apply hover:bg-blue-700 dark:hover:bg-blue-600;
  @apply transition-colors duration-200;
}

/* Cards */
.card-hover {
  @apply hover:shadow-md hover:shadow-blue-100;
  @apply dark:hover:shadow-blue-900/20;
  @apply transition-shadow duration-200;
}

/* Texto */
.text-hover {
  @apply hover:text-gray-900 dark:hover:text-gray-200;
  @apply transition-colors duration-200;
}

/* Scrollbar hover */
.scrollbar-hover::-webkit-scrollbar-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.3);
}
```

### **👆 Active States**
```css
.btn-active:active {
  @apply bg-blue-800 dark:bg-blue-700;
  @apply scale-95;
}

.card-active:active {
  @apply scale-98;
}
```

### **🎯 Focus States**
```css
.focus-ring {
  @apply focus:outline-none focus:ring-2;
  @apply focus:ring-blue-500 focus:ring-offset-2;
  @apply dark:focus:ring-offset-gray-800;
}
```

### **❌ Disabled States**
```css
.btn-disabled {
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply disabled:hover:bg-gray-400;
}
```

### **✅ Loading States**
```css
.loading-spinner {
  @apply animate-spin h-4 w-4;
}

.loading-pulse {
  @apply animate-pulse bg-gray-300 dark:bg-gray-600;
}

.loading-shimmer {
  background: linear-gradient(90deg, 
    rgba(255,255,255,0) 0%, 
    rgba(255,255,255,0.2) 20%, 
    rgba(255,255,255,0.5) 60%, 
    rgba(255,255,255,0)
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

---

## 📏 Spacing y Typography

### **📐 Spacing Scale**
```css
/* Tailwind spacing scale usada */
0.5 → 2px    /* Bordes finos */
1   → 4px    /* Espacios pequeños */
2   → 8px    /* Espacios normales */
3   → 12px   /* Espacios medianos */
4   → 16px   /* Espacios grandes */
6   → 24px   /* Padding componentes */
8   → 32px   /* Margins secciones */
```

### **📝 Typography Scale**
```css
/* Font sizes responsivos */
.text-xs    { font-size: 0.75rem; }  /* 12px */
.text-sm    { font-size: 0.875rem; } /* 14px */
.text-base  { font-size: 1rem; }     /* 16px */
.text-lg    { font-size: 1.125rem; } /* 18px */
.text-xl    { font-size: 1.25rem; }  /* 20px */
.text-2xl   { font-size: 1.5rem; }   /* 24px */
.text-3xl   { font-size: 1.875rem; } /* 30px */

/* Font weights */
.font-medium   { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold     { font-weight: 700; }
```

### **📏 Border Radius**
```css
.rounded-sm  { border-radius: 0.125rem; } /* 2px */
.rounded     { border-radius: 0.25rem; }  /* 4px */
.rounded-md  { border-radius: 0.375rem; } /* 6px */
.rounded-lg  { border-radius: 0.5rem; }   /* 8px */
.rounded-xl  { border-radius: 0.75rem; }  /* 12px */
.rounded-full { border-radius: 9999px; }
```

### **🎭 Shadows**
```css
.shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
.shadow    { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); }
.shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }

/* Shadows específicos SAE */
.shadow-blue { box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15); }
.shadow-red  { box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15); }
```

---

## 🎯 Implementación

### **📦 Archivos CSS**
```
frontend-react/src/styles/
├── scrollbar.css          # Scrollbars personalizados
└── index.css              # Tailwind + customizaciones
```

### **🎨 Clases Utilitarias SAE**
```css
/* Scrollbar variants */
.scrollbar-mini    /* 4px scrollbar */
.scrollbar-thick   /* 16px desktop, 20px mobile */

/* Estado de actualización */
.refreshing { @apply ring-2 ring-blue-300 dark:ring-blue-500; }

/* Responsive helpers */
.hide-mobile { @apply hidden sm:inline; }
.show-mobile { @apply sm:hidden; }
.text-truncate-safe { @apply truncate min-w-0 flex-shrink-0; }
```

### **🚀 Uso en Componentes**
```jsx
// Ejemplo de implementación
<div className={`
  bg-white dark:bg-gray-800 
  rounded-lg shadow-sm 
  border border-gray-200 dark:border-gray-700 
  transition-all duration-500 
  ${refreshing ? 'ring-2 ring-blue-300 dark:ring-blue-500' : ''}
`}>
  {/* Contenido */}
</div>
```

---

## 📋 Checklist de Implementación

### **✅ Colores**
- [ ] Usar paleta SAE definida
- [ ] Implementar dark/light mode
- [ ] Aplicar colores semánticos (rojo=peligro, verde=éxito, etc.)

### **✅ Componentes**
- [ ] Header con logo SAE y estado
- [ ] MetricCards con iconos y colores
- [ ] Efectos de actualización elegantes
- [ ] Scrollbars personalizados
- [ ] Footer corporativo

### **✅ Responsive**
- [ ] Mobile-first approach
- [ ] Texto truncado en móvil
- [ ] Spacing responsivo
- [ ] Visibility controls

### **✅ Interactividad**
- [ ] Hover effects suaves
- [ ] Loading states claros
- [ ] Focus accessibility
- [ ] Transiciones de 200-500ms

### **✅ Branding**
- [ ] Logo SAE visible
- [ ] Colores corporativos
- [ ] Slogan en footer
- [ ] Consistencia visual

---

**🎨 Esta guía garantiza la consistencia visual y la identidad corporativa SAE en todos los proyectos futuros.**

*Última actualización: Agosto 2025 - v3.1*
