import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { Policy, PolicyWeights, PolicyThresholds, SimulationResult } from '@scopeseal/shared';
import { SlidersHorizontal, Save, Sparkles, RefreshCw, AlertCircle, ShieldCheck, Play } from 'lucide-react';
import { ThreatStatusBadge } from '../components/common/ThreatStatusBadge';

export const Policies: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [activePolicy, setActivePolicy] = useState<Policy | null>(null);
  const [weights, setWeights] = useState<PolicyWeights>({
    PURPOSE_MISMATCH: 25,
    SENSITIVE_DATA_EXPOSURE: 20,
    EXTERNAL_DESTINATION: 15,
    HIGH_IMPACT_OPERATION: 15,
    UNTRUSTED_INSTRUCTION_SOURCE: 10,
    EXCESSIVE_SCOPE: 10,
    MISSING_OR_INVALID_APPROVAL: 5
  });
  const [thresholds, setThresholds] = useState<PolicyThresholds>({
    LOW_MAX: 30,
    MEDIUM_MAX: 60,
    HIGH_MAX: 80
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchPolicies = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<Policy[]>('/policies');
      setPolicies(data);
      if (data.length > 0) {
        setActivePolicy(data[0]);
        setWeights(data[0].weights);
        setThresholds(data[0].thresholds);
      }
    } catch (err: any) {
      console.warn('Failed to load policies', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleSaveProductionPolicy = async () => {
    if (!activePolicy) return;
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const updated = await apiRequest<Policy>(`/policies/${activePolicy.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          weights,
          thresholds
        })
      });
      setActivePolicy(updated);
      setStatusMessage('Production security policy successfully saved and activated.');
    } catch (err: any) {
      alert(err.message || 'Failed to save policy');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setStatusMessage(null);
    try {
      const sim = await apiRequest<SimulationResult>('/policy-simulation/run', {
        method: 'POST',
        body: JSON.stringify({
          originalAction: {
            agentId: 'recruit-assist',
            passportCode: 'PSP-HR-SCREEN-2026',
            userGoal: 'Export candidate report to third-party agency.',
            proposedTool: 'export_report',
            proposedDestination: 'https://agency.test/upload',
            parameters: { format: 'CSV' }
          },
          modifiedPolicy: {
            weights,
            thresholds,
            trustedDestinations: ['https://agency.test/upload'],
            allowedOperations: ['export_report']
          }
        })
      });

      setSimulationResult(sim);
    } catch (err: any) {
      alert(err.message || 'Simulation failed');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl glass-panel border border-dark-border">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-seal-400" />
            Deterministic Policy Engine & Simulation Sandbox
          </h2>
          <p className="text-xs text-dark-muted mt-1">
            Configure risk factor weights, threshold brackets, and simulate policy adjustments before production deployment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPolicies}
            className="p-2 rounded-lg bg-dark-card hover:bg-dark-cardHover border border-dark-border text-slate-300"
            title="Reset to current"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-seal-400' : ''}`} />
          </button>
          <button
            onClick={handleSaveProductionPolicy}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-seal-600 hover:bg-seal-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-seal-600/30 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Deploying...' : 'Save Production Policy'}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Weight & Threshold Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Factor Weights Card */}
          <div className="glass-panel p-5 rounded-xl border border-dark-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-dark-border">
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                Risk Factor Weights (Sum = Max Potential Risk)
              </span>
              <span className="text-xs font-mono text-seal-400">
                Sum:{' '}
                {Object.values(weights).reduce((a, b) => a + b, 0)}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {Object.entries(weights).map(([factor, val]) => (
                <div key={factor} className="space-y-1">
                  <div className="flex items-center justify-between text-slate-300 font-mono text-[11px]">
                    <span>{factor}</span>
                    <span className="font-bold text-seal-400">{val} pts</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={val}
                    onChange={(e) =>
                      setWeights({ ...weights, [factor]: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-seal-500 bg-dark-card h-1.5 rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Decision Thresholds Card */}
          <div className="glass-panel p-5 rounded-xl border border-dark-border space-y-4">
            <span className="text-xs font-semibold text-white uppercase tracking-wider block pb-2 border-b border-dark-border">
              Decision Level Thresholds (0 - 100)
            </span>

            <div className="grid grid-cols-3 gap-3 text-xs text-center">
              <div className="p-3 rounded-lg bg-dark-card border border-dark-border space-y-1">
                <span className="text-[10px] text-emerald-400 font-mono uppercase block">
                  LOW RISK (ALLOW)
                </span>
                <span className="text-sm font-mono font-bold text-white">0 – {thresholds.LOW_MAX}</span>
                <input
                  type="range"
                  min="10"
                  max="45"
                  value={thresholds.LOW_MAX}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, LOW_MAX: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-emerald-500 mt-2"
                />
              </div>

              <div className="p-3 rounded-lg bg-dark-card border border-dark-border space-y-1">
                <span className="text-[10px] text-amber-400 font-mono uppercase block">
                  MEDIUM RISK
                </span>
                <span className="text-sm font-mono font-bold text-white">
                  {thresholds.LOW_MAX + 1} – {thresholds.MEDIUM_MAX}
                </span>
                <input
                  type="range"
                  min="46"
                  max="70"
                  value={thresholds.MEDIUM_MAX}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, MEDIUM_MAX: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-amber-500 mt-2"
                />
              </div>

              <div className="p-3 rounded-lg bg-dark-card border border-dark-border space-y-1">
                <span className="text-[10px] text-orange-400 font-mono uppercase block">
                  HIGH (REVIEW)
                </span>
                <span className="text-sm font-mono font-bold text-white">
                  {thresholds.MEDIUM_MAX + 1} – {thresholds.HIGH_MAX}
                </span>
                <input
                  type="range"
                  min="71"
                  max="90"
                  value={thresholds.HIGH_MAX}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, HIGH_MAX: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-orange-500 mt-2"
                />
              </div>
            </div>
            <div className="text-[11px] text-rose-400 font-mono text-center pt-1">
              CRITICAL RISK (BLOCK): {thresholds.HIGH_MAX + 1} – 100
            </div>
          </div>
        </div>

        {/* Right: Policy Simulation / What-If Sandbox (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 rounded-xl border border-seal-500/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-dark-border">
              <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                What-If Policy Simulation
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300">
                Sandbox Mode
              </span>
            </div>

            <p className="text-xs text-dark-muted leading-relaxed">
              Test how temporary policy tweaks alter verdicts on proposed actions without executing tools or altering live configurations.
            </p>

            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full py-2.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isSimulating ? 'Simulating Impact...' : 'Run Simulation on Test Payload'}</span>
            </button>

            {simulationResult && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-dark-muted font-mono">Simulated Decision:</span>
                  <ThreatStatusBadge
                    level={simulationResult.simulatedRiskLevel}
                    decision={simulationResult.simulatedDecision}
                    size="sm"
                  />
                </div>

                <div className="flex items-center justify-between font-mono">
                  <span className="text-dark-muted">Baseline vs Simulated:</span>
                  <span className="text-white">
                    {simulationResult.baselineRiskScore} → {simulationResult.simulatedRiskScore} (
                    <span
                      className={
                        simulationResult.scoreDelta < 0 ? 'text-emerald-400' : 'text-rose-400'
                      }
                    >
                      {simulationResult.scoreDelta > 0 ? `+${simulationResult.scoreDelta}` : simulationResult.scoreDelta}
                    </span>
                    )
                  </span>
                </div>

                <div className="flex items-center justify-between font-mono">
                  <span className="text-dark-muted">Decision Altered:</span>
                  <span className={simulationResult.decisionChanged ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                    {simulationResult.decisionChanged ? 'YES (Impact Detected)' : 'NO (Unchanged)'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed font-mono">
                  ⚠️ {simulationResult.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
