import React from 'react';
import { Shield, AlertTriangle, Users, Activity } from 'lucide-react';

const QuickStats = ({ sshData, openProjectData }) => {
  const stats = [
    {
      icon: Shield,
      label: 'Estado General',
      value: 'Seguro',
      subtext: `${sshData.attacks} ataques bloqueados`,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-700/50'
    },
    {
      icon: AlertTriangle,
      label: 'Alertas SSH',
      value: sshData.attacks,
      subtext: 'ataques en 24h',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-700/50'
    },
    {
      icon: Users,
      label: 'OpenProject',
      value: openProjectData.activeUsers,
      subtext: `de ${openProjectData.totalUsers} usuarios`,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-700/50'
    },
    {
      icon: Activity,
      label: 'Conexiones SSH',
      value: (sshData.activeSessions?.user_sessions?.length || 0) + (sshData.activeSessions?.network_connections?.length || 0),
      subtext: 'sesiones activas',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-700/50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <div
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} rounded-lg p-4 border transition-colors duration-200`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className={`text-lg font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {stat.subtext}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuickStats;
