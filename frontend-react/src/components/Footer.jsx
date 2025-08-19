import React from 'react';
import { Shield, Code, Heart, Calendar } from 'lucide-react';
import { APP_CONFIG } from '../config/app';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6 sm:py-8">
          {/* Contenido principal del footer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Información SAE */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-3">
                <img 
                  src="/favicon.png" 
                  alt="SAE Logo" 
                  className="h-8 w-8 rounded-full shadow-sm" 
                />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  SAE Dashboard
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sala de Análisis Estratégico
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Sistema de Monitoreo y Seguridad
              </p>
            </div>

            {/* Información técnica */}
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center justify-center">
                <Code className="h-4 w-4 mr-2" />
                Información Técnica
              </h4>
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <p>Versión {APP_CONFIG.version}</p>
                <p>Build: {APP_CONFIG.buildDate}</p>
                <p>Frontend: React + Vite</p>
                <p>Backend: Python + Flask</p>
              </div>
            </div>

            {/* Estado del sistema */}
            <div className="text-center md:text-right">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center justify-center md:justify-end">
                <Shield className="h-4 w-4 mr-2" />
                Estado del Sistema
              </h4>
              <div className="flex items-center justify-center md:justify-end space-x-2 mb-2">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 dark:text-green-400">Operativo</span>
              </div>
              <div className="flex items-center justify-center md:justify-end space-x-2">
                <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                <span className="text-xs text-blue-600 dark:text-blue-400">Seguro</span>
              </div>
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6">
            
            {/* Copyright y créditos */}
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>© {currentYear} Sala de Análisis Estratégico. Todos los derechos reservados.</span>
              </div>
              
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <Heart className="h-3 w-3 text-red-500" />
                <span className="font-medium italic">"La verdad no debe estar dispersa"</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
