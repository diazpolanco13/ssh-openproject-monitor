import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import axios from 'axios';

const GeographicalMap = () => {
  const [mapHtml, setMapHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMapData = async () => {
    try {
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://45.137.194.210:8091/api/map'
        : `http://${window.location.hostname}:8091/api/map`;
      const response = await axios.get(apiUrl);
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

  useEffect(() => {
    fetchMapData();
    // Sin auto-actualización - solo carga inicial. Los datos geográficos son estables.
  }, []);

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
        
        <div className="flex items-center space-x-4">
          {/* Botón de actualizar */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-50 transition-colors duration-200"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
          
          {/* Leyenda de iconos */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">SSH Confiable</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">SSH Exitoso</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">OpenProject</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">HTTPS</span>
            </div>
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