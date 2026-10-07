import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { Activity, ShieldCheck, Database, Cpu, Lock, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface SubsystemInfo {
  status: 'pass' | 'degraded' | 'fallback' | 'warn';
  description: string;
  provider?: string;
  configured?: boolean;
  mode?: string;
}

interface ReadinessData {
  status: string;
  overallHealth: string;
  timestamp: string;
  subsystems: Record<string, SubsystemInfo>;
}

export const SystemHealth: React.FC = () => {
  const [data, setData] = useState<ReadinessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const fetchHealth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiRequest<ReadinessData>('/ready');
      setData(res);
      setLastChecked(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to query system health endpoint');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const getSubsystemIcon = (key: string) => {
    switch (key) {
      case 'api':
        return <Activity className="w-5 h-5 text-seal-400" />;
      case 'database':
        return <Database className="w-5 h-5 text-emerald-400" />;
      case 'policyEngine':
        return <ShieldCheck className="w-5 h-5 text-cyan-400" />;
      case 'aiProvider':
        return <Cpu className="w-5 h-5 text-purple-400" />;
      case 'authentication':
        return <Lock className="w-5 h-5 text-amber-400" />;
      default:
        return <CheckCircle className="w-5 h-5 text-seal-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl glass-panel border border-dark-border">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-seal-400" />
            System Health & Fallback Subsystems
          </h2>
          <p className="text-xs text-dark-muted mt-1">
            Real-time telemetry and fail-closed readiness status across the ScopeSeal enforcement boundary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-dark-muted uppercase font-mono">Last Checked</div>
            <div className="text-xs font-mono text-slate-300">
              {lastChecked.toLocaleTimeString()}
            </div>
          </div>
          <button
            onClick={fetchHealth}
            disabled={isLoading}
            className="p-2 rounded-lg bg-dark-card hover:bg-dark-cardHover border border-dark-border text-slate-300 hover:text-white transition-all disabled:opacity-50"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-seal-400' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Subsystem Grid */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(data.subsystems).map(([key, sub]) => {
            const isOptimal = sub.status === 'pass';
            const isFallback = sub.status === 'fallback';

            return (
              <div
                key={key}
                className="glass-panel p-5 rounded-xl border border-dark-border hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                      {getSubsystemIcon(key)}
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase font-medium ${
                        isOptimal
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                          : isFallback
                          ? 'bg-purple-950/60 border-purple-500/40 text-purple-300'
                          : 'bg-amber-950/60 border-amber-500/40 text-amber-400'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white capitalize mb-1">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {sub.description}
                  </p>
                </div>

                {sub.mode && (
                  <div className="mt-4 pt-3 border-t border-dark-border/60 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-dark-muted">Mode</span>
                    <span className="text-cyan-400">{sub.mode}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Security Architecture Guarantees */}
      <div className="p-5 rounded-xl glass-panel border border-dark-border space-y-3">
        <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
          Zero-Trust Security Guarantees
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Fail-Closed Design:</strong> If external AI providers or database connections degrade, enforcement never defaults to open. Actions default to BLOCK.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Deterministic Primacy:</strong> Semantic classification advises risk scores, but deterministic policy engines and parameter hash contracts hold final authority.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
