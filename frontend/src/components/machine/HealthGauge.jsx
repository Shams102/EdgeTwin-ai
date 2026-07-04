import { getHealthHex, getHealthColor, formatHealthScore } from '../../utils/formatters';

export default function HealthGauge({ score, size = 'lg' }) {
  const healthHex = getHealthHex(score);
  const healthColor = getHealthColor(score);

  const dims = size === 'lg' ? { w: 180, r: 70, sw: 10 } : { w: 100, r: 38, sw: 6 };
  const circumference = 2 * Math.PI * dims.r;
  const progress = score != null ? score / 100 : 0;
  const offset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={dims.w} height={dims.w} className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx={dims.w / 2} cy={dims.w / 2} r={dims.r}
            fill="none" stroke="currentColor" strokeWidth={dims.sw}
            className="text-surface-700"
          />
          {/* Colored glow (wider, transparent) */}
          <circle
            cx={dims.w / 2} cy={dims.w / 2} r={dims.r}
            fill="none" stroke={healthHex} strokeWidth={dims.sw + 8}
            strokeLinecap="round" opacity="0.15"
            strokeDasharray={circumference} strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
          {/* Main progress arc */}
          <circle
            cx={dims.w / 2} cy={dims.w / 2} r={dims.r}
            fill="none" stroke={healthHex} strokeWidth={dims.sw}
            strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${size === 'lg' ? 'text-4xl' : 'text-xl'} font-bold ${healthColor}`}>
            {formatHealthScore(score)}
          </span>
          <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">Health Score</span>
        </div>
      </div>
    </div>
  );
}
