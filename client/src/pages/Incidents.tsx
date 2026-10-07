import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { Incident } from '@scopeseal/shared';
import { ThreatStatusBadge } from '../components/common/ThreatStatusBadge';
import {
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  Search,
  Clock,
  Terminal,
  ShieldCheck,
  FileText,
  X
} from 'lucide-react';

export const Incidents: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<Incident[]>('/incidents');
      setIncidents(data);
    } catch (err: any) {
      console.warn('Failed to load incidents', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl glass-panel border border-dark-border">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Security Incidents & Forensics
          </h2>
          <p className="text-xs text-dark-muted mt-1">
            Forensic investigation records for blocked prompt injections, data exfiltration attempts, and parameter tampering.
          </p>
        </div>

        <button
          onClick={fetchIncidents}
          className="p-2 rounded-lg bg-dark-card hover:bg-dark-cardHover border border-dark-border text-slate-300 self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-seal-400' : ''}`} />
        </button>
      </div>

      {/* Incidents Table / Cards */}
      <div className="space-y-3">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="glass-panel p-5 rounded-xl border border-dark-border hover:border-rose-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-white">
                  {incident.title}
                </span>
                <ThreatStatusBadge level={incident.severity} size="sm" />
              </div>

              <div className="text-xs text-slate-300">
                {incident.description}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-dark-muted pt-1">
                <span>Category: <strong className="text-rose-400">{incident.category}</strong></span>
                <span>Logged: {new Date(incident.created_at).toLocaleString()}</span>
                {incident.ledger_event_id && (
                  <span>Ledger ID: {incident.ledger_event_id.slice(0, 8)}...</span>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedIncident(incident)}
              className="px-3.5 py-1.5 rounded-lg bg-dark-card hover:bg-slate-800 border border-dark-border text-slate-300 text-xs font-medium self-start md:self-center transition-colors"
            >
              Inspect Forensics
            </button>
          </div>
        ))}

        {incidents.length === 0 && !isLoading && (
          <div className="glass-panel p-10 rounded-xl border border-dark-border text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-semibold text-white">Zero Active Incidents</h3>
            <p className="text-xs text-dark-muted max-w-sm mx-auto">
              No security violations recorded yet. Run attack scenarios in the Test Lab or Simulator to inspect incident logs.
            </p>
          </div>
        )}
      </div>

      {/* Forensic Drawer Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="glass-panel p-6 rounded-2xl border border-dark-border w-full max-w-2xl shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-dark-border">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold text-white">
                  Forensic Incident Investigation
                </h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-dark-muted font-mono uppercase block mb-1">
                  Incident Title & Category
                </span>
                <div className="text-white font-semibold">{selectedIncident.title}</div>
                <div className="text-rose-400 font-mono text-[11px] mt-0.5">
                  {selectedIncident.category}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-dark-muted font-mono uppercase block mb-1">
                  Remediation Instructions
                </span>
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 leading-relaxed">
                  {selectedIncident.remediation}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-dark-muted font-mono uppercase block mb-1">
                  Forensic Metadata Payload
                </span>
                <pre className="p-3 rounded-lg bg-dark-card border border-dark-border text-[11px] font-mono text-slate-300 overflow-x-auto max-h-56">
                  {JSON.stringify(selectedIncident.forensic_metadata, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-dark-border">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 rounded-lg bg-dark-card hover:bg-slate-800 text-slate-300 text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
