import React from 'react';
import { AlertTriangle, Shield, Clock } from 'lucide-react';

const SecurityAlerts = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  // Agrupar alertas por país para manejo de volumen
  const groupedAlerts = alerts.reduce((acc, alert) => {
    const country = alert.country || 'Unknown';
    if (!acc[country]) {
      acc[country] = [];
    }
    acc[country].push(alert);
    return acc;
  }, {});

  // Ordenar países por número de alertas (más ataques primero)
  const sortedCountries = Object.entries(groupedAlerts)
    .sort(([,a], [,b]) => b.length - a.length)
    .slice(0, 5); // Mostrar solo top 5 países

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50 text-red-800 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700/50 text-yellow-800 dark:text-yellow-300';
      case 'low':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/50 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-300';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'medium':
        return <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'low':
        return <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  return (
    <div className="mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Alertas de Seguridad
            </h2>
            <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs px-2 py-1 rounded-full">
              {alerts.length}
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* Resumen por países */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              🌍 Top Países Atacantes (últimas 24h)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {sortedCountries.map(([country, countryAlerts]) => {
                const totalAttempts = countryAlerts.reduce((sum, alert) => sum + (alert.attempts || 1), 0);
                const highSeverity = countryAlerts.filter(a => a.severity === 'high').length;
                
                return (
                  <div key={country} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        🌍 {country}
                      </span>
                      {highSeverity > 0 && (
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs px-2 py-0.5 rounded">
                          {highSeverity} críticos
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{totalAttempts}</span> intentos • 
                      <span className="ml-1">{countryAlerts.length} IPs únicas</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alertas más recientes (compactas) */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              🚨 Últimas Alertas Críticas
            </h3>
            {alerts.slice(0, 5).map((alert, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-3 transition-colors duration-200 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {alert.type}
                      </span>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-mono">{alert.ip}</span> • 
                        <span className="ml-1">🌍 {alert.country}, {alert.city}</span> • 
                        <span className="ml-1">{alert.attempts || 1} intentos</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(alert.severity)}`}>
                      {alert.severity?.toUpperCase()}
                    </span>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {alert.timestamp 
                        ? new Date(alert.timestamp).toLocaleTimeString('es-ES')
                        : 'Tiempo no disponible'
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {alerts.length > 5 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Mostrando 5 alertas más recientes de {alerts.length} total
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityAlerts;