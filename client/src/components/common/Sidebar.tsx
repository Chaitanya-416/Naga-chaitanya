import React from 'react';
import {
  Shield,
  LayoutDashboard,
  Bot,
  FileKey2,
  SlidersHorizontal,
  CheckSquare,
  ListOrdered,
  AlertTriangle,
  FlaskConical,
  Activity,
  PlayCircle,
  Settings,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const navSections: NavSection[] = [
    {
      title: 'RUNTIME CONTROLS',
      items: [
        { label: 'Executive Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Agent Simulator', path: '/agent-simulator', icon: Bot, badge: 'RecruitAssist' },
        { label: 'Purpose Passports', path: '/passports', icon: FileKey2 },
        { label: 'Policy Engine', path: '/policies', icon: SlidersHorizontal },
        { label: 'Approval Queue', path: '/approvals', icon: CheckSquare }
      ]
    },
    {
      title: 'AUDIT & FORENSICS',
      items: [
        { label: 'Data Flow Ledger', path: '/ledger', icon: ListOrdered },
        { label: 'Incident History', path: '/incidents', icon: AlertTriangle }
      ]
    },
    {
      title: 'SIMULATION & LAB',
      items: [
        { label: 'Security Test Lab', path: '/test-lab', icon: FlaskConical, badge: '9 Scenarios' },
        { label: 'Competition Demo', path: '/demo', icon: PlayCircle, highlight: true }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'System Health', path: '/system-health', icon: Activity },
        { label: 'Settings', path: '/settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="w-64 border-r border-dark-border bg-dark-card flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-dark-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-seal-500 to-seal-700 flex items-center justify-center shadow-lg shadow-seal-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              ScopeSeal <span className="text-seal-400 font-mono text-xs px-1.5 py-0.5 rounded bg-seal-950/80 border border-seal-500/30">AI</span>
            </div>
            <div className="text-[11px] text-dark-muted font-medium">Purpose-Bound Firewall</div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-dark-muted uppercase">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => onNavigate(item.path)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-seal-600 text-white shadow-md shadow-seal-600/25 font-semibold'
                        : item.highlight
                        ? 'text-seal-300 hover:bg-seal-950/40 hover:text-white border border-seal-500/30'
                        : 'text-slate-300 hover:bg-dark-cardHover hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-white'
                            : item.highlight
                            ? 'text-seal-400'
                            : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          isActive
                            ? 'bg-seal-700 text-seal-100'
                            : 'bg-dark-border text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {item.highlight && !item.badge && (
                      <Sparkles className="w-3.5 h-3.5 text-seal-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Enforcement Status Footer */}
      <div className="p-3 border-t border-dark-border bg-dark-bg/60 m-2 rounded-lg border">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 text-[11px] font-medium">Gateway Boundary</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            ENFORCING
          </span>
        </div>
        <div className="text-[10px] text-dark-muted font-mono leading-tight">
          Deterministic Zero-Trust Active
        </div>
      </div>
    </aside>
  );
};
