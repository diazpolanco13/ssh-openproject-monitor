import React from 'react';
import { Shield, Server } from 'lucide-react';
import { APP_CONFIG } from '../config/app';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const currentTime = new Date().toLocaleString('es-ES');

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <Server className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {APP_CONFIG.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {APP_CONFIG.subtitle} <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-md">v{APP_CONFIG.version}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Última actualización</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{currentTime}</p>
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
