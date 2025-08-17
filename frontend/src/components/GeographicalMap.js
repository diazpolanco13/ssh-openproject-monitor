import React, { useEffect, useState } from 'react';
import { RefreshCw, Eye, EyeOff, Shield, AlertTriangle, Users } from 'lucide-react';
import axios from 'axios';

const GeographicalMap = () => {
  const [mapHtml, setMapHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Layer visibility controls
  const [layers, setLayers] = useState({
    trustedIPs: true,      // IP autorizada - siempre visible
    sshAttacks: true,      // Atacantes SSH - visible por defecto
    openProject: false,    // Clientes OpenProject - desactivado por defecto (datos simulados)
    webConnections: true   // Conexiones HTTPS - visible por defecto
  });

  const fetchMapData = async () => {
    try {
      // Pasar las capas activas al backend
      const params = new URLSearchParams();
      Object.entries(layers).forEach(([key, value]) => {
        if (value) params.append('layers', key);
      });
      
      const response = await axios.get(`http://localhost:8080/api/map?${params.toString()}`);
      console.log('Map data received at:', new Date().toLocaleTimeString());
      setMapHtml(response.data.map_html || '');
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMapData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleLayer = (layerKey) => {
    setLayers(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  useEffect(() => {
    fetchMapData();
  }, [layers]); // Re-fetch when layers change

  const layerConfig = {
    trustedIPs: {
      icon: Shield,
      label: 'IP Autorizada',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500',
      description: 'Tu IP confiable con acceso autorizado'
    },
    sshAttacks: {
      icon: AlertTriangle,
      label: 'Atacantes SSH',
      color: 'text-red-500',
      bgColor: 'bg-red-500',
      description: 'Intentos de ataque SSH con tamaño por frecuencia'
    },
    openProject: {
      icon: Users,
      label: 'Clientes OpenProject',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500',
      description: 'Usuarios conectados (datos simulados)',
      isSimulated: true
    },
    webConnections: {
      icon: RefreshCw,
      label: 'Conexiones HTTPS',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500',
      description: 'Conexiones web activas'
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Mapa Geográfico de Conexiones
        </h3>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600 dark:text-gray-400">Cargando mapa...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Mapa Geográfico de Conexiones
        </h3>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-50 transition-colors duration-200"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>
      
      {/* Layer Controls */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Capas del Mapa
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(layerConfig).map(([key, config]) => {
            const Icon = config.icon;
            const isActive = layers[key];
            
            return (
              <button
                key={key}
                onClick={() => toggleLayer(key)}
                className={`flex items-center space-x-3 p-2 rounded-lg border transition-all duration-200 ${
                  isActive 
                    ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600' 
                    : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {isActive ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {config.label}
                    </span>
                    {config.isSimulated && (
                      <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded">
                        Simulado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {config.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Leyenda
        </h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-1">
            <Shield className="h-3 w-3 text-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">IP Autorizada</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Ataques (tamaño = frecuencia)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">OpenProject</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">HTTPS</span>
          </div>
        </div>
      </div>
      
      <div className="h-96 rounded-lg overflow-hidden">
        {mapHtml ? (
          <div 
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: mapHtml }}
          />
        ) : (
          <div className="flex justify-center items-center h-full text-gray-600 dark:text-gray-400">
            No hay datos del mapa disponibles
          </div>
        )}
      </div>
    </div>
  );
};

export default GeographicalMap;