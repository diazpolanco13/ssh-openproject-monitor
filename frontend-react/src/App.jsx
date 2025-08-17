import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { ThemeProvider } from './contexts/ThemeContext'
import Header from './components/Header'

const API_BASE = 'http://localhost:8091'

function AppContent() {
  const [backendStatus, setBackendStatus] = useState(null)
  const [apiHealth, setApiHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBackendInfo = async () => {
      try {
        console.log('🔄 Connecting to backend...', API_BASE)
        
        // Test root endpoint
        const rootResponse = await axios.get(`${API_BASE}/`)
        console.log('✅ Root endpoint response:', rootResponse.data)
        setBackendStatus(rootResponse.data)

        // Test health endpoint
        const healthResponse = await axios.get(`${API_BASE}/api/health`)
        console.log('✅ Health endpoint response:', healthResponse.data)
        setApiHealth(healthResponse.data)

        setLoading(false)
      } catch (error) {
        console.error('❌ Error connecting to backend:', error)
        setError(error.message)
        setLoading(false)
      }
    }

    fetchBackendInfo()
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">
          🔐 SSH Monitor Dashboard v3.1
        </h1>
        
        {error ? (
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
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Backend Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-4">
                🖥️ Backend Status
              </h2>
              {backendStatus ? (
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p><strong>Service:</strong> {backendStatus.service}</p>
                  <p><strong>Version:</strong> {backendStatus.version}</p>
                  <p><strong>Status:</strong> <span className="text-green-600 dark:text-green-400">✅ {backendStatus.status}</span></p>
                  <p><strong>Timestamp:</strong> {new Date(backendStatus.timestamp).toLocaleString()}</p>
                  <p><strong>API Base:</strong> {API_BASE}</p>
                </div>
              ) : (
                <p className="text-red-600 dark:text-red-400">❌ Backend not available</p>
              )}
            </div>

            {/* Health Check */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
                💚 Health Check
              </h2>
              {apiHealth ? (
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p><strong>Status:</strong> <span className="text-green-600 dark:text-green-400">✅ {apiHealth.status}</span></p>
                  <p><strong>Services:</strong></p>
                  <ul className="ml-4 space-y-1">
                    <li>Flask: <span className="text-green-600 dark:text-green-400">{apiHealth.services.flask}</span></li>
                    <li>GeoIP: {apiHealth.services.geoip ? 
                      <span className="text-green-600 dark:text-green-400">✅ Available</span> : 
                      <span className="text-red-600 dark:text-red-400">❌ Missing</span>}
                    </li>
                    <li>Logs: <span className="text-green-600 dark:text-green-400">{apiHealth.services.logs}</span></li>
                  </ul>
                </div>
              ) : (
                <p className="text-red-600 dark:text-red-400">❌ Health check failed</p>
              )}
            </div>
          </div>
        )}

        {/* Connection Success */}
        {!error && !loading && (
          <div className="bg-green-50 dark:bg-green-900/50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">✅ Connection Successful!</h3>
                <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                  React frontend successfully connected to Flask backend
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tech Stack Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            🚀 Tech Stack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">Frontend</h3>
              <p className="text-sm text-blue-600 dark:text-blue-300">React 18 + Vite 7 + Tailwind CSS</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 dark:text-green-200">Backend</h3>
              <p className="text-sm text-green-600 dark:text-green-300">Python Flask + APIs</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200">Runtime</h3>
              <p className="text-sm text-purple-600 dark:text-purple-300">Node.js 20 + Python 3</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">🎯 Next Steps</h3>
              <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>✅ React + Vite + Tailwind working</li>
                <li>✅ Backend Flask APIs connected</li>
                <li>✅ Header + Theme Toggle migrated</li>
                <li>🔄 Ready to build SSH monitoring components</li>
                <li>📋 Available endpoints: {backendStatus?.endpoints ? Object.keys(backendStatus.endpoints).length : 'Loading...'}</li>
              </ul>
            </div>
          </div>
        </div>
        </div>
      </div>
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
