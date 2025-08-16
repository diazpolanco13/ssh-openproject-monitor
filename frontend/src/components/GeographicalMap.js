import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

const GeographicalMap = () => {
  const [geoData, setGeoData] = useState({
    ssh_attacks: [],
    ssh_successful: [],
    openproject_access: [],
    active_ssh: [],
    active_web: []
  });
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
      const response = await axios.get(`${API_BASE}/api/geo-data`);
      setGeoData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching geo data:', err);
      setError('Error al cargar datos geográficos');
    } finally {
      setLoading(false);
    }
  };

  const getMarkerStyle = (type, isTrusted = false, count = 1) => {
    const styles = {
      attack: {
        color: '#dc2626',
        fillColor: '#dc2626',
        radius: Math.min(count * 2, 20),
        fillOpacity: 0.6
      },
      success: {
        color: isTrusted ? '#2563eb' : '#16a34a',
        fillColor: isTrusted ? '#2563eb' : '#16a34a',
        radius: 8,
        fillOpacity: 0.7
      },
      openproject: {
        color: isTrusted ? '#7c3aed' : '#ea580c',
        fillColor: isTrusted ? '#7c3aed' : '#ea580c',
        radius: 6,
        fillOpacity: 0.8
      },
      active_ssh: {
        color: '#2563eb',
        fillColor: '#2563eb',
        radius: 12,
        fillOpacity: 0.9
      },
      active_web: {
        color: '#7c3aed',
        fillColor: '#7c3aed',
        radius: 10,
        fillOpacity: 0.9
      }
    };
    return styles[type] || styles.success;
  };

  const getMarkerIcon = (type, isTrusted = false) => {
    const icons = {
      attack: '🔴',
      success: isTrusted ? '🔵' : '🟢',
      openproject: isTrusted ? '🟣' : '🟠',
      active_ssh: '🔵',
      active_web: '🟣'
    };
    return icons[type] || '📍';
  };

  const renderMarkers = (data, type) => {
    return data.map((item, index) => {
      const style = getMarkerStyle(type, item.is_trusted, item.count);
      const icon = getMarkerIcon(type, item.is_trusted);
      
      return (
        <CircleMarker
          key={`${type}-${index}`}
          center={[item.lat, item.lon]}
          pathOptions={style}
          radius={style.radius}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-semibold mb-1">
                {icon} {type === 'attack' ? 'Ataques SSH' : 
                       type === 'success' ? 'SSH Exitosa' :
                       type === 'openproject' ? 'OpenProject' :
                       type === 'active_ssh' ? 'SSH Activa' :
                       'Conexión Web Activa'}
              </div>
              <div>IP: <span className="font-mono">{item.ip}</span></div>
              {item.count && <div>Total: {item.count}</div>}
              {item.port && <div>Puerto: {item.port}</div>}
              {item.protocol && <div>Protocolo: {item.protocol}</div>}
              {item.is_trusted && <div className="text-blue-600 font-medium">IP Confiable</div>}
            </div>
          </Popup>
        </CircleMarker>
      );
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando mapa...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchGeoData}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Mapa Geográfico de Actividad
        </h2>
        <div className="mt-2 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-1">
            <span>🔴</span>
            <span>Ataques SSH</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>🟢</span>
            <span>SSH Exitosa</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>🟠</span>
            <span>OpenProject</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>🔵</span>
            <span>Conexiones Activas</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>🟣</span>
            <span>IP Confiable</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div style={{ height: '400px', width: '100%' }}>
          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
            className="rounded-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Render all marker types */}
            {renderMarkers(geoData.ssh_attacks, 'attack')}
            {renderMarkers(geoData.ssh_successful, 'success')}
            {renderMarkers(geoData.openproject_access, 'openproject')}
            {renderMarkers(geoData.active_ssh, 'active_ssh')}
            {renderMarkers(geoData.active_web, 'active_web')}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default GeographicalMap;
