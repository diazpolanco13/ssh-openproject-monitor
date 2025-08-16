import React from 'react';

const MetricCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorClasses = {
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      text: 'text-red-900',
      border: 'border-red-200'
    },
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      text: 'text-blue-900',
      border: 'border-blue-200'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      text: 'text-green-900',
      border: 'border-green-200'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      text: 'text-orange-900',
      border: 'border-orange-200'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline">
            <p className={`text-3xl font-semibold ${colors.text}`}>
              {value.toLocaleString()}
            </p>
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colors.bg}`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
