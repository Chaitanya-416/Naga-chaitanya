import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface RiskBreakdownProps {
  triggeredFactors: Record<string, number>;
  reasons: string[];
}

export const RiskBreakdown: React.FC<RiskBreakdownProps> = ({ triggeredFactors, reasons }) => {
  const factorLabels: Record<string, string> = {
    PURPOSE_MISMATCH: 'Purpose Drift / Goal Mismatch',
    SENSITIVE_DATA_EXPOSURE: 'Sensitive Data Exposure (PII / Restricted)',
    EXTERNAL_DESTINATION: 'Untrusted External Destination',
    HIGH_IMPACT_OPERATION: 'High-Impact State-Changing Operation',
    UNTRUSTED_INSTRUCTION_SOURCE: 'Untrusted Instruction (Prompt Injection)',
    EXCESSIVE_SCOPE: 'Excessive Record Count / Scope Overreach',
    MISSING_OR_INVALID_APPROVAL: 'Missing / Expired / Tampered Approval'
  };

  const triggeredEntries = Object.entries(triggeredFactors);

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
          Triggered Risk Factors
        </h4>
        {triggeredEntries.length === 0 ? (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Zero risk factors triggered. Action remains strictly within authorized purpose.</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {triggeredEntries.map(([factor, weight]) => (
              <div
                key={factor}
                className="p-2.5 rounded-lg bg-dark-card border border-dark-border flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 text-slate-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{factorLabels[factor] || factor}</span>
                </div>
                <span className="font-mono text-amber-400 font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                  +{weight}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {reasons.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
            Deterministic Evidence & Findings
          </h4>
          <ul className="space-y-1 text-xs text-slate-300">
            {reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2 bg-dark-card/60 p-2 rounded border border-dark-border/60">
                <span className="text-seal-400 font-mono mt-0.5">•</span>
                <span className="leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
