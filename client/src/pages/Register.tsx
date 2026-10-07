import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, User, ArrowRight } from 'lucide-react';

interface RegisterProps {
  onNavigate: (path: string) => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  const { register, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(email, password, fullName);
      onNavigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg cyber-grid">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-seal-500 to-seal-700 items-center justify-center shadow-xl shadow-seal-500/25 mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create SecOps Account</h1>
          <p className="text-xs text-seal-400 font-mono mt-1">Register Tenant with Supabase Identity</p>
        </div>

        <div className="glass-panel p-7 rounded-2xl border border-dark-border shadow-2xl relative overflow-hidden">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Security Architect"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-dark-card border border-dark-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-seal-500 focus:ring-1 focus:ring-seal-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-dark-card border border-dark-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-seal-500 focus:ring-1 focus:ring-seal-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-dark-card border border-dark-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-seal-500 focus:ring-1 focus:ring-seal-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-seal-600 hover:bg-seal-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-seal-600/30 transition-all disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-dark-border text-center">
            <button
              onClick={() => onNavigate('/login')}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Already registered? <span className="text-seal-400 font-medium">Sign in</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
