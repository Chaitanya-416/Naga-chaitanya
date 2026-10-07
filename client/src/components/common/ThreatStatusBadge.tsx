import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ThreatStatusBadgeProps {
  level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  decision?: 'ALLOW' | 'REVIEW' | 'BLOCK' | string;
  score?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ThreatStatusBadge: React.FC<ThreatStatusBadgeProps> = ({
  level,
  decision,
  score,
  className = '',
  size = 'md'
}) => {
  const normalizedLevel = (level || (decision === 'BLOCK' ? 'CRITICAL' : decision === 'REVIEW' ? 'HIGH' : 'LOW')).toUpperCase();

  const getStyle = () => {
    switch (normalizedLevel) {
      case 'LOW':
        return {
          bg: 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400',
          indicator: 'bg-emerald-500',
          icon: <ShieldCheck className="w-3.5 h-3.5" />,
          label: 'LOW RISK'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-950/50 border-amber-500/40 text-amber-400',
          indicator: 'bg-amber-500',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          label: 'MEDIUM RISK'
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-950/50 border-orange-500/40 text-orange-400',
          indicator: 'bg-orange-500',
          icon: <AlertOctagon className="w-3.5 h-3.5" />,
          label: 'HIGH RISK'
        };
      case 'CRITICAL':
      default:
        return {
          bg: 'bg-rose-950/60 border-rose-500/50 text-rose-400',
          indicator: 'bg-rose-500 animate-pulse',
          icon: <ShieldAlert className="w-3.5 h-3.5" />,
          label: 'CRITICAL'
        };
    }
  };

  const style = getStyle();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-sm ${style.bg} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.indicator}`} />
      {style.icon}
      <span>{decision ? decision : style.label}</span>
      {score !== undefined && (
        <span className="font-mono opacity-80 pl-0.5 text-[10px]">({score})</span>
      )}
    </span>
  );
};
