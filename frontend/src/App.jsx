/**
 * Main App Component
 * Routes between upload, auth, and dashboard pages.
 */

import { useState, useCallback } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Header from './components/Header';
import { getStoredAuthUser, logoutUser } from './services/api';

const PAGE_TO_PATH = {
  home: '/upload',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
};

const PATH_TO_PAGE = {
  '/': 'home',
  '/upload': 'home',
  '/login': 'login',
  '/signup': 'signup',
  '/dashboard': 'dashboard',
};

function App() {
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [analysisData, setAnalysisData] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [analysisMeta, setAnalysisMeta] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(() => {
    return getStoredAuthUser();
  });
  const location = useLocation();
  const navigate = useNavigate();

  const currentPage = PATH_TO_PAGE[location.pathname] || 'home';

  const handleNavigate = useCallback((page) => {
    navigate(PAGE_TO_PATH[page] || '/upload');
  }, [navigate]);

  const handleAnalysisComplete = useCallback((data, session, meta = null) => {
    setAnalysisData(data);
    setSessionId(session);
    setAnalysisMeta(meta);
    setUploadStatus('success');
    navigate('/dashboard');
  }, [navigate]);

  const handleOpenAnalysis = useCallback((data, meta) => {
    setAnalysisData(data);
    setSessionId(meta?.sessionId || null);
    setAnalysisMeta(meta || null);
    setUploadStatus('success');
    navigate('/dashboard');
  }, [navigate]);

  const handleReset = useCallback(() => {
    setUploadStatus('idle');
    setAnalysisData(null);
    setSessionId(null);
    setAnalysisMeta(null);
    setError(null);
    navigate('/upload');
  }, [navigate]);

  function handleLoginSuccess(userData) {
    setUser(userData);
    navigate('/upload');
  }

  function handleSignupSuccess(userData) {
    if (userData) setUser(userData);
    navigate('/upload');
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <Header 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        hasAnalysis={analysisData !== null}
        onReset={handleReset}
        user={user}
        onLogout={() => { logoutUser(); setUser(null); navigate('/upload'); }}
      />
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/upload" replace />} />
          <Route
            path="/upload"
            element={(
              <HomePage
                uploadStatus={uploadStatus}
                setUploadStatus={setUploadStatus}
                error={error}
                setError={setError}
                onAnalysisComplete={handleAnalysisComplete}
                onNavigate={handleNavigate}
                isAuthenticated={Boolean(user)}
                user={user}
                onOpenAnalysis={handleOpenAnalysis}
              />
            )}
          />
          <Route
            path="/dashboard"
            element={(
              <DashboardPage
                analysisData={analysisData}
                sessionId={sessionId}
                analysisMeta={analysisMeta}
                onReset={handleReset}
              />
            )}
          />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />} />
          <Route path="/signup" element={<Signup onSignupSuccess={handleSignupSuccess} onNavigate={handleNavigate} />} />
          <Route path="*" element={<Navigate to="/upload" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
