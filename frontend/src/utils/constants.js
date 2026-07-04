export const STATUS_COLORS = {
  RUNNING: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    glow: 'shadow-glow-green',
    dot: 'bg-emerald-400',
    class: 'status-running',
  },
  WARNING: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    glow: 'shadow-glow-yellow',
    dot: 'bg-amber-400',
    class: 'status-warning',
  },
  CRITICAL: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/20',
    glow: 'shadow-glow-red',
    dot: 'bg-red-400',
    class: 'status-critical',
  },
  STOPPED: {
    bg: 'bg-gray-500/10',
    text: 'text-gray-400',
    border: 'border-gray-500/20',
    glow: '',
    dot: 'bg-gray-400',
    class: 'status-stopped',
  },
};

export const RISK_COLORS = {
  LOW: 'text-emerald-400',
  MEDIUM: 'text-amber-400',
  HIGH: 'text-orange-400',
  CRITICAL: 'text-red-400',
};

export const SEVERITY_COLORS = {
  INFO: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  WARNING: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  CRITICAL: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
};
