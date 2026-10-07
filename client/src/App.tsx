import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './components/common/AppShell';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { AgentSimulator } from './pages/AgentSimulator';
import { Passports } from './pages/Passports';
import { Policies } from './pages/Policies';
import { Approvals } from './pages/Approvals';
import { Ledger } from './pages/Ledger';
import { Incidents } from './pages/Incidents';
import { TestLab } from './pages/TestLab';
import { SystemHealth } from './pages/SystemHealth';
import { Demo } from './pages/Demo';
import { Settings } from './pages/Settings';
import { Shield } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname === '/' ? '/dashboard' : window.location.pathname;
  });

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname === '/' ? '/dashboard' : window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg text-seal-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-seal-500 to-seal-700 flex items-center justify-center shadow-lg shadow-seal-500/25 animate-pulse">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="text-xs font-mono text-slate-400">Verifying ScopeSeal Gateway Session...</div>
        </div>
      </div>
    );
  }

  // Unauthenticated routing
  if (!user) {
    if (currentPath === '/register') {
      return <Register onNavigate={navigate} />;
    }
    return <Login onNavigate={navigate} />;
  }

  // Redirect to dashboard if logged in and accessing login/register
  if (currentPath === '/login' || currentPath === '/register') {
    navigate('/dashboard');
    return null;
  }

  const renderCurrentView = () => {
    switch (currentPath) {
      case '/dashboard':
        return <Dashboard onNavigate={navigate} />;
      case '/agent-simulator':
        return <AgentSimulator />;
      case '/passports':
        return <Passports />;
      case '/policies':
        return <Policies />;
      case '/approvals':
        return <Approvals />;
      case '/ledger':
        return <Ledger />;
      case '/incidents':
        return <Incidents />;
      case '/test-lab':
        return <TestLab />;
      case '/system-health':
        return <SystemHealth />;
      case '/demo':
        return <Demo />;
      case '/settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <AppShell currentPath={currentPath} onNavigate={navigate}>
      {renderCurrentView()}
    </AppShell>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
