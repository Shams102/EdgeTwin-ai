import { useNavigate } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { formatHealthScore, getHealthColor, getHealthHex } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';

export default function MachineCard({ machine, index }) {
  const navigate = useNavigate();
  const colors = STATUS_COLORS[machine.status] || STATUS_COLORS.STOPPED;
  const healthColor = getHealthColor(machine.healthScore);
  const healthHex = getHealthHex(machine.healthScore);

  // SVG circular gauge parameters
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = machine.healthScore != null ? machine.healthScore / 100 : 0;
  const offset = circumference - progress * circumference;

  return (
    <div
      onClick={() => navigate(`/machines/${machine.id}`)}
      className={`glass-card-hover cursor-pointer p-5 group animate-slide-up`}
      style={{ animationDelay: `${index * 80}ms` }}
      id={`machine-card-${machine.id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
            {machine.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{machine.location}</p>
        </div>
        <StatusBadge status={machine.status} />
      </div>

      {/* Circular Health Gauge */}
      <div className="flex items-center justify-center py-3">
        <div className="relative">
          <svg width="96" height="96" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="48" cy="48" r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-surface-700"
            />
            {/* Progress circle */}
            <circle
              cx="48" cy="48" r={radius}
              fill="none"
              stroke={healthHex}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${healthColor}`}>
              {formatHealthScore(machine.healthScore)}
            </span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Health</span>
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-center mt-2">
        <span className="text-[11px] text-gray-500 group-hover:text-primary-400 transition-colors">
          Click to view details →
        </span>
      </div>
    </div>
  );
}
