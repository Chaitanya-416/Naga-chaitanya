import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { SecurityTestResult, Decision } from '@scopeseal/shared';
import { ThreatStatusBadge } from '../components/common/ThreatStatusBadge';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Terminal
} from 'lucide-react';

interface ScenarioMeta {
  id: string;
  name: string;
  description: string;
  threatCategory: string;
  expectedDecision: Decision;
}

export const TestLab: React.FC = () => {
  const [scenarios, setScenarios] = useState<ScenarioMeta[]>([]);
  const [results, setResults] = useState<Record<string, SecurityTestResult>>({});
  const [runningId, setRunningId] = useState<string | null>(null);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchScenariosAndResults = async () => {
    setIsLoading(true);
    try {
      const [scenariosData, resultsData] = await Promise.all([
        apiRequest<ScenarioMeta[]>('/test-lab/scenarios'),
        apiRequest<SecurityTestResult[]>('/test-lab/results')
      ]);

      setScenarios(scenariosData);

      const mapped: Record<string, SecurityTestResult> = {};
      for (const r of resultsData) {
        // Keep newest per scenario
        if (!mapped[r.scenarioId]) {
          mapped[r.scenarioId] = r;
        }
      }
      setResults(mapped);
    } catch (err) {
      console.warn('Failed to load test lab', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScenariosAndResults();
  }, []);

  const runSingleScenario = async (scenarioId: string) => {
    setRunningId(scenarioId);
    try {
      const result = await apiRequest<SecurityTestResult>('/test-lab/run-scenario', {
        method: 'POST',
        body: JSON.stringify({ scenarioId })
      });

      setResults((prev) => ({
        ...prev,
        [scenarioId]: result
      }));
    } catch (err: any) {
      alert(err.message || 'Test execution failed');
    } finally {
      setRunningId(null);
    }
  };

  const runAllScenarios = async () => {
    setIsRunningAll(true);
    for (const scenario of scenarios) {
      await runSingleScenario(scenario.id);
    }
    setIsRunningAll(false);
  };

  const totalPassed = Object.values(results).filter((r) => r.passed).length;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl glass-panel border border-dark-border">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-seal-400" />
            Interactive Security Red-Team Test Lab
          </h2>
          <p className="text-xs text-dark-muted mt-1">
            Automated adversarial test vectors evaluating ScopeSeal zero-trust boundaries against state-of-the-art AI threat patterns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-[10px] text-dark-muted font-mono uppercase">Lab Score</div>
            <div className="text-xs font-mono font-bold text-emerald-400">
              {totalPassed} / {scenarios.length} Passed
            </div>
          </div>

          <button
            onClick={runAllScenarios}
            disabled={isRunningAll}
            className="px-4 py-2 rounded-lg bg-seal-600 hover:bg-seal-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-seal-600/30 transition-all disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${isRunningAll ? 'animate-bounce' : ''}`} />
            <span>{isRunningAll ? 'Executing Vectors...' : 'Run All 9 Scenarios'}</span>
          </button>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((s) => {
          const res = results[s.id];
          const isRunning = runningId === s.id;

          return (
            <div
              key={s.id}
              className="glass-panel p-5 rounded-xl border border-dark-border hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">
                      {s.name}
                    </h3>
                    <span className="text-[10px] font-mono text-purple-400 uppercase mt-0.5 block">
                      {s.threatCategory}
                    </span>
                  </div>

                  {res && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 ${
                        res.passed
                          ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-400'
                          : 'bg-rose-950/70 border border-rose-500/40 text-rose-400'
                      }`}
                    >
                      {res.passed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> FAIL
                        </>
                      )}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {s.description}
                </p>

                {res && (
                  <div className="p-3 rounded-lg bg-dark-card border border-dark-border space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-dark-muted">Expected:</span>
                      <ThreatStatusBadge decision={s.expectedDecision} size="sm" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-dark-muted">Observed:</span>
                      <ThreatStatusBadge
                        score={res.riskScore}
                        decision={res.observedDecision}
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-dark-muted">Risk Score:</span>
                      <span className="font-bold text-white">{res.riskScore}/100</span>
                    </div>

                    {res.reasons.length > 0 && (
                      <div className="pt-2 border-t border-dark-border text-[11px] text-slate-300 font-sans leading-tight">
                        "{res.reasons[0]}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => runSingleScenario(s.id)}
                disabled={isRunning}
                className="w-full py-2 px-3 rounded-lg bg-dark-card hover:bg-seal-950/60 hover:text-seal-300 border border-dark-border text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin text-seal-400' : ''}`} />
                <span>{isRunning ? 'Simulating Vector...' : 'Execute Scenario'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
