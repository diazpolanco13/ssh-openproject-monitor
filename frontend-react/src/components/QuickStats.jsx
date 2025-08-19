import React from 'react';
import MetricCard from './MetricCard';
import { Shield, Users, Activity, AlertTriangle } from 'lucide-react';

const QuickStats = ({ sshData, openProjectData }) => {
  const metrics = [
    {
      title: "Ataques SSH",
      value: sshData?.attacks || 0,
      icon: AlertTriangle,
      bgColor: "bg-red-500",
      textColor: "text-red-600",
      bgLight: "bg-red-50",
      bgDark: "dark:bg-red-900/20"
    },
    {
      title: "SSH Exitosos",
      value: sshData?.successfulLogins || 0,
      icon: Shield,
      bgColor: "bg-green-500",
      textColor: "text-green-600",
      bgLight: "bg-green-50",
      bgDark: "dark:bg-green-900/20"
    },
    {
      title: "Usuarios OpenProject",
      value: openProjectData?.totalUsers || 0,
      icon: Users,
      bgColor: "bg-blue-500",
      textColor: "text-blue-600",
      bgLight: "bg-blue-50",
      bgDark: "dark:bg-blue-900/20"
    },
    {
      title: "Usuarios Activos",
      value: openProjectData?.activeUsers || 0,
      icon: Activity,
      bgColor: "bg-purple-500",
      textColor: "text-purple-600",
      bgLight: "bg-purple-50",
      bgDark: "dark:bg-purple-900/20"
    }
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard 
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            bgColor={metric.bgColor}
            textColor={metric.textColor}
            bgLight={metric.bgLight}
            bgDark={metric.bgDark}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickStats;
