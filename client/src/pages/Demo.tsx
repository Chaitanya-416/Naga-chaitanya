import React, { useState } from 'react';
import { apiRequest } from '../lib/api';
import { ThreatStatusBadge } from '../components/common/ThreatStatusBadge';
import {
  PlayCircle,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ListOrdered,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Zap,
  Lock
} from 'lucide-react';

interface DemoProps {
  onNavigate?: (path: string) => void;
}

export const Demo: React.FC<DemoProps> = ({ onNavigate }) => {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleResetDemo = async () => {
    setIsRunning(true);
    setStatusText('Resetting demo environment to initial seed state...');
    try {
      await apiRequest('/demo/reset', { method: 'POST' });
      setActiveStep('RESET');
      setStatusText('Demo environment successfully reset. Ready for live presentation sequence.');
      setLastResult(null);
    } catch (err: any) {
      setStatusText(`Reset failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunSafeFlow = async () => {
    setIsRunning(true);
    setStatusText('Running FLOW B: User authorized candidate screening (Safe read_resume)...');
    try {
      const res = await apiRequest('/demo/run-safe-flow', { method: 'POST' });
      setActiveStep('SAFE');
      setLastResult(res);
      setStatusText(
        `Safe Action verified! Decision: ${res.evaluation.decision} (Risk: ${res.evaluation.riskScore}/100). Tool executed and logged to Ledger.`
      );
    } catch (err: any) {
      setStatusText(`Safe flow failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunAttackFlow = async () => {
    setIsRunning(true);
    setStatusText('Running FLOW C: Resume prompt injection attempting complete database exfiltration...');
    try {
      const res = await apiRequest('/demo/run-attack-flow', { method: 'POST' });
      setActiveStep('ATTACK');
      setLastResult(res);
      setStatusText(
        `Attack Halted! Decision: ${res.evaluation.decision} (Risk: ${res.evaluation.riskScore}/100). Tool execution blocked, security incident logged.`
      );
    } catch (err: any) {
      setStatusText(`Attack flow failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunDriftFlow = async () => {
    setIsRunning(true);
    setStatusText('Running FLOW D: Autonomous Purpose Drift (Agent invokes unsolicited external email tool)...');
    try {
      const res = await apiRequest('/demo/run-drift-flow', { method: 'POST' });
      setActiveStep('DRIFT');
      setLastResult(res);
      setStatusText(
        `Purpose Drift Intercepted! Decision: ${res.evaluation.decision} (Risk: ${res.evaluation.riskScore}/100).`
      );
    } catch (err: any) {
      setStatusText(`Drift flow failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunApprovalFlow = async () => {
    setIsRunning(true);
    setStatusText('Running FLOW E: High-impact external report -> REVIEW -> APPROVED -> EXECUTED...');
    try {
      const res = await apiRequest('/demo/run-approval-flow', { method: 'POST' });
      setActiveStep('APPROVAL');
      setLastResult(res);
      setStatusText(
        `Approval Sequence Completed! Action evaluated, approved by officer, executed, and ticket marked USED.`
      );
    } catch (err: any) {
      setStatusText(`Approval flow failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunTamperFlow = async () => {
    setIsRunning(true);
    setStatusText('Running FLOW F: Attacker tampers destination parameter after approval -> Anti-Tamper Gate...');
    try {
      const res = await apiRequest('/demo/run-tamper-flow', { method: 'POST' });
      setActiveStep('TAMPER');
      setLastResult(res);
      setStatusText(
        `Parameter Tampering Halted! Decision: ${res.execution.decision}. Hash mismatch detected between approved and executed payload.`
      );
    } catch (err: any) {
      setStatusText(`Tamper flow failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-seal-950/90 via-dark-card to-slate-900 border border-seal-500/40 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-seal-900/60 border border-seal-500/40 text-seal-300 text-xs mb-3 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-seal-400" />
            <span>Hackathon Competition Stage Controller</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            1-Click Deterministic Presentation Sequence
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Execute full end-to-end user and attack flows designed for competition judges and live demo reviews.
            Demonstrates Purpose Passports, Semantic Drift detection, Anti-Tampering, and immutable Ledger audit trails.
          </p>
        </div>
      </div>

      {/* Controller Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Step 1: Reset */}
        <button
          onClick={handleResetDemo}
          disabled={isRunning}
          className="p-5 rounded-xl glass-panel border border-dark-border hover:border-slate-600 transition-all text-left space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-dark-muted uppercase font-bold">Step 1</span>
            <RotateCcw className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform" />
          </div>
          <div className="text-sm font-bold text-white">Reset Demo Environment</div>
          <div className="text-xs text-dark-muted">
            Cleans historical events and primes synthetic candidate database.
          </div>
        </button>

        {/* Step 2: Safe Flow */}
        <button
          onClick={handleRunSafeFlow}
          disabled={isRunning}
          className="p-5 rounded-xl glass-panel border border-emerald-500/30 hover:border-emerald-500/60 transition-all text-left space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Step 2 (Safe)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-white">Run Safe Screening Action</div>
          <div className="text-xs text-dark-muted">
            Authorized read_resume within Purpose Passport → ALLOW.
          </div>
        </button>

        {/* Step 3: Attack Flow */}
        <button
          onClick={handleRunAttackFlow}
          disabled={isRunning}
          className="p-5 rounded-xl glass-panel border border-rose-500/30 hover:border-rose-500/60 transition-all text-left space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">Step 3 (Attack)</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-sm font-bold text-white">Run Prompt Injection Attack</div>
          <div className="text-xs text-dark-muted">
            Resume injects instruction override → Risk 90+ BLOCK + Incident.
          </div>
        </button>

        {/* Step 4: Purpose Drift */}
        <button
          onClick={handleRunDriftFlow}
          disabled={isRunning}
          className="p-5 rounded-xl glass-panel border border-purple-500/30 hover:border-purple-500/60 transition-all text-left space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">Step 4 (Drift)</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-white">Run Purpose Drift Flow</div>
          <div className="text-xs text-dark-muted">
            Agent proposes unsolicited marketing email → Intercepted & Blocked.
          </div>
        </button>

        {/* Step 5: Approval Flow */}
        <button
          onClick={handleRunApprovalFlow}
          disabled={isRunning}
          className="p-5 rounded-xl glass-panel border border-seal-500/30 hover:border-seal-500/60 transition-all text-left space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-seal-400 uppercase font-bold">Step 5 (Approval)</span>
            <CheckCircle2 className="w-4 h-4 text-seal-400" />
          </div>
          <div className="text-sm font-bold text-white">Run Approval Workflow</div>
          <div className="text-xs text-dark-muted">
            External report requires review → Human approves → Single-use execute.
          </div>
        </button>

        {/* Step 6: Tamper Flow */}
        <button
          onClick={handleRunTamperFlow}
          disabled={isRunning}
          className="p-5 rounded-xl glass-panel border border-amber-500/30 hover:border-amber-500/60 transition-all text-left space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">Step 6 (Tamper)</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-sm font-bold text-white">Run Approval Tamper Test</div>
          <div className="text-xs text-dark-muted">
            Modify destination after approval → Hash mismatch BLOCK.
          </div>
        </button>
      </div>

      {/* Live Status Output Box */}
      {statusText && (
        <div className="p-4 rounded-xl glass-panel border border-dark-border space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white uppercase font-mono">Demo Telemetry Log</span>
            {lastResult?.evaluation && (
              <ThreatStatusBadge
                score={lastResult.evaluation.riskScore}
                decision={lastResult.evaluation.decision}
                size="sm"
              />
            )}
          </div>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            {statusText}
          </p>

          {lastResult && (
            <pre className="p-3 rounded-lg bg-dark-card border border-dark-border text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
              {JSON.stringify(lastResult, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* Quick Navigation to Evidence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="/incidents"
          onClick={(e) => {
            if (onNavigate) {
              e.preventDefault();
              onNavigate('/incidents');
            }
          }}
          className="p-4 rounded-xl glass-panel border border-dark-border hover:border-rose-500/40 transition-all flex items-center justify-between text-xs group"
        >
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span className="font-semibold text-white">Open Incident Investigation Log</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </a>

        <a
          href="/ledger"
          onClick={(e) => {
            if (onNavigate) {
              e.preventDefault();
              onNavigate('/ledger');
            }
          }}
          className="p-4 rounded-xl glass-panel border border-dark-border hover:border-seal-500/40 transition-all flex items-center justify-between text-xs group"
        >
          <div className="flex items-center gap-2.5">
            <ListOrdered className="w-4 h-4 text-seal-400" />
            <span className="font-semibold text-white">Open Immutable Data Flow Ledger</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  );
};
