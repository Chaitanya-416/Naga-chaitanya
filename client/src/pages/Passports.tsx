import React, { useState, useEffect } from 'react';
import { PurposePassport, PurposePassportInput } from '@scopeseal/shared';
import { apiRequest } from '../lib/api';
import { PurposePassportCard } from '../components/passports/PurposePassportCard';
import { PurposePassportEditor } from '../components/passports/PurposePassportEditor';
import { FileKey2, Plus, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

export const Passports: React.FC = () => {
  const [passports, setPassports] = useState<PurposePassport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPassport, setEditingPassport] = useState<PurposePassport | null>(null);

  const fetchPassports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest<PurposePassport[]>('/passports');
      setPassports(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch purpose passports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPassports();
  }, []);

  const handleSave = async (input: PurposePassportInput) => {
    if (editingPassport) {
      await apiRequest(`/passports/${editingPassport.id}`, {
        method: 'PUT',
        body: JSON.stringify(input)
      });
    } else {
      await apiRequest('/passports', {
        method: 'POST',
        body: JSON.stringify(input)
      });
    }
    await fetchPassports();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Purpose Passport?')) return;
    try {
      await apiRequest(`/passports/${id}`, { method: 'DELETE' });
      await fetchPassports();
    } catch (err: any) {
      alert(err.message || 'Failed to delete passport');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl glass-panel border border-dark-border">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileKey2 className="w-5 h-5 text-seal-400" />
            Purpose Passport Management
          </h2>
          <p className="text-xs text-dark-muted mt-1">
            “This data may be used only within this defined purpose and scope.” Cryptographic contracts bounding agent actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPassports}
            className="p-2 rounded-lg bg-dark-card hover:bg-dark-cardHover border border-dark-border text-slate-300"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-seal-400' : ''}`} />
          </button>
          <button
            onClick={() => {
              setEditingPassport(null);
              setIsEditorOpen(true);
            }}
            className="px-3.5 py-2 rounded-lg bg-seal-600 hover:bg-seal-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-seal-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Passport</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Passports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {passports.map((passport) => (
          <PurposePassportCard
            key={passport.id}
            passport={passport}
            onEdit={(p) => {
              setEditingPassport(p);
              setIsEditorOpen(true);
            }}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {passports.length === 0 && !isLoading && (
        <div className="glass-panel p-10 rounded-xl border border-dark-border text-center space-y-3">
          <FileKey2 className="w-10 h-10 text-dark-muted mx-auto" />
          <h3 className="text-sm font-semibold text-white">No Purpose Passports Found</h3>
          <p className="text-xs text-dark-muted max-w-sm mx-auto">
            Create a Purpose Passport to establish the authorized purpose and tool boundaries for RecruitAssist.
          </p>
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <PurposePassportEditor
          initialData={editingPassport}
          agentId="b0000000-0000-0000-0000-000000000001"
          onSave={handleSave}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
};
