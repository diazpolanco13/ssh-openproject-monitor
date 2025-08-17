import React from 'react';
import Dashboard from './components/Dashboard';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Dashboard />
      </div>
    </ThemeProvider>
  );
}

export default App;
