import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { AgentProvider } from './context/AgentContext';

import { Login } from './pages/Login/Login';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Storefront } from './pages/Storefront/Storefront';
import { Logs } from './pages/Logs/Logs';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <AgentProvider>
        <BrowserRouter>
          <Toaster 
            position="bottom-right"
            toastOptions={{
              className: '!bg-slate-800 !text-white !border !border-white/10 !rounded-xl',
              style: {
                background: '#1E293B',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)'
              }
            }}
          />
          <Routes>
            <Route path="/" element={<Login />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/logs" element={
              <ProtectedRoute>
                <Logs />
              </ProtectedRoute>
            } />
            
            <Route path="/store/:agentId" element={
              <ProtectedRoute>
                <Storefront />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AgentProvider>
    </AuthProvider>
  );
};

export default App;
