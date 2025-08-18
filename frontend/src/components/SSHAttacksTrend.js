import React, { useState, useEffect } from 'react';

const SSHAttacksTrend = () => {
  const [attacksData, setAttacksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAttacksData();
    const interval = setInterval(fetchAttacksData, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  const fetchAttacksData = async () => {
    try {
      const response = await fetch('/api/ssh/attacks-trend');
      if (!response.ok) throw new Error('Error al obtener datos');
      const data = await response.json();
      setAttacksData(data.daily_attacks || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMaxAttacks = () => {
    if (attacksData.length === 0) return 100;
    const max = Math.max(...attacksData.map(day => day.attacks));
    return Math.max(max, 10); // Mínimo 10 para que se vea bien el gráfico
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  };

  const getBarColor = (attacks) => {
    if (attacks === 0) return 'bg-gray-600';
    if (attacks < 10) return 'bg-green-500';
    if (attacks < 100) return 'bg-yellow-500';
    if (attacks < 1000) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getBarHeight = (attacks) => {
    const maxAttacks = getMaxAttacks();
    const percentage = (attacks / maxAttacks) * 100;
    return Math.max(percentage, 2); // Mínimo 2% para que se vea
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="text-red-400 mr-2">📊</span>
          Tendencia de Ataques SSH (30 días)
        </h3>
        <div className="text-red-400 text-sm">
          Error: {error}
        </div>
      </div>
    );
  }

  const totalAttacks = attacksData.reduce((sum, day) => sum + day.attacks, 0);
  const avgAttacks = attacksData.length > 0 ? Math.round(totalAttacks / attacksData.length) : 0;
  const peakDay = attacksData.reduce((max, day) => day.attacks > max.attacks ? day : max, { attacks: 0 });

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <span className="text-blue-400 mr-2">📊</span>
        Tendencia de Ataques SSH (30 días)
      </h3>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-gray-400 text-xs uppercase">Total</div>
          <div className="text-white text-xl font-bold">{totalAttacks.toLocaleString()}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-gray-400 text-xs uppercase">Promedio/día</div>
          <div className="text-blue-400 text-xl font-bold">{avgAttacks}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-gray-400 text-xs uppercase">Pico máximo</div>
          <div className="text-red-400 text-xl font-bold">{peakDay.attacks.toLocaleString()}</div>
        </div>
      </div>

      {/* Gráfico de barras */}
      <div className="relative">
        <div className="flex items-end justify-between space-x-1 h-40 mb-4">
          {attacksData.slice(-30).map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div 
                className={`w-full ${getBarColor(day.attacks)} rounded-t transition-all duration-200 hover:opacity-80 relative`}
                style={{ height: `${getBarHeight(day.attacks)}%` }}
                title={`${formatDate(day.date)}: ${day.attacks} ataques`}
              >
                {/* Tooltip */}
                <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-10">
                  {day.attacks} ataques
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Etiquetas de fechas */}
        <div className="flex justify-between text-xs text-gray-400">
          {attacksData.slice(-30).map((day, index) => {
            // Mostrar solo cada 5 días para no saturar
            if (index % 5 === 0 || index === attacksData.length - 1) {
              return (
                <span key={index} className="transform -rotate-45 origin-bottom-left">
                  {formatDate(day.date)}
                </span>
              );
            }
            return <span key={index}></span>;
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex justify-center space-x-4 mt-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-600 rounded mr-1"></div>
          <span className="text-gray-400">Sin ataques</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
          <span className="text-gray-400">1-9</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
          <span className="text-gray-400">10-99</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-orange-500 rounded mr-1"></div>
          <span className="text-gray-400">100-999</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
          <span className="text-gray-400">1000+</span>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-400">
        Última actualización: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default SSHAttacksTrend;
