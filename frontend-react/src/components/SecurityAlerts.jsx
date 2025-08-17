import React from 'react';
import { AlertTriangle, Shield, Clock } from 'lucide-react';

const SecurityAlerts = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return null;
  }

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
          <div className="space-y-4">
            {alerts.slice(0, 10).map((alert, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-4 transition-colors duration-200 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {alert.type || 'Alerta de Seguridad'}
                      </p>
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(alert.severity)}`}>
                        {alert.severity?.toUpperCase() || 'MEDIUM'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {alert.message || alert.description || 'Actividad sospechosa detectada'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>IP: {alert.ip || 'No disponible'}</span>
                      <span>
                        {alert.timestamp 
                          ? new Date(alert.timestamp).toLocaleString('es-ES')
                          : 'Tiempo no disponible'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {alerts.length > 10 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Mostrando 10 de {alerts.length} alertas
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityAlerts;