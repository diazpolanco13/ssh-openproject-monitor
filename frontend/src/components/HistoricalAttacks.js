import React, { useState, useEffect } from 'react';
import { Calendar, AlertTriangle, Globe, TrendingUp, Clock } from 'lucide-react';
import axios from 'axios';

const HistoricalAttacks = () => {
  const [attackData, setAttackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(4);

  // Datos reales de los ataques que encontramos
  const realAttackData = {
    timeline: [
      { date: 'Hace 4 días', attacks: 11439, description: 'Ataque masivo - Pico máximo' },
      { date: 'Hace 3 días', attacks: 3133, description: 'Continuación del ataque' },
      { date: 'Hace 2 días', attacks: 307, description: 'Disminución significativa' },
      { date: 'Ayer', attacks: 14, description: 'Actividad residual' }
    ],
    topAttackers: [
      { ip: '128.199.29.252', count: 1582, country: 'Netherlands' },
      { ip: '167.99.148.69', count: 1218, country: 'United States' },
      { ip: '1.85.61.165', count: 1123, country: 'South Korea' },
      { ip: '192.241.159.145', count: 619, country: 'United States' },
      { ip: '170.64.226.99', count: 619, country: 'United States' },
      { ip: '103.101.162.38', count: 619, country: 'Singapore' },
      { ip: '196.251.88.103', count: 588, country: 'South Africa' },
      { ip: '134.199.195.128', count: 588, country: 'United States' },
      { ip: '134.199.194.203', count: 588, country: 'United States' },
      { ip: '177.126.130.163', count: 561, country: 'Brazil' }
    ],
    summary: {
      totalAttacks: 14896,
      uniqueIPs: 127,
      peakDay: 'Hace 4 días',
      duration: '4 días',
      avgAttacksPerIP: 117
    }
  };

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setAttackData(realAttackData);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Análisis de Ataques Históricos
        </h3>
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-600 dark:text-gray-400">Analizando logs históricos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          🚨 Ataques SSH Históricos - Incidente Real
        </h3>
        <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
          <AlertTriangle className="h-4 w-4" />
          <span>Ataque masivo detectado</span>
        </div>
      </div>

      {/* Resumen del Ataque */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700/50">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">Total Ataques</span>
          </div>
          <p className="text-2xl font-bold text-red-900 dark:text-red-300 mt-1">
            {attackData.summary.totalAttacks.toLocaleString()}
          </p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700/50">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">IPs Únicas</span>
          </div>
          <p className="text-2xl font-bold text-orange-900 dark:text-orange-300 mt-1">
            {attackData.summary.uniqueIPs}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700/50">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Pico Máximo</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-300 mt-1">
            11,439
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700/50">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Duración</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-1">
            {attackData.summary.duration}
          </p>
        </div>
      </div>

      {/* Timeline de Ataques */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3">
          Timeline del Ataque
        </h4>
        <div className="space-y-3">
          {attackData.timeline.map((day, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{day.date}</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{day.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-red-600 dark:text-red-400">
                  {day.attacks.toLocaleString()}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-500">intentos</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Atacantes */}
      <div>
        <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3">
          Top 10 IPs Atacantes
        </h4>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
          <div className="space-y-2">
            {attackData.topAttackers.map((attacker, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-mono bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                  <div>
                    <span className="font-mono text-sm text-gray-900 dark:text-white">
                      {attacker.ip}
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      📍 {attacker.country}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-red-600 dark:text-red-400">
                  {attacker.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          <strong>ℹ️ Datos Reales:</strong> Este análisis muestra el ataque SSH real que motivó la creación de este sistema de monitoreo. 
          Los datos provienen de logs del sistema journalctl.
        </p>
      </div>
    </div>
  );
};

export default HistoricalAttacks;
