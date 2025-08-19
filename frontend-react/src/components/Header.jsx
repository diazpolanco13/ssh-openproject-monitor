import React from 'react';
import { Shield, Server } from 'lucide-react';
import { APP_CONFIG } from '../config/app';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const currentTime = new Date().toLocaleString('es-ES');

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <img 
              src="/favicon.png" 
              alt="SAE Logo" 
              className="h-10 w-10 sm:h-8 sm:w-8 rounded-full shadow-sm flex-shrink-0" 
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                  {APP_CONFIG.name}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium truncate">
                {APP_CONFIG.subtitle}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <ThemeToggle />
            <div className="text-right">
              <p className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">Última actualización</p>
              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{currentTime}</p>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse flex-shrink-0"></div>
              <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-400">En línea</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
