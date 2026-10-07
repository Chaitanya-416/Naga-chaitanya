import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { PurposePassport, DataFlowEvent, Incident, Approval } from '@scopeseal/shared';
import { ThreatStatusBadge } from '../components/common/ThreatStatusBadge';
import { DashboardMetricCard } from '../components/dashboard/DashboardMetricCard';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Bot,
  FileKey2,
  ListOrdered,
  ArrowUpRight,
  Sparkles,
  Play,
  CheckSquare,
  Clock,
  RefreshCw,
  Database,
  Lock
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (path: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [passports, setPassports] = useState<PurposePassport[]>([]);
  const [events, setEvents] = useState<DataFlowEvent[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [passportsData, eventsData, incidentsData, approvalsData] = await Promise.all([
        apiRequest<PurposePassport[]>('/passports').catch(() => []),
        apiRequest<DataFlowEvent[]>('/ledger').catch(() => []),
        apiRequest<Incident[]>('/incidents').catch(() => []),
        apiRequest<Approval[]>('/approvals').catch(() => [])
      ]);

      setPassports(passportsData);
      setEvents(eventsData);
      setIncidents(incidentsData);
      setApprovals(approvalsData);
    } catch (err) {
      console.warn('Dashboard fetch error', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalActions = events.length;
  const allowedActions = events.filter((e) => e.decision === 'ALLOW').length;
  const reviewActions = events.filter((e) => e.decision === 'REVIEW').length;
  const blockedActions = events.filter((e) => e.decision === 'BLOCK').length;
  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING').length;
  const recentEvents = events.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-seal-950/80 via-dark-card to-slate-900 border border-seal-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-seal-900/60 border border-seal-500/40 text-seal-300 text-xs mb-3 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-seal-400" />
              <span>AI Purpose-Bound Runtime Firewall Active</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              ScopeSeal AI Executive Security Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              “Traditional access control answers WHO can access data. ScopeSeal adds WHY, WHAT, WHERE, and WHEN.”
              Deterministic runtime protection against purpose drift, prompt injection, and data exfiltration.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-5">
              <button
                onClick={() => onNavigate('/agent-simulator')}
                className="px-4 py-2 rounded-lg bg-seal-600 hover:bg-seal-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-seal-600/30 transition-all"
              >
                <Bot className="w-4 h-4" />
                <span>Launch RecruitAssist Simulator</span>
              </button>
              <button
                onClick={() => onNavigate('/test-lab')}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium text-xs flex items-center gap-2 transition-all"
              >
                <Play className="w-4 h-4 text-seal-400" />
                <span>Run Attack Lab Scenarios</span>
              </button>
            </div>
          </div>

          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-lg bg-dark-card hover:bg-dark-cardHover border border-dark-border text-slate-300 self-start md:self-auto"
            title="Refresh Live Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-seal-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row (Real Database Data) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardMetricCard
          title="Actions Analyzed"
          value={totalActions}
          subtitle="Intercepted at gateway"
          icon={ListOrdered}
          accentColor="seal"
        />
        <DashboardMetricCard
          title="Allowed Actions"
          value={allowedActions}
          subtitle="Within authorized purpose"
          icon={ShieldCheck}
          accentColor="emerald"
        />
        <DashboardMetricCard
          title="Review Pending"
          value={reviewActions || pendingApprovals}
          subtitle="Awaiting human signature"
          icon={AlertTriangle}
          accentColor="amber"
        />
        <DashboardMetricCard
          title="Violations Blocked"
          value={blockedActions}
          subtitle="Drift & attacks halted"
          icon={ShieldAlert}
          accentColor="rose"
        />
      </div>

      {/* Passports, Approvals & Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Purpose Passports (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-xl border border-dark-border flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileKey2 className="w-4 h-4 text-seal-400" />
                Active Purpose Passports
              </h3>
              <span className="text-xs font-mono text-slate-400">{passports.length} Active</span>
            </div>
            <p className="text-xs text-dark-muted mb-4">
              Cryptographically verifiable boundaries defining permissible agent intent, tool sets, and target schemas.
            </p>

            <div className="space-y-2">
              {passports.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-lg bg-dark-card border border-dark-border flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-medium text-white font-mono">{p.passport_code}</div>
                    <div className="text-[10px] text-dark-muted truncate max-w-[220px]">
                      {p.authorized_purpose}
                    </div>
                  </div>
                  <ThreatStatusBadge level={p.sensitivity_level} decision="ACTIVE" size="sm" />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('/passports')}
            className="text-xs text-seal-400 hover:text-seal-300 font-medium flex items-center gap-1 transition-colors pt-2"
          >
            <span>Manage Purpose Passports</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recent Ledger Activity (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-xl border border-dark-border space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-dark-border">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-seal-400" />
              Recent Data Flow Ledger Activity
            </h3>
            <button
              onClick={() => onNavigate('/ledger')}
              className="text-xs text-seal-400 hover:text-seal-300 font-medium flex items-center gap-1 transition-colors"
            >
              <span>View Full Ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-3 rounded-lg bg-dark-card border border-dark-border flex items-center justify-between text-xs font-mono"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-200">
                    <span className="font-bold text-white">{evt.tool}</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-seal-400 truncate max-w-[180px]">{evt.destination}</span>
                  </div>
                  <div className="text-[10px] text-dark-muted font-sans line-clamp-1">
                    "{evt.purpose}"
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ThreatStatusBadge
                    score={evt.risk}
                    decision={evt.decision}
                    size="sm"
                  />
                  <span className="text-[10px] text-dark-muted hidden sm:inline">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}

            {recentEvents.length === 0 && (
              <div className="p-8 text-center text-xs text-dark-muted">
                No ledger activity recorded yet. Run an action in the Simulator or Demo Mode to see real-time events.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
