import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Activity, 
  HardDrive, 
  MemoryStick,
  Shield,
  Database,
  Clock,
  Network
} from 'lucide-react';

const MetricCard = ({ title, value, unit = '', status = 'normal', icon: Icon }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'warning': return 'text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'critical': return 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-600 bg-red-50 dark:bg-red-900/20';
      case 'good': return 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-600 bg-green-50 dark:bg-green-900/20';
      default: return 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className={`p-4 border rounded-lg transition-all duration-500 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
          <p className="text-2xl font-bold transition-all duration-300">
            {value}<span className="text-lg font-normal ml-1">{unit}</span>
          </p>
        </div>
        <div className="text-3xl transition-colors duration-300">
          {Icon && <Icon className="w-8 h-8" />}
        </div>
      </div>
    </div>
  );
};

const ServerStatusSectionCompact = ({ onRefresh }) => {
  const [serverData, setServerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchServerStatus = async (isInitialLoad = false) => {
    try {
      // Solo mostrar loading en la carga inicial
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setIsUpdating(true);
      }
      
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://45.137.194.210:8091/api/server/status'
        : `http://${window.location.hostname}:8091/api/server/status`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setServerData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching server status:', err);
      setError(`Error conectando con el servidor: ${err.message}`);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        // Pequeño delay para mostrar la transición suave
        setTimeout(() => setIsUpdating(false), 500);
      }
    }
  };

  useEffect(() => {
    fetchServerStatus(true); // Carga inicial con loading
    const interval = setInterval(() => fetchServerStatus(false), 300000); // Actualizaciones cada 5 minutos
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors duration-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!serverData) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors duration-200">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Error al cargar datos del servidor
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-all duration-500 ${isUpdating ? 'ring-2 ring-blue-300 dark:ring-blue-500' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Estado del Servidor</h2>
          {isUpdating && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Actualizando...</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Tiempo activo: {serverData.uptime}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Actualizado: {serverData.lastUpdate}</div>
        </div>
      </div>

      {/* Top Grid - Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Uso de CPU"
          value={serverData.metrics.cpu.value}
          unit="%"
          status={serverData.metrics.cpu.status}
          icon={Activity}
        />
        <MetricCard
          title="Uso de Memoria"
          value={serverData.metrics.memory.value}
          unit="%"
          status={serverData.metrics.memory.status}
          icon={MemoryStick}
        />
        <MetricCard
          title="Uso de Disco"
          value={serverData.metrics.disk.value}
          unit="%"
          status={serverData.metrics.disk.status}
          icon={HardDrive}
        />
        <MetricCard
          title="Carga Promedio"
          value={serverData.metrics.load.value}
          unit=""
          status={serverData.metrics.load.status}
          icon={Server}
        />
      </div>

      {/* Bottom Grid - Compact Security and System Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security Services - Más compacto */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition-colors duration-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">Servicios de Seguridad</h3>
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              {serverData.security.active}/{serverData.security.total}
            </span>
          </div>
          <div className="space-y-2">
            {serverData.security.services.map((service) => (
              <div key={service.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    service.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{service.name}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{service.info}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Última actualización Ubuntu:</span>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{serverData.security.lastUpdate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Information - Más compacto */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition-colors duration-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">Información del Sistema</h3>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {serverData.system.docker.running}/{serverData.system.docker.total}
            </span>
          </div>
          <div className="space-y-2">
            {serverData.system.docker.containers.map((container) => (
              <div key={container.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    container.status === 'running' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{container.name}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{container.status}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Última verificación:</span>
                <span className="text-xs font-medium text-green-600 dark:text-green-400">hace 30s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default ServerStatusSectionCompact;
