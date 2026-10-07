import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { Approval } from '@scopeseal/shared';
import { ThreatStatusBadge } from '../components/common/ThreatStatusBadge';
import {
  CheckSquare,
  Check,
  X,
  Hash,
  Clock,
  RefreshCw,
  AlertTriangle,
  Play,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

export const Approvals: React.FC = () => {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchApprovals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest<Approval[]>('/approvals');
      setApprovals(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load approvals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (id: string) => {
    setError(null);
    setActionSuccess(null);
    try {
      await apiRequest(`/approvals/${id}/approve`, { method: 'POST' });
      setActionSuccess('Action approved for single-use cryptographic execution.');
      await fetchApprovals();
    } catch (err: any) {
      setError(err.message || 'Approval failed');
    }
  };

  const handleReject = async (id: string) => {
    setError(null);
    setActionSuccess(null);
    try {
      await apiRequest(`/approvals/${id}/reject`, { method: 'POST' });
      setActionSuccess('Action rejected.');
      await fetchApprovals();
    } catch (err: any) {
      setError(err.message || 'Rejection failed');
    }
  };

  const handleExecuteApproved = async (approval: Approval) => {
    setError(null);
    setActionSuccess(null);
    try {
      const res = await apiRequest('/gateway/execute-action', {
        method: 'POST',
        body: JSON.stringify({
          agentId: approval.agent_id,
          passportCode: 'PSP-HR-SCREEN-2026',
          userGoal: 'Execute approved request',
          proposedTool: approval.tool_id,
          proposedDestination: approval.target,
          parameters: approval.normalized_parameters,
          parameterHash: approval.parameter_hash,
          approvalId: approval.id
        })
      });

      setActionSuccess(`Tool executed successfully! Output: ${JSON.stringify(res.toolOutput?.message || res)}`);
      await fetchApprovals();
    } catch (err: any) {
      setError(err.message || 'Execution failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl glass-panel border border-dark-border">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-seal-400" />
            Parameter-Bound Approval Queue
          </h2>
          <p className="text-xs text-dark-muted mt-1">
            Single-use cryptographic approval tickets bound to exact actor, tool, target, and SHA-256 parameter hashes.
          </p>
        </div>

        <button
          onClick={fetchApprovals}
          className="p-2 rounded-lg bg-dark-card hover:bg-dark-cardHover border border-dark-border text-slate-300 self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-seal-400' : ''}`} />
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Approvals List */}
      <div className="space-y-4">
        {approvals.map((approval) => {
          const isPending = approval.status === 'PENDING';
          const isApproved = approval.status === 'APPROVED';
          const isExpired = new Date(approval.expires_at).getTime() < Date.now();

          return (
            <div
              key={approval.id}
              className="glass-panel p-5 rounded-xl border border-dark-border hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-dark-border/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-seal-950/80 border border-seal-500/40 flex items-center justify-center text-seal-300">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold font-mono text-white">
                      {approval.tool_id} → {approval.target}
                    </div>
                    <div className="text-[11px] text-dark-muted font-mono">
                      Agent: {approval.agent_id} • Created: {new Date(approval.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ThreatStatusBadge
                    score={approval.risk_score}
                    decision={approval.status}
                    size="sm"
                  />
                </div>
              </div>

              {/* Parameters & Parameter Hash */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-dark-card border border-dark-border space-y-1">
                  <span className="text-[10px] text-dark-muted font-mono uppercase block">
                    Normalized Parameters
                  </span>
                  <pre className="font-mono text-slate-300 text-[11px] overflow-x-auto">
                    {JSON.stringify(approval.normalized_parameters, null, 2)}
                  </pre>
                </div>

                <div className="p-3 rounded-lg bg-dark-card border border-dark-border space-y-2">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px]">
                    <Hash className="w-3.5 h-3.5 shrink-0" />
                    <span>Cryptographic SHA-256 Binding:</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-300 break-all bg-slate-950 p-2 rounded border border-slate-800">
                    {approval.parameter_hash}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-dark-muted" />
                    <span>Expires: {new Date(approval.expires_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* Reasons */}
              {approval.reasons.length > 0 && (
                <div className="text-xs text-slate-400">
                  <span className="font-medium text-slate-300">Review Rationale: </span>
                  {approval.reasons.join('; ')}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {isPending && !isExpired && (
                  <>
                    <button
                      onClick={() => handleReject(approval.id)}
                      className="px-3 py-1.5 rounded-lg bg-dark-card hover:bg-rose-950/60 hover:text-rose-300 border border-dark-border text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(approval.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-seal-600 hover:bg-seal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-seal-600/30 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Request</span>
                    </button>
                  </>
                )}

                {isApproved && (
                  <button
                    onClick={() => handleExecuteApproved(approval)}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Execute Approved Action</span>
                  </button>
                )}

                {approval.status === 'USED' && (
                  <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    USED & RETIRED
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {approvals.length === 0 && !isLoading && (
          <div className="glass-panel p-10 rounded-xl border border-dark-border text-center space-y-2">
            <CheckSquare className="w-10 h-10 text-dark-muted mx-auto" />
            <h3 className="text-sm font-semibold text-white">Approval Queue Empty</h3>
            <p className="text-xs text-dark-muted max-w-sm mx-auto">
              High-impact actions intercepted by the ScopeSeal Gateway will appear here for cryptographic review.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
