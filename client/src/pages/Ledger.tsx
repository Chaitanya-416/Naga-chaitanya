import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { DataFlowEvent, Decision } from '@scopeseal/shared';
import { ThreatStatusBadge } from '../components/common/ThreatStatusBadge';
import {
  ListOrdered,
  RefreshCw,
  Search,
  Filter,
  Hash,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Terminal,
  Database
} from 'lucide-react';

export const Ledger: React.FC = () => {
  const [events, setEvents] = useState<DataFlowEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDecision, setFilterDecision] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<DataFlowEvent | null>(null);

  const fetchLedger = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<DataFlowEvent[]>('/ledger');
      setEvents(data);
      if (data.length > 0 && !selectedEvent) {
        setSelectedEvent(data[0]);
      }
    } catch (err: any) {
      console.warn('Failed to load ledger', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const filteredEvents = events.filter((e) => {
    if (filterDecision !== 'ALL' && e.decision !== filterDecision) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.tool.toLowerCase().includes(q) ||
        e.destination.toLowerCase().includes(q) ||
        e.purpose.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl glass-panel border border-dark-border">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-seal-400" />
            Data Flow Ledger & Audit Trail
          </h2>
          <p className="text-xs text-dark-muted mt-1">
            Immutable chronological ledger tracing agent requests, purpose compliance, risk scores, and execution verdicts.
          </p>
        </div>

        <button
          onClick={fetchLedger}
          className="p-2 rounded-lg bg-dark-card hover:bg-dark-cardHover border border-dark-border text-slate-300 self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-seal-400' : ''}`} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by tool, destination, or purpose..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-dark-card border border-dark-border text-white focus:border-seal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-dark-muted" />
          {['ALL', 'ALLOW', 'REVIEW', 'BLOCK'].map((d) => (
            <button
              key={d}
              onClick={() => setFilterDecision(d)}
              className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition-colors ${
                filterDecision === d
                  ? 'bg-seal-600 text-white font-semibold shadow-md shadow-seal-600/30'
                  : 'bg-dark-card text-slate-400 hover:text-white border border-dark-border'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Column Ledger Layout: Timeline list on left, Inspector on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline Events List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {filteredEvents.map((evt) => {
            const isSelected = selectedEvent?.id === evt.id;

            return (
              <div
                key={evt.id}
                onClick={() => setSelectedEvent(evt)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-dark-cardHover border-seal-500/80 shadow-lg shadow-seal-500/10'
                    : 'glass-panel border-dark-border hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-white">
                      {evt.tool}
                    </span>
                    <span className="text-slate-500 text-xs">→</span>
                    <span className="font-mono text-xs text-seal-400 truncate max-w-[200px]">
                      {evt.destination}
                    </span>
                  </div>

                  <ThreatStatusBadge
                    score={evt.risk}
                    decision={evt.decision}
                    size="sm"
                  />
                </div>

                <div className="text-xs text-slate-300 line-clamp-1 mb-2 font-sans">
                  "{evt.purpose}"
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-dark-muted pt-2 border-t border-dark-border/60">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="uppercase text-slate-400">
                    Status: {evt.execution_status}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredEvents.length === 0 && !isLoading && (
            <div className="glass-panel p-10 rounded-xl border border-dark-border text-center text-xs text-dark-muted">
              No ledger events found matching the selected filter.
            </div>
          )}
        </div>

        {/* Detailed Event Inspector (5 cols) */}
        <div className="lg:col-span-5">
          {selectedEvent ? (
            <div className="glass-panel p-5 rounded-xl border border-dark-border space-y-4 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-dark-border">
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  Event Forensic Inspector
                </span>
                <span className="text-[10px] font-mono text-dark-muted">
                  ID: {selectedEvent.id.slice(0, 8)}...
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-dark-muted font-mono uppercase block mb-0.5">
                    Authorized Purpose
                  </span>
                  <p className="text-slate-200 font-medium">"{selectedEvent.purpose}"</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-dark-card border border-dark-border">
                    <span className="text-[10px] text-dark-muted font-mono uppercase block">Tool</span>
                    <span className="font-mono text-white text-xs font-bold">{selectedEvent.tool}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-dark-card border border-dark-border">
                    <span className="text-[10px] text-dark-muted font-mono uppercase block">Risk Score</span>
                    <span className="font-mono text-white text-xs font-bold">{selectedEvent.risk}/100</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-dark-muted font-mono uppercase block mb-0.5">
                    Target Destination
                  </span>
                  <div className="p-2 rounded bg-slate-950 font-mono text-emerald-400 text-xs break-all border border-slate-800">
                    {selectedEvent.destination}
                  </div>
                </div>

                {selectedEvent.parameter_hash && (
                  <div>
                    <span className="text-[10px] text-dark-muted font-mono uppercase block mb-0.5">
                      Parameter SHA-256 Hash
                    </span>
                    <div className="p-2 rounded bg-slate-950 font-mono text-cyan-400 text-[11px] break-all border border-slate-800">
                      {selectedEvent.parameter_hash}
                    </div>
                  </div>
                )}

                {selectedEvent.metadata && (
                  <div>
                    <span className="text-[10px] text-dark-muted font-mono uppercase block mb-0.5">
                      Audit Metadata
                    </span>
                    <pre className="p-2.5 rounded bg-dark-card border border-dark-border text-[11px] font-mono text-slate-300 overflow-x-auto max-h-36">
                      {JSON.stringify(selectedEvent.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-xl border border-dark-border text-center text-xs text-dark-muted">
              Select an event to inspect its cryptographic metadata and policy verdict.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
