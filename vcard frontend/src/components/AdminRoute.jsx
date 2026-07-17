import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const AdminRoute = ({ children }) => {
  const [status, setStatus] = useState('checking'); // checking | ok | denied

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setStatus('denied'); return; }
    axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats`, { headers: { 'x-auth-token': token } })
      .then(() => setStatus('ok'))
      .catch(() => setStatus('denied'));
  }, []);

  if (status === 'checking') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (status === 'denied') return <Navigate to={localStorage.getItem('token') ? '/dashboard' : '/login'} replace />;
  return children;
};

export default AdminRoute;
