import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check karte hain ki localStorage mein token hai ya nahi
  const token = localStorage.getItem('token');

  // Agar token nahi hai, toh wapas login page par bhej do
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Agar token hai, toh jo page manga tha (dashboard) wo dikha do
  return children;
};

export default ProtectedRoute;