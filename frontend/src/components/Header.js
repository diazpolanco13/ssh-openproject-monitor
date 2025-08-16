import React from 'react';
import { Shield, Server } from 'lucide-react';

const Header = () => {
  const currentTime = new Date().toLocaleString('es-ES');

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary-600" />
              <Server className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                SSH & OpenProject Monitor
              </h1>
              <p className="text-sm text-gray-500">
                Sistema de Monitoreo y Seguridad
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Última actualización</p>
              <p className="text-sm font-medium text-gray-900">{currentTime}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">En línea</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;