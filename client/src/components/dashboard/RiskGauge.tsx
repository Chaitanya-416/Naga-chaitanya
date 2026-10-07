import React from 'react';

interface RiskGaugeProps {
  score: number;
  level?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, level, size = 'md' }) => {
  const normalizedScore = Math.min(100, Math.max(0, score));

  const getColor = () => {
    if (normalizedScore <= 30) return { stroke: '#10b981', text: 'text-emerald-400', label: 'LOW' };
    if (normalizedScore <= 60) return { stroke: '#f59e0b', text: 'text-amber-400', label: 'MEDIUM' };
    if (normalizedScore <= 80) return { stroke: '#f97316', text: 'text-orange-400', label: 'HIGH' };
    return { stroke: '#ef4444', text: 'text-rose-400', label: 'CRITICAL' };
  };

  const { stroke, text, label } = getColor();
  const radius = size === 'sm' ? 28 : size === 'md' ? 42 : 56;
  const strokeWidth = size === 'sm' ? 6 : size === 'md' ? 8 : 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const svgDim = (radius + strokeWidth) * 2;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        <svg
          width={svgDim}
          height={svgDim}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={svgDim / 2}
            cy={svgDim / 2}
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
          />
          {/* Animated score circle */}
          <circle
            cx={svgDim / 2}
            cy={svgDim / 2}
            r={radius}
            fill="transparent"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`font-mono font-bold tracking-tight leading-none ${text} ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-xl' : 'text-3xl'}`}>
            {normalizedScore}
          </span>
          <span className="text-[9px] text-dark-muted font-mono mt-0.5">/100</span>
        </div>
      </div>

      <div className={`mt-2 font-mono text-[10px] font-semibold tracking-wider ${text}`}>
        {level || label} RISK
      </div>
    </div>
  );
};
