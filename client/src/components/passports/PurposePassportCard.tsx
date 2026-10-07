import React from 'react';
import { PurposePassport } from '@scopeseal/shared';
import { FileKey2, ShieldCheck, ShieldAlert, Calendar, CheckSquare, Edit, Trash2 } from 'lucide-react';
import { ThreatStatusBadge } from '../common/ThreatStatusBadge';

interface PurposePassportCardProps {
  passport: PurposePassport;
  onEdit: (passport: PurposePassport) => void;
  onDelete: (id: string) => void;
}

export const PurposePassportCard: React.FC<PurposePassportCardProps> = ({
  passport,
  onEdit,
  onDelete
}) => {
  const isExpired = new Date(passport.expires_at).getTime() < Date.now();

  return (
    <div className="glass-panel p-5 rounded-xl border border-dark-border hover:border-seal-500/40 transition-all flex flex-col justify-between space-y-4">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-seal-950/80 border border-seal-500/40 flex items-center justify-center text-seal-400">
              <FileKey2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold font-mono text-white tracking-tight">
                {passport.passport_code}
              </div>
              <div className="text-[11px] text-dark-muted font-mono">
                {passport.data_type} • {passport.policy_version}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <ThreatStatusBadge
              level={passport.sensitivity_level}
              decision={passport.active && !isExpired ? 'ACTIVE' : isExpired ? 'EXPIRED' : 'INACTIVE'}
              size="sm"
            />
          </div>
        </div>

        {/* Purpose Definition */}
        <div className="p-3 rounded-lg bg-dark-card border border-dark-border mb-3">
          <span className="text-[10px] text-dark-muted font-mono uppercase tracking-wider block mb-1">
            Authorized Purpose Boundary
          </span>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            "{passport.authorized_purpose}"
          </p>
        </div>

        {/* Permissions Grid */}
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-[10px] text-dark-muted font-mono uppercase block mb-1">
              Permitted Operations ({passport.allowed_operations.length})
            </span>
            <div className="flex flex-wrap gap-1">
              {passport.allowed_operations.map((op) => (
                <span
                  key={op}
                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-slate-300 font-mono text-[10px]"
                >
                  {op}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] text-dark-muted font-mono uppercase block mb-1">
              Authorized Target Destinations ({passport.allowed_destinations.length})
            </span>
            <div className="flex flex-wrap gap-1">
              {passport.allowed_destinations.map((dest) => (
                <span
                  key={dest}
                  className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-mono text-[10px]"
                >
                  {dest}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-dark-border/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
          <Calendar className="w-3.5 h-3.5 text-dark-muted" />
          <span>Expires: {new Date(passport.expires_at).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(passport)}
            className="p-1.5 rounded-lg bg-dark-card hover:bg-seal-950/60 hover:text-seal-300 border border-dark-border text-slate-400 transition-colors"
            title="Edit Passport"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(passport.id)}
            className="p-1.5 rounded-lg bg-dark-card hover:bg-rose-950/60 hover:text-rose-400 border border-dark-border text-slate-400 transition-colors"
            title="Delete Passport"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
