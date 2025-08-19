import React, { useState, useEffect, useCallback } from 'react';
import { Users, Database, UserCheck, UserX, RefreshCw, Activity, Globe } from 'lucide-react';

const OpenProjectSection = ({ data, onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false);

  // Debug: Ver qué datos están llegando
  console.log('📊 OpenProject Data received:', data);
  if (data.activeConnections) {
    console.log('🔗 Active connections:', data.activeConnections.length, data.activeConnections);
  }
  if (data.users) {
    console.log('👥 Users from DB:', data.users.length, data.users.map(u => u.display_name));
  }

  const handleRefresh = useCallback(async (isManual = true) => {
    setRefreshing(true);
    await onRefresh();
    // Transición suave como en ServerStatus
    setTimeout(() => setRefreshing(false), 500);
  }, [onRefresh]);

  // Auto-actualización cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => handleRefresh(false), 300000);
    return () => clearInterval(interval);
  }, [handleRefresh]);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-500 ${refreshing ? 'ring-2 ring-blue-300 dark:ring-blue-500' : ''}`}>
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              OpenProject
            </h2>
            {refreshing && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Actualizando...</span>
              </div>
            )}
          </div>
          <button
            onClick={() => handleRefresh(true)}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-50 transition-colors duration-200"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Estadísticas OpenProject */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700/50 transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Usuarios</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                  {/* Mostrar solo usuarios reales de la DB (no fantasmas) */}
                  {data.users ? data.users.length : 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700/50 transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Conectados</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                  {/* Contar solo usuarios activos que existen en la DB (filtrar fantasmas) */}
                  {data.activeConnections && data.users ? 
                    data.activeConnections.filter(conn => {
                      const userExists = data.users.find(user => 
                        user.id.toString() === conn.user_id || user.id === conn.user_id
                      );
                      if (!userExists) {
                        console.log(`🚫 Usuario fantasma filtrado: ID ${conn.user_id}`);
                      }
                      return userExists;
                    }).length : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas de login de hoy */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700/50 transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <UserX className="h-6 w-6 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">Logins Fallidos (Hoy)</p>
                <p className="text-lg font-bold text-red-900 dark:text-red-300">{data.failedLogins}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700/50 transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">Logins Exitosos (Hoy)</p>
                <p className="text-lg font-bold text-green-900 dark:text-green-300">{data.successfulLogins}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista completa de usuarios registrados */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Lista de Usuarios de OpenProject
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto transition-colors duration-200 scrollbar-thick">
            {data.users && data.users.length > 0 ? (
              <div className="space-y-2">
                {/* Ordenar usuarios: primero activos (por actividad más reciente), luego inactivos (por última conexión) */}
                {data.users
                  .map(user => {
                    // Buscar si el usuario tiene actividad reciente (está en activeConnections)
                    const activeConnection = data.activeConnections?.find(conn => 
                      conn.user_id === user.id.toString() || conn.user_id === user.id
                    );
                    const isCurrentlyActive = !!activeConnection;
                    
                    return {
                      ...user,
                      activeConnection,
                      isCurrentlyActive,
                      lastActivityDate: activeConnection ? new Date(activeConnection.last_activity) : (user.last_login ? new Date(user.last_login) : new Date(0))
                    };
                  })
                  .sort((a, b) => {
                    // Primero ordenar por estado: activos primero
                    if (a.isCurrentlyActive && !b.isCurrentlyActive) return -1;
                    if (!a.isCurrentlyActive && b.isCurrentlyActive) return 1;
                    
                    // Dentro del mismo estado, ordenar por fecha más reciente
                    return b.lastActivityDate - a.lastActivityDate;
                  })
                  .map((user, index) => {
                  console.log(`🔍 User ${user.display_name} (ID: ${user.id}) - Active: ${user.isCurrentlyActive}`);
                  if (user.activeConnection) {
                    console.log('  Connection:', user.activeConnection);
                  }
                  
                  // Determinar si es actividad reciente (últimas 24 horas)
                  const isRecentActivity = () => {
                    if (!user.last_login) return false;
                    const lastLogin = new Date(user.last_login);
                    const now = new Date();
                    const hoursDiff = (now - lastLogin) / (1000 * 60 * 60);
                    return hoursDiff <= 24;
                  };
                  
                  // Formatear la fecha de última conexión
                  const formatLastLogin = (dateStr) => {
                    if (!dateStr) return 'Sin conexión previa';
                    const date = new Date(dateStr);
                    return date.toLocaleString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                  };

                  return (
                    <div key={user.id || index} className="flex items-center justify-between py-3 px-4 bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500 transition-colors duration-200">
                      <div className="flex items-center space-x-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          user.isCurrentlyActive 
                            ? 'bg-green-100 dark:bg-green-800/30' 
                            : isRecentActivity() 
                              ? 'bg-yellow-100 dark:bg-yellow-800/30' 
                              : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <span className={`font-bold text-sm ${
                            user.isCurrentlyActive 
                              ? 'text-green-600 dark:text-green-400' 
                              : isRecentActivity() 
                                ? 'text-yellow-600 dark:text-yellow-400' 
                                : 'text-gray-600 dark:text-gray-300'
                          }`}>
                            {user.display_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.display_name}
                          </p>
                          {user.activeConnection && (
                            <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400">
                              <span className={`px-2 py-1 rounded-full font-medium ${
                                user.activeConnection.is_trusted ? 'bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-800/30 text-yellow-800 dark:text-yellow-300'
                              }`}>
                                {user.activeConnection.ip}
                              </span>
                              <span className="flex items-center space-x-1">
                                <Globe className="h-3 w-3" />
                                <span className="font-medium">{user.activeConnection.country}</span>
                              </span>
                            </div>
                          )}
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Última conexión: {formatLastLogin(user.last_login)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {user.isCurrentlyActive ? (
                          <span className="px-3 py-1 text-xs rounded-full bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300 font-medium">
                            Conectado
                          </span>
                        ) : isRecentActivity() ? (
                          <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-800/30 text-yellow-800 dark:text-yellow-300 font-medium">
                            Actividad Reciente
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                            Inactivo
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No hay usuarios registrados
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenProjectSection;