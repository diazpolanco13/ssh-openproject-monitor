import React from 'react';
import { AlertTriangle, Shield, Clock } from 'lucide-react';

const SecurityAlerts = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'medium':
        return <Shield className="h-5 w-5 text-yellow-600" />;
      case 'low':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="mb-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Alertas de Seguridad
            </h2>
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              {alerts.length}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {alerts.slice(0, 10).map((alert, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">
                        {alert.type || 'Alerta de Seguridad'}
                      </p>
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(alert.severity)}`}>
                        {alert.severity?.toUpperCase() || 'MEDIUM'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {alert.message || alert.description || 'Actividad sospechosa detectada'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
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
              <p className="text-sm text-gray-500">
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
