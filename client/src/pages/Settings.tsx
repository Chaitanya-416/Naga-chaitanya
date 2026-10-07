import React from 'react';
import { Settings as SettingsIcon, ShieldCheck, Key, Lock, EyeOff } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="p-5 rounded-xl glass-panel border border-dark-border">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-seal-400" />
          System Settings & Cryptographic Integrity
        </h2>
        <p className="text-xs text-dark-muted mt-1">
          Tenant identity parameters, fail-closed policy enforcement configuration, and environment status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Security Environment Info */}
        <div className="glass-panel p-5 rounded-xl border border-dark-border space-y-4">
          <div className="flex items-center gap-2 text-white text-sm font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero-Trust Secrets Policy</span>
          </div>
          <p className="text-xs text-dark-muted leading-relaxed">
            In compliance with ScopeSeal Core Security Directive, server secrets (Gemini API Key, Supabase Service Role Key, Audit Signing Secret) are isolated server-side and never exposed to the client bundle.
          </p>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded bg-dark-card border border-dark-border">
              <span className="text-slate-400">Gemini Key Storage</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <EyeOff className="w-3.5 h-3.5" /> Server-Side Only
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-dark-card border border-dark-border">
              <span className="text-slate-400">Supabase RLS Enforcer</span>
              <span className="text-emerald-400">PostgreSQL auth.uid()</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-dark-card border border-dark-border">
              <span className="text-slate-400">Parameter Tamper Detection</span>
              <span className="text-cyan-400">SHA-256 Hash Binding</span>
            </div>
          </div>
        </div>

        {/* Local Gateway Mode */}
        <div className="glass-panel p-5 rounded-xl border border-dark-border space-y-4">
          <div className="flex items-center gap-2 text-white text-sm font-semibold">
            <Key className="w-4 h-4 text-seal-400" />
            <span>Gateway Policy Version</span>
          </div>
          <p className="text-xs text-dark-muted leading-relaxed">
            Deterministic rule definitions are versioned to invalidate stale human approvals whenever security policies update.
          </p>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded bg-dark-card border border-dark-border">
              <span className="text-slate-400">Active Policy Version</span>
              <span className="text-seal-300 font-bold">v1.0-STABLE</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-dark-card border border-dark-border">
              <span className="text-slate-400">Approval Single-Use Enforcement</span>
              <span className="text-emerald-400">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-dark-card border border-dark-border">
              <span className="text-slate-400">Fallback Fail-Safe Policy</span>
              <span className="text-amber-400">FAIL_CLOSED (BLOCK)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
