import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  onNavigate: (path: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login, quickDemoLogin, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      onNavigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    try {
      await quickDemoLogin();
      onNavigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate in demo mode');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg cyber-grid">
      <div className="w-full max-w-md">
        {/* Logo & Headline */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-seal-500 to-seal-700 items-center justify-center shadow-xl shadow-seal-500/25 mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ScopeSeal AI</h1>
          <p className="text-xs text-seal-400 font-mono mt-1">Runtime Purpose-Bound Data Firewall</p>
          <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
            Traditional access control answers WHO. ScopeSeal controls WHY, WHAT, WHERE, and WHEN.
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel p-7 rounded-2xl border border-dark-border shadow-2xl relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-seal-500/10 rounded-full blur-2xl pointer-events-none" />

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="security.lead@enterprise.com"
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
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to ScopeSeal Gateway'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access for Hackathon Judges */}
          <div className="mt-5 pt-5 border-t border-dark-border text-center">
            <button
              onClick={handleDemoSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 border border-seal-500/40 text-seal-300 font-medium text-xs flex items-center justify-center gap-2 transition-all hover:border-seal-400 group"
            >
              <Zap className="w-3.5 h-3.5 text-seal-400 group-hover:scale-110 transition-transform" />
              <span>Instant Hackathon Judge Access (Demo Mode)</span>
            </button>
            <p className="text-[10px] text-slate-500 mt-2 font-mono">
              Pre-loaded with synthetic candidate data & zero-trust policies
            </p>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => onNavigate('/register')}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Need an account? <span className="text-seal-400 font-medium">Create one</span>
            </button>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-dark-card/60 border border-dark-border text-[10px] text-slate-400 flex flex-col items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-seal-400" />
            <span>Deterministic RLS</span>
          </div>
          <div className="p-2 rounded-lg bg-dark-card/60 border border-dark-border text-[10px] text-slate-400 flex flex-col items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-seal-400" />
            <span>Gemini Semantic Drift</span>
          </div>
          <div className="p-2 rounded-lg bg-dark-card/60 border border-dark-border text-[10px] text-slate-400 flex flex-col items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-seal-400" />
            <span>Fail-Closed Gate</span>
          </div>
        </div>
      </div>
    </div>
  );
};
