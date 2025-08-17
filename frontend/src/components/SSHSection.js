import React, { useState } from 'react';
import { Shield, Globe, RefreshCw, Lock, CheckCircle } from 'lucide-react';

const SSHSection = ({ data, onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Monitoreo SSH
            </h2>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-50 transition-colors duration-200"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Estadísticas SSH */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700/50 transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">Ataques Bloqueados</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-300">{data.attacks}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700/50 transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Accesos Válidos</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-300">{data.successfulLogins}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Información geográfica */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <Globe className="h-4 w-4 mr-2" />
            Distribución Geográfica de Ataques
          </h3>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors duration-200">
            {data.geoData && data.geoData.length > 0 ? (
              <div className="space-y-2">
                {data.geoData.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.country || 'Desconocido'}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No hay datos geográficos disponibles
              </p>
            )}
          </div>
        </div>

        {/* IPs bloqueadas */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Estado de Fail2ban
          </h3>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700/50 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 dark:text-orange-300">IPs Bloqueadas Actualmente</p>
                <p className="text-lg font-semibold text-orange-900 dark:text-orange-200">{data.blockedIPs}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-orange-500 dark:bg-orange-400 rounded-full"></div>
                <span className="text-xs text-orange-700 dark:text-orange-300">Activo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SSHSection;