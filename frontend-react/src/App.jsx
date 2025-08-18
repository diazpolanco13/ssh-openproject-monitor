import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { ThemeProvider } from './contexts/ThemeContext'
import Header from './components/Header'
import Dashboard from './components/Dashboard'

// Configuración inteligente de API URL
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://45.137.194.210:8091'  // Si es localhost, usar IP remota
  : `http://${window.location.hostname}:8091`  // Si es remoto, usar hostname actual

function AppContent() {
  const [backendConnected, setBackendConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        console.log('🔄 Testing backend connection...', API_BASE)
        
        const healthResponse = await axios.get(`${API_BASE}/api/health`)
        console.log('✅ Backend connected:', healthResponse.data)
        
        setBackendConnected(true)
        setLoading(false)
      } catch (error) {
        console.error('❌ Backend connection failed:', error)
        setError(error.message)
        setLoading(false)
      }
    }

    testBackendConnection()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">🔄 Connecting to backend...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <Header />
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Connection Error</h3>
                  <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                    Make sure Flask backend is running on {API_BASE}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <Dashboard />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
