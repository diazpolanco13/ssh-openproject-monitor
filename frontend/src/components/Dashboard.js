import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import axios from 'axios';
import Header from './Header';
import QuickStats from './QuickStats';
import ServerStatusSectionCompact from './ServerStatusSectionCompact';
import SSHSection from './SSHSection';
import OpenProjectSection from './OpenProjectSection';
import SecurityAlerts from './SecurityAlerts';
import GeographicalMap from './GeographicalMap';

const Dashboard = () => {
  const [sshData, setSshData] = useState({
    attacks: 0,
    successfulLogins: 0,
    blockedIPs: 0,
    geoData: [],
    activeSessions: { user_sessions: [], network_connections: [] }
  });

  const [openProjectData, setOpenProjectData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    failedLogins: 0,
    successfulLogins: 0,
    users: []
  });

  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = 'http://localhost:8080';

  useEffect(() => {
    console.log('🚀 Dashboard useEffect ejecutado - SOLO debe ocurrir UNA VEZ al cargar');
    fetchDashboardData();
    
    // Dashboard completo cada 15 minutos
    const dashboardInterval = setInterval(() => {
      console.log('⏰ Ejecutando actualización Dashboard completa:', new Date().toLocaleTimeString());
      fetchDashboardData();
    }, 900000); // 15 minutos
    
    // Alertas críticas cada 5 minutos
    const alertsInterval = setInterval(() => {
      console.log('🚨 Ejecutando actualización alertas críticas:', new Date().toLocaleTimeString());
      fetchSecurityAlerts();
    }, 300000); // 5 minutos
    
    return () => {
      console.log('🧹 Dashboard cleanup - removiendo intervalos');
      clearInterval(dashboardInterval);
      clearInterval(alertsInterval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSecurityAlerts = async () => {
    try {
      console.log('Actualizando alertas críticas:', new Date().toLocaleTimeString());
      const alertsResponse = await axios.get(`${API_BASE}/api/security/intrusion-detection`);
      setSecurityAlerts(Array.isArray(alertsResponse.data) ? alertsResponse.data : []);
    } catch (alertError) {
      console.warn('Security alerts not available:', alertError);
      setSecurityAlerts([]);
    }
  };

  const fetchSSHData = async () => {
    try {
      console.log('📡 Fetching SSH data...');
      const [sshActive, summaryData] = await Promise.all([
        axios.get(`${API_BASE}/api/ssh/active`),
        axios.get(`${API_BASE}/api/summary`)
      ]);

      console.log('🔐 SSH Active Sessions received:', sshActive.data);
      console.log('📊 Summary data received:', summaryData.data);

      setSshData({
        attacks: summaryData.data.ssh_failed_logins || 0,
        successfulLogins: summaryData.data.ssh_successful_logins || 0,
        blockedIPs: summaryData.data.ssh_blocked_ips || 0,
        uniqueIPs: summaryData.data.ssh_unique_ips || 0,
        geoData: [],
        activeSessions: sshActive.data || { user_sessions: [], network_connections: [] }
      });
    } catch (err) {
      console.error('Error fetching SSH data:', err);
    }
  };

  const fetchOpenProjectData = async () => {
    try {
      console.log('📡 Fetching OpenProject data...');
      const [opUsers, opUsersDb, opFailed, opSuccess, opConnections] = await Promise.all([
        axios.get(`${API_BASE}/api/openproject/users`),
        axios.get(`${API_BASE}/api/openproject/users-db`),
        axios.get(`${API_BASE}/api/openproject/failed-logins`),
        axios.get(`${API_BASE}/api/openproject/successful-logins`),
        axios.get(`${API_BASE}/api/openproject/connections`)
      ]);

      setOpenProjectData({
        totalUsers: Array.isArray(opUsersDb.data) ? opUsersDb.data.length : 0,
        activeUsers: Array.isArray(opUsers.data) ? opUsers.data.length : 0,
        failedLogins: Array.isArray(opFailed.data) ? opFailed.data.length : 0,
        successfulLogins: Array.isArray(opSuccess.data) ? opSuccess.data.length : 0,
        users: Array.isArray(opUsersDb.data) ? opUsersDb.data : [],
        activeConnections: Array.isArray(opUsers.data) ? opUsers.data : [],
        webConnections: Array.isArray(opConnections.data) ? opConnections.data : []
      });
    } catch (err) {
      console.error('Error fetching OpenProject data:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Actualizando dashboard completo:', new Date().toLocaleTimeString());
      
      await Promise.all([
        fetchSSHData(),
        fetchOpenProjectData(),
        fetchSecurityAlerts() // Incluir alertas en carga completa
      ]);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !sshData.attacks) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Estadísticas Rápidas */}
        <QuickStats sshData={sshData} openProjectData={openProjectData} />

        {/* Estado del Servidor */}
        <div className="mb-8">
          <ServerStatusSectionCompact />
        </div>

        {/* Alertas de seguridad */}
        {securityAlerts.length > 0 && (
          <SecurityAlerts alerts={securityAlerts} />
        )}

        {/* Secciones principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SSHSection 
            data={sshData}
            onRefresh={fetchSSHData}
          />
          <OpenProjectSection 
            data={openProjectData}
            onRefresh={fetchOpenProjectData}
          />
        </div>

        {/* Mapa geográfico */}
        <div className="mb-8">
          <GeographicalMap />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;