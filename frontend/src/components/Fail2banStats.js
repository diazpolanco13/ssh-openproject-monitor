import React, { useState, useEffect } from 'react';

const Fail2banStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedJail, setExpandedJail] = useState(null);

  useEffect(() => {
    fetchFail2banStats();
    const interval = setInterval(fetchFail2banStats, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const fetchFail2banStats = async () => {
    try {
      const response = await fetch('/api/security/fail2ban-stats');
      if (!response.ok) throw new Error('Error al obtener estadísticas');
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleJailExpansion = (jailName) => {
    setExpandedJail(expandedJail === jailName ? null : jailName);
  };

  const getStatusColor = (value) => {
    if (value === 0) return 'text-green-400';
    if (value < 10) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getBannedStatusColor = (value) => {
    if (value === 0) return 'text-gray-400';
    if (value < 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="text-red-400 mr-2">🛡️</span>
          Fail2ban Statistics
        </h3>
        <div className="text-red-400 text-sm">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <span className="text-blue-400 mr-2">🛡️</span>
        Fail2ban Statistics
      </h3>

      {/* Resumen General */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-gray-400 text-xs uppercase">Jails Activos</div>
          <div className="text-white text-xl font-bold">{stats.total_jails}</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-gray-400 text-xs uppercase">IPs Baneadas</div>
          <div className={`text-xl font-bold ${getBannedStatusColor(stats.total_banned)}`}>
            {stats.total_banned}
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-gray-400 text-xs uppercase">Fallos Actuales</div>
          <div className={`text-xl font-bold ${getStatusColor(stats.total_failed)}`}>
            {stats.total_failed}
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-gray-400 text-xs uppercase">Estado</div>
          <div className="text-green-400 text-sm font-semibold">
            {stats.total_jails > 0 ? '🟢 ACTIVO' : '🔴 INACTIVO'}
          </div>
        </div>
      </div>

      {/* Detalles por Jail */}
      <div className="space-y-3">
        <h4 className="text-white font-medium mb-3">Detalles por Jail</h4>
        {Object.entries(stats.jails).map(([jailName, jailStats]) => (
          <div key={jailName} className="bg-gray-700 rounded-lg">
            <div 
              className="p-4 cursor-pointer hover:bg-gray-600 transition-colors"
              onClick={() => toggleJailExpansion(jailName)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="text-blue-400 font-medium">{jailName}</span>
                  <span className={`text-sm ${getBannedStatusColor(jailStats.currently_banned)}`}>
                    {jailStats.currently_banned} baneadas
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${getStatusColor(jailStats.currently_failed)}`}>
                    {jailStats.currently_failed} fallos
                  </span>
                  <span className="text-gray-400">
                    {expandedJail === jailName ? '▼' : '▶'}
                  </span>
                </div>
              </div>
            </div>

            {expandedJail === jailName && (
              <div className="px-4 pb-4 border-t border-gray-600">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 mb-4">
                  <div>
                    <div className="text-gray-400 text-xs">Fallos Actuales</div>
                    <div className={`font-semibold ${getStatusColor(jailStats.currently_failed)}`}>
                      {jailStats.currently_failed}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Total Fallos</div>
                    <div className="text-white font-semibold">{jailStats.total_failed}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Baneadas Actuales</div>
                    <div className={`font-semibold ${getBannedStatusColor(jailStats.currently_banned)}`}>
                      {jailStats.currently_banned}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Total Baneadas</div>
                    <div className="text-white font-semibold">{jailStats.total_banned}</div>
                  </div>
                </div>

                {jailStats.banned_ips.length > 0 && (
                  <div>
                    <div className="text-gray-400 text-xs mb-2">
                      IPs Baneadas ({jailStats.banned_ips.length})
                    </div>
                    <div className="bg-gray-800 rounded p-3 max-h-32 overflow-y-auto">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 text-xs font-mono">
                        {jailStats.banned_ips.slice(0, 20).map((ip, index) => (
                          <div key={index} className="text-red-400">{ip}</div>
                        ))}
                        {jailStats.banned_ips.length > 20 && (
                          <div className="text-gray-400 col-span-full mt-1">
                            ... y {jailStats.banned_ips.length - 20} más
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* IPs Baneadas con Geolocalización */}
      {stats.banned_ips_geo && stats.banned_ips_geo.length > 0 && (
        <div className="mt-6">
          <h4 className="text-white font-medium mb-3">Top IPs Baneadas por País</h4>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {stats.banned_ips_geo.slice(0, 10).map((ipInfo, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-400 font-mono">{ipInfo.ip}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-white">{ipInfo.country}</span>
                    {ipInfo.city && (
                      <span className="text-gray-400">({ipInfo.city})</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400">
        Última actualización: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default Fail2banStats;
