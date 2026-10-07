import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Cpu, ShieldCheck } from 'lucide-react';

interface TopbarProps {
  currentPath: string;
}

export const Topbar: React.FC<TopbarProps> = ({ currentPath }) => {
  const { user, logout } = useAuth();

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard':
        return 'Executive Security Dashboard';
      case '/agent-simulator':
        return 'RecruitAssist Simulator & Gateway Boundary';
      case '/passports':
        return 'Purpose Passport Management';
      case '/policies':
        return 'Policy Weights & Enforcement Gates';
      case '/approvals':
        return 'Parameter-Bound Approval Queue';
      case '/ledger':
        return 'Data Flow Ledger & Audit Trail';
      case '/incidents':
        return 'Security Incidents & Forensics';
      case '/test-lab':
        return 'Interactive Security Test Lab';
      case '/system-health':
        return 'Subsystem Health & Fallback Telemetry';
      case '/demo':
        return 'Hackathon Competition Demo Controller';
      case '/settings':
        return 'Security Architecture Settings';
      default:
        return 'ScopeSeal AI Platform';
    }
  };

  return (
    <header className="h-16 border-b border-dark-border bg-dark-card/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Route Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-white tracking-tight">
          {getPageTitle(currentPath)}
        </h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono border border-slate-700">
          v1.0.0
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Real-time Gateway Mode Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/60 text-xs">
          <Cpu className="w-3.5 h-3.5 text-seal-400" />
          <span className="text-slate-400">Engine:</span>
          <span className="text-seal-300 font-medium font-mono">Gemini + Deterministic Gate</span>
        </div>

        {/* User Identity Context */}
        <div className="flex items-center gap-3 pl-2 border-l border-dark-border">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-7 h-7 rounded-full bg-seal-950 border border-seal-500/40 flex items-center justify-center text-seal-300">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-slate-200 font-medium text-xs leading-none">
                {user?.email || 'SecOps Lead'}
              </div>
              <div className="text-[10px] text-dark-muted font-mono leading-tight mt-0.5">
                {user?.role || 'authenticated'}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
