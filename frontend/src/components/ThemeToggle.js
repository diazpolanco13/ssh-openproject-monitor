import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center p-2 rounded-lg
        transition-all duration-300 ease-in-out
        ${isDarkMode 
          ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        }
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${isDarkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}
      `}
      title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <div className="relative w-5 h-5">
        {/* Icono Sol */}
        <Sun 
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-300
            ${isDarkMode 
              ? 'opacity-0 scale-0 rotate-90' 
              : 'opacity-100 scale-100 rotate-0'
            }
          `}
        />
        
        {/* Icono Luna */}
        <Moon 
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-300
            ${isDarkMode 
              ? 'opacity-100 scale-100 rotate-0' 
              : 'opacity-0 scale-0 -rotate-90'
            }
          `}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
