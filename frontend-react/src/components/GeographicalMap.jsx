import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import axios from 'axios';

const GeographicalMap = () => {
  const [mapHtml, setMapHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados para filtros de tipos de conexión
  const [filters, setFilters] = useState({
    sshAttacks: true,    // Ataques SSH (rojo) ⭐ NUEVO
    sshSuccessful: true, // SSH Exitoso (verde + azul para admin)  
    openProject: true,   // OpenProject (naranja)
    https: true          // HTTPS (morado)
  });

  const fetchMapData = async () => {
    try {
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://45.137.194.210:8091/api/map'
        : `http://${window.location.hostname}:8091/api/map`;
      
      // Construir parámetros de filtro para la API
      const filterParams = new URLSearchParams();
      if (!filters.sshAttacks) filterParams.append('hide', 'ssh_attacks');
      if (!filters.sshSuccessful) filterParams.append('hide', 'ssh_successful');
      if (!filters.openProject) filterParams.append('hide', 'openproject');
      if (!filters.https) filterParams.append('hide', 'https');
      
      const finalUrl = filterParams.toString() ? `${apiUrl}?${filterParams}` : apiUrl;
      
      const response = await axios.get(finalUrl);
      console.log('Map data received at:', new Date().toLocaleTimeString(), 'with filters:', filters);
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

  // Función para toggle de filtros
  const toggleFilter = (filterKey) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  useEffect(() => {
    fetchMapData();
    // Sin auto-actualización - solo carga inicial. Los datos geográficos son estables.
  }, []);

  // Recargar mapa cuando cambien los filtros
  useEffect(() => {
    if (!loading) { // Solo si ya cargó la primera vez
      fetchMapData();
    }
  }, [filters]);

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
      <div className="flex flex-col space-y-3 mb-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Mapa Geográfico de Conexiones
        </h3>
        
        <div className="flex items-center justify-between sm:space-x-4">
          {/* Botón de actualizar */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-50 transition-colors duration-200"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          
          {/* Filtros interactivos - responsive */}
          <div className="flex items-center space-x-2 sm:space-x-4 text-sm">
            {/* Ataques SSH */}
            <button
              onClick={() => toggleFilter('sshAttacks')}
              className={`flex items-center space-x-2 px-2 sm:px-3 py-1 rounded-full transition-all duration-200 ${
                filters.sshAttacks 
                  ? 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600' 
                  : 'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 opacity-50'
              }`}
              title="Ataques SSH"
            >
              <div className={`w-3 h-3 rounded-full ${filters.sshAttacks ? 'bg-red-500' : 'bg-gray-400'}`}></div>
              <span className={`hidden sm:inline ${filters.sshAttacks ? 'text-red-700 dark:text-red-300' : 'text-gray-500 dark:text-gray-400'}`}>
                Ataques SSH
              </span>
            </button>

            {/* SSH Exitoso */}
            <button
              onClick={() => toggleFilter('sshSuccessful')}
              className={`flex items-center space-x-2 px-2 sm:px-3 py-1 rounded-full transition-all duration-200 ${
                filters.sshSuccessful 
                  ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-600' 
                  : 'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 opacity-50'
              }`}
              title="SSH Exitoso"
            >
              <div className={`w-3 h-3 rounded-full ${filters.sshSuccessful ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className={`hidden sm:inline ${filters.sshSuccessful ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}`}>
                SSH Exitoso
              </span>
            </button>

            {/* OpenProject */}
            <button
              onClick={() => toggleFilter('openProject')}
              className={`flex items-center space-x-2 px-2 sm:px-3 py-1 rounded-full transition-all duration-200 ${
                filters.openProject 
                  ? 'bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-600' 
                  : 'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 opacity-50'
              }`}
              title="OpenProject"
            >
              <div className={`w-3 h-3 rounded-full ${filters.openProject ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
              <span className={`hidden sm:inline ${filters.openProject ? 'text-orange-700 dark:text-orange-300' : 'text-gray-500 dark:text-gray-400'}`}>
                OpenProject
              </span>
            </button>

            {/* HTTPS */}
            <button
              onClick={() => toggleFilter('https')}
              className={`flex items-center space-x-2 px-2 sm:px-3 py-1 rounded-full transition-all duration-200 ${
                filters.https 
                  ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-600' 
                  : 'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 opacity-50'
              }`}
              title="HTTPS"
            >
              <div className={`w-3 h-3 rounded-full ${filters.https ? 'bg-purple-500' : 'bg-gray-400'}`}></div>
              <span className={`hidden sm:inline ${filters.https ? 'text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400'}`}>
                HTTPS
              </span>
            </button>
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