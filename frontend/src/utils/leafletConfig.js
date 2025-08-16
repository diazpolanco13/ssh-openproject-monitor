import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Configuración personalizada para diferentes tipos de marcadores
export const createCustomIcon = (color = '#ef4444', type = 'attack') => {
  const svgIcon = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="${color}" stroke="#fff" stroke-width="2" d="M12.5,2 C7.25,2 3,6.25 3,11.5 C3,18.5 12.5,39 12.5,39 S22,18.5 22,11.5 C22,6.25 17.75,2 12.5,2 Z"/>
      <circle fill="#fff" cx="12.5" cy="11.5" r="4"/>
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    iconSize: [25, 41],
    iconAnchor: [12.5, 41],
    popupAnchor: [0, -41],
    className: 'custom-marker'
  });
};

export const attackIcon = createCustomIcon('#ef4444', 'attack');
export const successIcon = createCustomIcon('#22c55e', 'success');
export const warningIcon = createCustomIcon('#f97316', 'warning');

export default L;