import React, { useState, useEffect } from 'react';

const SSHAttacksTrendSimple = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://45.137.194.210:8080/api/ssh/attacks-trend');
        if (!response.ok) throw new Error('Error en la API');
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Actualizar cada 2 minutos en lugar de cada minuto
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="text-blue-400 mr-2">📊</span>
          Tendencia de Ataques SSH
        </h3>
        <div className="animate-pulse">
          <div className="h-32 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="text-red-400 mr-2">📊</span>
          Tendencia de Ataques SSH
        </h3>
        <div className="text-red-400 text-sm">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!data || !data.daily_attacks) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="text-gray-400 mr-2">📊</span>
          Tendencia de Ataques SSH
        </h3>
        <div className="text-gray-400">No hay datos disponibles</div>
      </div>
    );
  }

  const { daily_attacks, summary } = data;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <span className="text-blue-400 mr-2">📊</span>
        Tendencia de Ataques SSH ({summary.days_analyzed} días)
      </h3>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-gray-400 text-xs uppercase">Total</div>
          <div className="text-white text-xl font-bold">
            {summary.total_attacks.toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-gray-400 text-xs uppercase">Promedio/día</div>
          <div className="text-blue-400 text-xl font-bold">
            {Math.round(summary.average_daily).toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-gray-400 text-xs uppercase">Pico máximo</div>
          <div className="text-red-400 text-xl font-bold">
            {summary.peak_attacks.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Lista de datos por día */}
      <div className="space-y-2">
        <h4 className="text-white font-medium mb-3">Ataques por día:</h4>
        <div className="max-h-40 overflow-y-auto space-y-1">
          {daily_attacks.slice(-7).reverse().map((day, index) => {
            const isToday = day.date === new Date().toISOString().split('T')[0];
            const attackColor = day.attacks === 0 ? 'text-green-400' : 
                               day.attacks < 100 ? 'text-yellow-400' : 'text-red-400';
            
            return (
              <div key={index} className="flex justify-between items-center bg-gray-700 rounded px-3 py-2">
                <span className={`text-sm ${isToday ? 'text-blue-400 font-semibold' : 'text-gray-300'}`}>
                  {isToday ? 'Hoy' : new Date(day.date).toLocaleDateString('es-ES', { 
                    day: '2-digit', 
                    month: '2-digit' 
                  })}
                </span>
                <span className={`font-mono font-bold ${attackColor}`}>
                  {day.attacks.toLocaleString()} ataques
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-400">
        Última actualización: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default SSHAttacksTrendSimple;
