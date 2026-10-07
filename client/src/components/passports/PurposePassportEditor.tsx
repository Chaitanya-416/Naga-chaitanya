import React, { useState } from 'react';
import { PurposePassport, PurposePassportInput, SENSITIVITY_LEVELS } from '@scopeseal/shared';
import { X, Save, Shield } from 'lucide-react';

interface PurposePassportEditorProps {
  initialData?: PurposePassport | null;
  agentId: string;
  onSave: (data: PurposePassportInput) => Promise<void>;
  onClose: () => void;
}

export const PurposePassportEditor: React.FC<PurposePassportEditorProps> = ({
  initialData,
  agentId,
  onSave,
  onClose
}) => {
  const [passportCode, setPassportCode] = useState(initialData?.passport_code || 'PSP-NEW-PURPOSE');
  const [dataType, setDataType] = useState(initialData?.data_type || 'synthetic_candidate_pool');
  const [sensitivityLevel, setSensitivityLevel] = useState(initialData?.sensitivity_level || 'CONFIDENTIAL');
  const [authorizedPurpose, setAuthorizedPurpose] = useState(
    initialData?.authorized_purpose || 'Candidate screening and internal shortlist creation for software engineering roles'
  );
  const [allowedOperations, setAllowedOperations] = useState(
    initialData?.allowed_operations.join(', ') || 'read_resume, search_internal_candidates, create_shortlist, save_report'
  );
  const [allowedFields, setAllowedFields] = useState(
    initialData?.allowed_fields.join(', ') || 'candidate_name, skills, experience_years, education'
  );
  const [allowedDestinations, setAllowedDestinations] = useState(
    initialData?.allowed_destinations.join(', ') || 'internal://db/shortlists, internal://storage/reports'
  );
  const [approvalRequired, setApprovalRequired] = useState(initialData?.approval_required || false);
  const [expiresInDays, setExpiresInDays] = useState('365');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const expiresAt = new Date(
        Date.now() + parseInt(expiresInDays, 10) * 24 * 60 * 60 * 1000
      ).toISOString();

      const payload: PurposePassportInput = {
        agent_id: agentId,
        passport_code: passportCode.trim().toUpperCase(),
        data_type: dataType.trim(),
        sensitivity_level: sensitivityLevel as any,
        authorized_purpose: authorizedPurpose.trim(),
        allowed_operations: allowedOperations.split(',').map((s) => s.trim()).filter(Boolean),
        allowed_fields: allowedFields.split(',').map((s) => s.trim()).filter(Boolean),
        allowed_destinations: allowedDestinations.split(',').map((s) => s.trim()).filter(Boolean),
        approval_required: approvalRequired,
        expires_at: expiresAt,
        policy_version: 'v1.0',
        active: true
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save purpose passport');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="glass-panel p-6 rounded-2xl border border-dark-border w-full max-w-xl shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-dark-border mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-seal-400" />
            <h3 className="text-base font-bold text-white">
              {initialData ? 'Edit Purpose Passport' : 'Create Purpose Passport'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Passport Code</label>
              <input
                type="text"
                required
                value={passportCode}
                onChange={(e) => setPassportCode(e.target.value)}
                placeholder="PSP-HR-SCREEN-2026"
                className="w-full px-3 py-2 rounded-lg bg-dark-card border border-dark-border text-white font-mono focus:border-seal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Sensitivity Level</label>
              <select
                value={sensitivityLevel}
                onChange={(e) => setSensitivityLevel(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-dark-card border border-dark-border text-white focus:border-seal-500 focus:outline-none"
              >
                {SENSITIVITY_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Authorized Purpose (Contractual Agent Objective)
            </label>
            <textarea
              required
              rows={2}
              value={authorizedPurpose}
              onChange={(e) => setAuthorizedPurpose(e.target.value)}
              placeholder="Explain exactly why and for what intent the agent is permitted to process this data..."
              className="w-full px-3 py-2 rounded-lg bg-dark-card border border-dark-border text-white focus:border-seal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Permitted Tools / Operations (comma separated)
            </label>
            <input
              type="text"
              required
              value={allowedOperations}
              onChange={(e) => setAllowedOperations(e.target.value)}
              placeholder="read_resume, search_internal_candidates, create_shortlist"
              className="w-full px-3 py-2 rounded-lg bg-dark-card border border-dark-border text-white font-mono focus:border-seal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Authorized Target Destinations (comma separated)
            </label>
            <input
              type="text"
              required
              value={allowedDestinations}
              onChange={(e) => setAllowedDestinations(e.target.value)}
              placeholder="internal://db/shortlists, internal://storage/reports"
              className="w-full px-3 py-2 rounded-lg bg-dark-card border border-dark-border text-white font-mono focus:border-seal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Expiration TTL (Days)</label>
              <input
                type="number"
                min="1"
                max="730"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-dark-card border border-dark-border text-white font-mono focus:border-seal-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="reqApproval"
                checked={approvalRequired}
                onChange={(e) => setApprovalRequired(e.target.checked)}
                className="w-4 h-4 rounded text-seal-600 bg-dark-card border-dark-border focus:ring-seal-500"
              />
              <label htmlFor="reqApproval" className="text-slate-300 font-medium">
                Require Human Review by default
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-dark-card hover:bg-slate-800 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-seal-600 hover:bg-seal-500 text-white font-medium flex items-center gap-1.5 shadow-lg shadow-seal-600/30 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Passport'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
