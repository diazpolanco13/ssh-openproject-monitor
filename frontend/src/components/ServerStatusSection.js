import React, { useState, useEffect } from 'react';
import { Server, Activity, HardDrive, Wifi, AlertTriangle, CheckCircle, Clock, Cpu } from 'lucide-react';

const StatusIndicator = ({ status, children }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
      case 'healthy':
      case 'online':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'offline':
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'active':
      case 'healthy':
      case 'online':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
      case 'offline':
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
      {getStatusIcon()}
      <span>{children}</span>
    </div>
  );
};

const MetricCard = ({ title, icon: Icon, metrics, status = 'active' }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        </div>
        <StatusIndicator status={status}>
          {status === 'active' ? 'Activo' : status === 'warning' ? 'Advertencia' : 'Error'}
        </StatusIndicator>
      </div>
      
      <div className="space-y-2">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-xs text-gray-600">{metric.label}</span>
            <span className={`text-sm font-medium ${
              metric.type === 'percentage' && parseFloat(metric.value) > 80 
                ? 'text-red-600' 
                : metric.type === 'percentage' && parseFloat(metric.value) > 60
                ? 'text-yellow-600'
                : 'text-gray-900'
            }`}>
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ServerStatusSection = ({ onRefresh }) => {
  const [serverData, setServerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServerStatus = async () => {
    try {
      setLoading(true);
      
      // Por ahora simulamos los datos hasta implementar la API del backend
      // TODO: Reemplazar con llamada real a /api/server/status
      const mockData = {
        system: {
          status: 'active',
          uptime: '7d 12h 34m',
          cpu_usage: '15.2%',
          memory_usage: '68.5%',
          disk_usage: '78.1%'
        },
        services: {
          backend: 'active',
          docker: 'active',
          ssh: 'active',
          openproject: 'active',
          containers: {
            total: 3,
            running: 3,
            stopped: 0
          }
        },
        network: {
          ip: '45.137.194.210',
          connections: 127,
          status: 'online'
        },
        alerts: {
          critical: 0,
          warnings: 2,
          info: 5,
          last_updated: new Date().toISOString()
        }
      };

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setServerData(mockData);
      setError(null);
    } catch (err) {
      setError('Error al cargar estado del servidor');
      console.error('Error fetching server status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServerStatus();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchServerStatus();
    if (onRefresh) onRefresh();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Estado del Servidor</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="ml-2 text-gray-600">Cargando estado del servidor...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Estado del Servidor</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Estado del Servidor</h2>
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <Activity className="h-4 w-4" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sistema */}
          <MetricCard
            title="Sistema"
            icon={Server}
            status={serverData.system.status}
            metrics={[
              { label: 'Uptime', value: serverData.system.uptime },
              { label: 'CPU', value: serverData.system.cpu_usage, type: 'percentage' },
              { label: 'RAM', value: serverData.system.memory_usage, type: 'percentage' }
            ]}
          />

          {/* Servicios */}
          <MetricCard
            title="Servicios"
            icon={Activity}
            status={serverData.services.backend}
            metrics={[
              { label: 'Backend', value: serverData.services.backend === 'active' ? 'Puerto 8080' : 'Inactivo' },
              { label: 'SSH', value: serverData.services.ssh === 'active' ? 'Activo' : 'Inactivo' },
              { label: 'OpenProject', value: serverData.services.openproject === 'active' ? 'Operativo' : 'Error' }
            ]}
          />

          {/* Almacenamiento & Red */}
          <MetricCard
            title="Infraestructura"
            icon={HardDrive}
            status={parseFloat(serverData.system.disk_usage) > 85 ? 'warning' : 'active'}
            metrics={[
              { label: 'Disco', value: serverData.system.disk_usage, type: 'percentage' },
              { label: 'IP Pública', value: serverData.network.ip },
              { label: 'Conexiones', value: serverData.network.connections.toString() }
            ]}
          />

          {/* Alertas & Docker */}
          <MetricCard
            title="Monitoreo"
            icon={AlertTriangle}
            status={serverData.alerts.critical > 0 ? 'critical' : serverData.alerts.warnings > 0 ? 'warning' : 'active'}
            metrics={[
              { label: 'Críticas', value: serverData.alerts.critical.toString() },
              { label: 'Advertencias', value: serverData.alerts.warnings.toString() },
              { label: 'Contenedores', value: `${serverData.services.containers.running}/${serverData.services.containers.total}` }
            ]}
          />
        </div>

        {/* Información adicional */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Última actualización: {new Date(serverData.alerts.last_updated).toLocaleTimeString('es-ES')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Wifi className="h-4 w-4" />
                <span>Red: {serverData.network.status}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Sistema operativo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerStatusSection;
