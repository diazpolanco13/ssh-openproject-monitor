import React, { useState, useEffect } from 'react';
import { Shield, Users, AlertTriangle, Activity } from 'lucide-react';
import axios from 'axios';
import Header from './Header';
import MetricCard from './MetricCard';
import SSHSection from './SSHSection';
import OpenProjectSection from './OpenProjectSection';
import SecurityAlerts from './SecurityAlerts';

const Dashboard = () => {
  const [sshData, setSshData] = useState({
    attacks: 0,
    successfulLogins: 0,
    blockedIPs: 0,
    geoData: []
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
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch SSH data - usando endpoints que existen
      const [sshAttacks, sshSuccess] = await Promise.all([
        axios.get(`${API_BASE}/api/ssh/attacks`),
        axios.get(`${API_BASE}/api/ssh/successful`)
      ]);

      setSshData({
        attacks: Array.isArray(sshAttacks.data) ? sshAttacks.data.length : 0,
        successfulLogins: Array.isArray(sshSuccess.data) ? sshSuccess.data.length : 0,
        blockedIPs: 0, // Este endpoint no existe aún
        geoData: [] // Este endpoint no existe aún
      });

      // Fetch OpenProject data - ajustar formato de respuesta
      const [opUsers, opActive, opFailed, opSuccess] = await Promise.all([
        axios.get(`${API_BASE}/api/openproject/users-db`),
        axios.get(`${API_BASE}/api/openproject/active-users`),
        axios.get(`${API_BASE}/api/openproject/failed-logins`),
        axios.get(`${API_BASE}/api/openproject/successful-logins`)
      ]);

      setOpenProjectData({
        totalUsers: Array.isArray(opUsers.data) ? opUsers.data.length : 0,
        activeUsers: Array.isArray(opActive.data) ? opActive.data.length : 0,
        failedLogins: Array.isArray(opFailed.data) ? opFailed.data.length : 0,
        successfulLogins: Array.isArray(opSuccess.data) ? opSuccess.data.length : 0,
        users: Array.isArray(opUsers.data) ? opUsers.data : []
      });

      // Fetch security alerts - usando endpoint que existe
      try {
        const alertsResponse = await axios.get(`${API_BASE}/api/security/intrusion-detection`);
        setSecurityAlerts(Array.isArray(alertsResponse.data) ? alertsResponse.data : []);
      } catch (alertError) {
        console.warn('Security alerts not available:', alertError);
        setSecurityAlerts([]);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !sshData.attacks) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Ataques SSH"
            value={sshData.attacks}
            icon={Shield}
            color="red"
            subtitle="Intentos bloqueados"
          />
          <MetricCard
            title="Usuarios OP"
            value={openProjectData.totalUsers}
            icon={Users}
            color="blue"
            subtitle="Total en sistema"
          />
          <MetricCard
            title="Usuarios Activos"
            value={openProjectData.activeUsers}
            icon={Activity}
            color="green"
            subtitle="OpenProject"
          />
          <MetricCard
            title="IPs Bloqueadas"
            value={sshData.blockedIPs}
            icon={AlertTriangle}
            color="orange"
            subtitle="Fail2ban activo"
          />
        </div>

        {/* Alertas de seguridad */}
        {securityAlerts.length > 0 && (
          <SecurityAlerts alerts={securityAlerts} />
        )}

        {/* Secciones principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SSHSection 
            data={sshData}
            onRefresh={fetchDashboardData}
          />
          <OpenProjectSection 
            data={openProjectData}
            onRefresh={fetchDashboardData}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
