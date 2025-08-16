import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Map, Globe, AlertTriangle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const GeographicalMap = () => {
  const [geoData, setGeoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = 'http://localhost:8080';

  console.log('GeographicalMap component mounted');

  useEffect(() => {
    console.log('useEffect triggered - fetching geo data');
    fetchGeoData();
    const interval = setInterval(fetchGeoData, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  const fetchGeoData = async () => {
    console.log('=== STARTING fetchGeoData ===');
    console.log('API_BASE:', API_BASE);
    console.log('Full URL:', `${API_BASE}/api/geo-data`);
    
    try {
      console.log('Making fetch request...');
      const response = await fetch(`${API_BASE}/api/geo-data`);
      
      console.log('Response received!');
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      console.log('Data type:', typeof data);
      console.log('Is array:', Array.isArray(data));
      
      if (Array.isArray(data)) {
        console.log('Setting geo data - array length:', data.length);
        setGeoData(data);
        setError(null);
        console.log('Geo data set successfully');
      } else {
        console.warn('Expected array but got:', typeof data);
        setGeoData([]);
      }
    } catch (err) {
      console.error('=== ERROR in fetchGeoData ===');
      console.error('Error object:', err);
      console.error('Error message:', err.message);
      setError(`Error al cargar datos geográficos: ${err.message}`);
      setGeoData([]);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
      console.log('=== END fetchGeoData ===');
    }
  };

  const getMarkerColor = (type, count) => {
    switch (type) {
      case 'ssh_success':
        return '#22c55e'; // Verde para SSH exitosos
      case 'ssh_attack':
        return count > 10 ? '#ef4444' : count > 5 ? '#f97316' : '#eab308';
      case 'openproject':
        return '#3b82f6'; // Azul para OpenProject
      default:
        return '#6b7280'; // Gris por defecto
    }
  };

  const createCustomIcon = (type, count) => {
    const color = getMarkerColor(type, count);
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${count > 999 ? '999+' : count}</div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10]
    });
  };

  console.log('=== RENDER STATE ===');
  console.log('Loading:', loading);
  console.log('Error:', error);
  console.log('GeoData length:', geoData.length);
  console.log('GeoData:', geoData);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Distribución Geográfica de Ataques
            </h2>
          </div>
        </div>
        <div className="p-6 h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando mapa...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Distribución Geográfica de Ataques
            </h2>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">SSH Exitosos</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">SSH Ataques</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">OpenProject</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {geoData.length > 0 ? (
          <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
            <MapContainer
              center={[40.4168, -3.7038]} // Centrado en España
              zoom={4}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {geoData.map((location, index) => (
                <Marker
                  key={index}
                  position={[location.lat, location.lon]}
                  icon={createCustomIcon(location.type, location.count || 1)}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold mb-1">
                        {location.city || 'Unknown'}, {location.country}
                      </div>
                      <div className="text-gray-600 mb-1">
                        IP: {location.ip}
                      </div>
                      <div className="text-gray-600 mb-1">
                        Tipo: {location.type === 'ssh_success' ? 'SSH Exitoso' : 
                               location.type === 'ssh_attack' ? 'SSH Ataque' : 
                               location.type === 'openproject' ? 'OpenProject' : location.type}
                      </div>
                      <div className="text-gray-600 mb-1">
                        {location.description}
                      </div>
                      {location.count > 1 && (
                        <div className="text-xs text-blue-600 mt-1">
                          Total eventos: {location.count}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              {error ? (
                <>
                  <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600 mb-2">Error al cargar datos del mapa</p>
                  <p className="text-sm text-gray-500 mb-4">{error}</p>
                  <button 
                    onClick={fetchGeoData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Reintentar
                  </button>
                </>
              ) : (
                <>
                  <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No hay datos geográficos disponibles</p>
                  <p className="text-sm text-gray-500">
                    Los datos del mapa se mostrarán aquí cuando haya actividad
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeographicalMap;