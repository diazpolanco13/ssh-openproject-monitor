import React, { useEffect, useState } from 'react';
import axios from 'axios';

const GeographicalMap = () => {
  const [mapHtml, setMapHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/map');
        console.log('Map data received');
        setMapHtml(response.data.map_html || '');
      } catch (error) {
        console.error('Error fetching map data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
    // Actualizar cada 5 minutos en lugar de 10 segundos
    const interval = setInterval(fetchMapData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Mapa Geográfico de Conexiones
        </h3>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Cargando mapa...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Mapa Geográfico de Conexiones
        </h3>
        
        {/* Leyenda de iconos */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">SSH Confiable</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">SSH Exitoso</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-600">OpenProject</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600">HTTPS</span>
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
          <div className="flex justify-center items-center h-full text-gray-600">
            No hay datos del mapa disponibles
          </div>
        )}
      </div>
    </div>
  );
};

export default GeographicalMap;