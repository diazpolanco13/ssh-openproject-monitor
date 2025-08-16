import L from 'leaflet';

// Configuración de iconos personalizados para el mapa
export const createCustomIcon = (color, type = 'circle') => {
  const svgIcon = `
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="10" cy="10" r="4" fill="white" opacity="0.8"/>
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-div-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

// Iconos predefinidos por tipo de evento
export const mapIcons = {
  attack: createCustomIcon('#dc2626'), // rojo
  success: createCustomIcon('#16a34a'), // verde
  openproject: createCustomIcon('#2563eb'), // azul
  active: createCustomIcon('#7c3aed'), // púrpura
  trusted: createCustomIcon('#059669'), // verde esmeralda
  failed: createCustomIcon('#ea580c') // naranja
};

// Configuración del mapa base
export const mapConfig = {
  center: [40.4168, -3.7038], // Madrid por defecto
  zoom: 2,
  minZoom: 2,
  maxZoom: 18,
  scrollWheelZoom: true,
  attributionControl: true
};

// Configuración de capas de tiles
export const tileLayerConfig = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19
};

// Configuración de clusters
export const clusterConfig = {
  chunkedLoading: true,
  chunkProgress: (processed, total) => {
    console.log(`Procesando marcadores: ${processed}/${total}`);
  },
  maxClusterRadius: 80,
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true
};

// Estilos CSS para los iconos
export const iconStyles = `
  .custom-div-icon {
    background: transparent;
    border: none;
  }
  
  .leaflet-popup-content-wrapper {
    border-radius: 8px;
  }
  
  .leaflet-popup-content {
    margin: 12px 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  .popup-title {
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 8px;
  }
  
  .popup-info {
    color: #6b7280;
    font-size: 0.875rem;
    line-height: 1.4;
  }
  
  .popup-timestamp {
    color: #9ca3af;
    font-size: 0.75rem;
    margin-top: 6px;
    font-style: italic;
  }
`;
