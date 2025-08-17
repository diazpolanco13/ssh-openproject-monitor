import React, { useState, useEffect } from 'react';

const StatusIndicator = ({ status, label }) => {
  const getStatusColor = () => {
    switch(status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-yellow-500';
      case 'warning': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );
};

const MetricCard = ({ title, value, unit, status, icon }) => {
  const getStatusColor = () => {
    switch(status) {
      case 'excellent': return 'text-green-600 border-green-200 bg-green-50';
      case 'good': return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'warning': return 'text-orange-600 border-orange-200 bg-orange-50';
      case 'critical': return 'text-red-600 border-red-200 bg-red-50';
      default: return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`p-4 border rounded-lg ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold">
            {value}
            <span className="text-lg font-normal ml-1">{unit}</span>
          </p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
};

const ServerStatusSectionReal = () => {
  const [serverData, setServerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServerStatus = async () => {
    try {
      setError(null);
      const response = await fetch('http://localhost:8080/api/server/status');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setServerData(data);
    } catch (err) {
      console.error('Error fetching server status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServerStatus();
    
    // Update every 30 seconds
    const interval = setInterval(fetchServerStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getMetricStatus = (value, thresholds) => {
    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.warning) return 'warning';
    if (value >= thresholds.good) return 'good';
    return 'excellent';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Server Status</h2>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading server status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Server Status</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 text-2xl mr-3">⚠️</div>
            <div>
              <h3 className="text-red-800 font-medium">Unable to load server status</h3>
              <p className="text-red-600 text-sm mt-1">Error: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!serverData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Server Status</h2>
        <div className="text-gray-500 text-center py-8">No server data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Server Status (Real-time)</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Uptime: {Math.floor(serverData.uptime_hours / 24)}d {serverData.uptime_hours % 24}h
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date(serverData.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {(serverData.critical_alerts.length > 0 || serverData.warnings.length > 0) && (
        <div className="mb-6 space-y-2">
          {serverData.critical_alerts.map((alert, index) => (
            <div key={`critical-${index}`} className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <span className="text-red-600 text-lg mr-2">🚨</span>
                <span className="text-red-800 font-medium">Critical: {alert}</span>
              </div>
            </div>
          ))}
          {serverData.warnings.map((warning, index) => (
            <div key={`warning-${index}`} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center">
                <span className="text-orange-600 text-lg mr-2">⚠️</span>
                <span className="text-orange-800 font-medium">Warning: {warning}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="CPU Usage"
          value={serverData.cpu_usage}
          unit="%"
          status={getMetricStatus(serverData.cpu_usage, { good: 40, warning: 70, critical: 85 })}
          icon="🖥️"
        />
        <MetricCard
          title="Memory Usage"
          value={serverData.memory_usage}
          unit="%"
          status={getMetricStatus(serverData.memory_usage, { good: 50, warning: 75, critical: 90 })}
          icon="💾"
        />
        <MetricCard
          title="Disk Usage"
          value={serverData.disk_usage}
          unit="%"
          status={getMetricStatus(serverData.disk_usage, { good: 60, warning: 80, critical: 95 })}
          icon="💿"
        />
        <MetricCard
          title="Load Average"
          value={serverData.load_average}
          unit=""
          status={getMetricStatus(serverData.load_average, { good: 1, warning: 2, critical: 4 })}
          icon="⚡"
        />
      </div>

      {/* Services Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Services */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-3">System Services</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Services</span>
              <span className="text-lg font-bold text-green-600">
                {serverData.services.active}/{serverData.services.total}
              </span>
            </div>
            {serverData.services.services && serverData.services.services.map((service, index) => (
              <StatusIndicator
                key={index}
                status={service.status === 'active' ? 'excellent' : 'critical'}
                label={`${service.name}: ${service.status}`}
              />
            ))}
          </div>
        </div>

        {/* Docker Containers */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Docker Containers</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Running Containers</span>
              <span className="text-lg font-bold text-blue-600">
                {serverData.docker_containers.running}/{serverData.docker_containers.total}
              </span>
            </div>
            {serverData.docker_containers.containers && serverData.docker_containers.containers.slice(0, 3).map((container, index) => (
              <StatusIndicator
                key={index}
                status={container.State === 'running' ? 'excellent' : 'warning'}
                label={`${container.Names}: ${container.State}`}
              />
            ))}
            <div className="text-xs text-gray-500 mt-2">
              Network connections: {serverData.network_connections}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerStatusSectionReal;
