import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    text: string;
    positive?: boolean;
  };
  accentColor?: 'seal' | 'emerald' | 'amber' | 'rose';
}

export const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'seal'
}) => {
  const getAccentStyles = () => {
    switch (accentColor) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400',
          valueColor: 'text-emerald-400'
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-950/60 border-amber-500/30 text-amber-400',
          valueColor: 'text-amber-400'
        };
      case 'rose':
        return {
          iconBg: 'bg-rose-950/60 border-rose-500/30 text-rose-400',
          valueColor: 'text-rose-400'
        };
      case 'seal':
      default:
        return {
          iconBg: 'bg-seal-950/60 border-seal-500/30 text-seal-400',
          valueColor: 'text-white'
        };
    }
  };

  const styles = getAccentStyles();

  return (
    <div className="glass-panel p-5 rounded-xl border border-dark-border hover:border-slate-700 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-dark-muted font-medium">{title}</span>
        <div className={`p-2 rounded-lg border ${styles.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div>
        <div className={`text-2xl font-bold font-mono tracking-tight ${styles.valueColor}`}>
          {value}
        </div>
        {subtitle && (
          <div className="text-[11px] text-slate-400 mt-1">{subtitle}</div>
        )}
        {trend && (
          <div
            className={`text-[11px] font-mono mt-2 flex items-center gap-1 ${
              trend.positive ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <span>{trend.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};
