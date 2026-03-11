/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'admin' | 'user' }) => {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Wait for role to be fetched before making decisions, but don't wait forever if loading is already done
  if (requiredRole && !role && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If loading is done but role is still missing (should not happen with default 'user'), permit entry if no role is required
  // or redirect if it is required but still missing.
  if (requiredRole && !role && !loading) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    if (role === 'user') return <Navigate to="/reports" replace />;
    if (role === 'admin') return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col gap-4">
    <h1 className="text-3xl font-black text-slate-900 dark:text-white">{title}</h1>
    <p className="text-slate-500 dark:text-slate-400 text-lg">Esta página ainda está sob construção.</p>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute requiredRole="admin"><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute requiredRole="admin"><Layout><Users /></Layout></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout><Placeholder title="Configurações" /></Layout></ProtectedRoute>} />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
