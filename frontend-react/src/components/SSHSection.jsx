import React, { useState } from 'react';
import { Shield, RefreshCw, Lock, CheckCircle, User, Terminal, Clock, Globe } from 'lucide-react';

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 sm:p-4 border border-red-200 dark:border-red-700/50 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-3">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium truncate">Ataques Bloqueados</p>
                <p className="text-xl sm:text-2xl font-bold text-red-900 dark:text-red-300">{data.attacks}</p>
              </div>
              <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 dark:text-red-400 flex-shrink-0" />
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4 border border-green-200 dark:border-green-700/50 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-3">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium truncate">Accesos Válidos</p>
                <p className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-300">{data.successfulLogins}</p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Estado Fail2ban - Alineado con la segunda fila de OpenProject */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 sm:p-4 border border-orange-200 dark:border-orange-700/50 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-3">
                <p className="text-sm text-orange-700 dark:text-orange-300 font-medium truncate">IPs Bloqueadas</p>
                <p className="text-lg font-bold text-orange-900 dark:text-orange-200">{data.blockedIPs}</p>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="h-2 w-2 bg-orange-500 dark:bg-orange-400 rounded-full"></div>
                <span className="text-xs text-orange-700 dark:text-orange-300">Activo</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 border border-blue-200 dark:border-blue-700/50 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-3">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium truncate">Conexiones Únicas</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-300">{data.uniqueIPs || 0}</p>
              </div>
              <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Conexiones SSH Activas */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <Terminal className="h-4 w-4 mr-2" />
            Conexiones SSH Activas
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto transition-colors duration-200">
            {data.activeSessions && data.activeSessions.consolidated_sessions?.length > 0 ? (
              <div className="space-y-2">
                {data.activeSessions.consolidated_sessions.map((session, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 px-4 bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500 transition-colors duration-200 space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        session.is_trusted 
                          ? 'bg-green-100 dark:bg-green-800/30' 
                          : 'bg-yellow-100 dark:bg-yellow-800/30'
                      }`}>
                        {session.type === 'user_session' ? (
                          <User className={`h-4 w-4 sm:h-5 sm:w-5 ${
                            session.is_trusted 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-yellow-600 dark:text-yellow-400'
                          }`} />
                        ) : (
                          <Terminal className={`h-4 w-4 sm:h-5 sm:w-5 ${
                            session.is_trusted 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-yellow-600 dark:text-yellow-400'
                          }`} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {session.type === 'user_session' ? session.user : `Conexión ${session.service}`}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <span className={`px-2 py-1 rounded-full font-medium truncate max-w-[140px] ${
                            session.is_trusted 
                              ? 'bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300' 
                              : 'bg-yellow-100 dark:bg-yellow-800/30 text-yellow-800 dark:text-yellow-300'
                          }`} title={`${session.ip}${session.remote_port ? `:${session.remote_port}` : ''}`}>
                            {session.ip}{session.remote_port ? `:${session.remote_port}` : ''}
                          </span>
                          <span className="flex items-center space-x-1 flex-shrink-0">
                            <Globe className="h-3 w-3" />
                            <span className="font-medium">{session.country}</span>
                          </span>
                          {session.terminal && (
                            <span className="flex items-center space-x-1 flex-shrink-0">
                              <Terminal className="h-3 w-3" />
                              <span className="truncate max-w-[60px]" title={session.terminal}>{session.terminal}</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                          {session.type === 'user_session' ? `Login: ${session.login_time}` : `Estado: ${session.connection_status}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end sm:justify-start">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium flex-shrink-0 ${
                        session.is_trusted 
                          ? 'bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300' 
                          : 'bg-yellow-100 dark:bg-yellow-800/30 text-yellow-800 dark:text-yellow-300'
                      }`}>
                        {session.is_trusted ? 'Confiable' : 'Monitorear'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No hay conexiones SSH activas
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SSHSection;
