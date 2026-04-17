import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import NewAnalysis from './pages/NewAnalysis';
import AnalysisResultPage from './pages/AnalysisResult';
import History from './pages/History';
import Profile from './pages/Profile';
import KnowledgeBase from './pages/KnowledgeBase';
import MedicalAssistant from './pages/MedicalAssistant';
import HealthCalendar from './pages/HealthCalendar';
import ArticleDetail from './pages/ArticleDetail';
import PersonalHistory from './pages/PersonalHistory';
import BodyMap from './pages/BodyMap';

import PreliminaryDiagnosis from './pages/PreliminaryDiagnosis';

import { AuthProvider, useAuth } from './context/AuthContext';
import AdminDashboard from './pages/admin/AdminDashboard';
import KnowledgeManagement from './pages/admin/KnowledgeManagement';
import Login from './pages/Login';
import Register from './pages/Register';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-sky-500/20 rounded-full"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-sky-500/20 rounded-full"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.is_superuser) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  return (
    <Routes>
      <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
      <Route path="/admin/knowledge" element={<ProtectedAdminRoute><KnowledgeManagement /></ProtectedAdminRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
      <Route path="/analyze" element={<ProtectedRoute><Layout><NewAnalysis /></Layout></ProtectedRoute>} />
      <Route path="/preliminary" element={<ProtectedRoute><Layout><PreliminaryDiagnosis /></Layout></ProtectedRoute>} />
      <Route path="/result" element={<ProtectedRoute><Layout><AnalysisResultPage /></Layout></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><Layout><History /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      <Route path="/encyclopedia" element={<ProtectedRoute><Layout><KnowledgeBase /></Layout></ProtectedRoute>} />
      <Route path="/article/:id" element={<ProtectedRoute><Layout><ArticleDetail /></Layout></ProtectedRoute>} />
      <Route path="/medical-assistant" element={<ProtectedRoute><Layout><MedicalAssistant /></Layout></ProtectedRoute>} />
      <Route path="/health-calendar" element={<ProtectedRoute><Layout><HealthCalendar /></Layout></ProtectedRoute>} />
      <Route path="/personal-history" element={<ProtectedRoute><Layout><PersonalHistory /></Layout></ProtectedRoute>} />
      <Route path="/body-map" element={<ProtectedRoute><Layout><BodyMap /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
