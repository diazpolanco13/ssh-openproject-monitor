import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Map, Globe, AlertTriangle } from 'lucide-react';
import axios from 'axios';
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

  useEffect(() => {
    fetchGeoData();
    const interval = setInterval(fetchGeoData, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  const fetchGeoData = async () => {
    try {
      // Usar el nuevo endpoint geo-data
      const response = await axios.get(`${API_BASE}/api/geo-data`);
      
      if (Array.isArray(response.data)) {
        setGeoData(response.data);
      } else {
        setGeoData([]);
      }
    } catch (err) {
      console.warn('Geo data not available, using mock data:', err);
      // Usar datos de ejemplo para demostrar funcionalidad
      setGeoData([
        {
          lat: 40.4168,
          lon: -3.7038,
          country: 'España',
          city: 'Madrid',
          attacks: 5,
          type: 'ssh_attack',
          color: 'red',
          description: 'Ataque SSH desde Madrid'
        },
        {
          lat: 48.8566,
          lon: 2.3522,
          country: 'Francia',
          city: 'París',
          attacks: 3,
          type: 'ssh_success',
          color: 'green',
          description: 'SSH Exitosa desde París'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (type, attacks) => {
    if (type === 'attack') {
      return attacks > 10 ? '#ef4444' : attacks > 5 ? '#f97316' : '#eab308';
    }
    return '#22c55e'; // Verde para accesos exitosos
  };

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
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Ataques críticos</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">Ataques moderados</span>
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
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold mb-1">
                        {location.city}, {location.country}
                      </div>
                      <div className="text-gray-600 mb-1">
                        IP: {location.ip}
                      </div>
                      <div className="text-gray-600">
                        {location.description}
                      </div>
                      {location.count > 1 && (
                        <div className="text-xs text-blue-600 mt-1">
                          Eventos: {location.count}
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
              <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No hay datos geográficos disponibles</p>
              <p className="text-sm text-gray-500">
                Los datos del mapa se mostrarán aquí cuando haya actividad de ataques SSH
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeographicalMap;