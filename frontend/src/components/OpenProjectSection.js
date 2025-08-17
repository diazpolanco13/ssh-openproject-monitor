import React, { useState } from 'react';
import { Users, Database, UserCheck, UserX, RefreshCw, Activity, Globe } from 'lucide-react';

const OpenProjectSection = ({ data, onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              OpenProject
            </h2>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Estadísticas OpenProject */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Usuarios</p>
                <p className="text-2xl font-bold text-blue-900">{data.totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">Usuarios Activos</p>
                <p className="text-2xl font-bold text-green-900">{data.activeUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas de login */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center space-x-3">
              <UserX className="h-6 w-6 text-red-600" />
              <div>
                <p className="text-xs text-red-600 font-medium">Logins Fallidos</p>
                <p className="text-lg font-bold text-red-900">{data.failedLogins}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center space-x-3">
              <UserCheck className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-xs text-green-600 font-medium">Logins Exitosos</p>
                <p className="text-lg font-bold text-green-900">{data.successfulLogins}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista única de usuarios con IP, país y conexión */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Lista de Usuarios OpenProject
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            {data.activeConnections && data.activeConnections.length > 0 ? (
              <div className="space-y-2">
                {data.activeConnections.map((user, index) => {
                  // Buscar el usuario real en la base de datos
                  const realUser = data.users?.find(u => u.id === parseInt(user.user_id));
                  const displayName = realUser?.display_name || `Usuario ${user.user_id}`;
                  const lastLogin = realUser?.last_login;
                  
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
                    <div key={user.user_id || index} className="flex items-center justify-between py-3 px-4 bg-white rounded border">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold text-sm">
                            {displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {displayName}
                          </p>
                          <div className="flex items-center space-x-3 text-xs text-gray-600">
                            <span className={`px-2 py-1 rounded-full font-medium ${
                              user.is_trusted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.ip}
                            </span>
                            <span className="flex items-center space-x-1">
                              <Globe className="h-3 w-3" />
                              <span className="font-medium">{user.country}</span>
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Última conexión: {formatLastLogin(lastLogin)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
                          Activo Ahora
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                No hay usuarios activos conectados
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenProjectSection;