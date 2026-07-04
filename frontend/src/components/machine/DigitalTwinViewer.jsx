import { getHealthHex } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';

export default function DigitalTwinViewer({ machine, prediction }) {
  const status = machine?.status || 'STOPPED';
  const colors = STATUS_COLORS[status] || STATUS_COLORS.STOPPED;
  const healthHex = getHealthHex(prediction?.healthScore);

  const isRunning = status === 'RUNNING' || status === 'WARNING' || status === 'CRITICAL';
  const isCritical = status === 'CRITICAL';

  return (
    <div className="glass-card p-6 rounded-2xl animate-fade-in">
      <h3 className="section-title mb-4">Digital Twin</h3>

      <div className="relative bg-surface-900/60 rounded-xl p-6 overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute inset-0 opacity-10 rounded-xl"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${healthHex}, transparent 70%)`,
          }}
        />

        {/* Machine visualization */}
        <div className="relative flex flex-col items-center">
          {/* Machine body */}
          <svg viewBox="0 0 200 160" className="w-full max-w-[280px]" xmlns="http://www.w3.org/2000/svg">
            {/* Base */}
            <rect x="30" y="120" width="140" height="20" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />

            {/* Machine body */}
            <rect x="50" y="40" width="100" height="80" rx="8" fill="#0f172a" stroke={healthHex} strokeWidth="1.5"
              className="transition-all duration-500" />

            {/* Display screen */}
            <rect x="65" y="55" width="70" height="30" rx="4" fill="#020617" stroke="#334155" strokeWidth="0.5" />
            <text x="100" y="73" textAnchor="middle" fill={healthHex} fontSize="14" fontWeight="bold" fontFamily="monospace">
              {prediction?.healthScore != null ? `${Math.round(prediction.healthScore)}%` : '--'}
            </text>

            {/* Status indicator light */}
            <circle cx="80" cy="100" r="4" fill={isRunning ? healthHex : '#475569'}>
              {isRunning && (
                <animate attributeName="opacity" values="1;0.3;1" dur={isCritical ? '0.5s' : '2s'} repeatCount="indefinite" />
              )}
            </circle>
            <circle cx="100" cy="100" r="4" fill={isCritical ? '#ef4444' : '#475569'}>
              {isCritical && (
                <animate attributeName="opacity" values="1;0.2;1" dur="0.4s" repeatCount="indefinite" />
              )}
            </circle>
            <circle cx="120" cy="100" r="4" fill={status === 'RUNNING' ? '#10b981' : '#475569'} />

            {/* Rotating gear (when running) */}
            <g transform="translate(155, 70)">
              <circle r="12" fill="none" stroke="#334155" strokeWidth="1" />
              {isRunning && (
                <g>
                  <animateTransform attributeName="transform" type="rotate" from="0" to="360"
                    dur={isCritical ? '0.5s' : '3s'} repeatCount="indefinite" />
                  {[0, 60, 120, 180, 240, 300].map((angle) => (
                    <line
                      key={angle}
                      x1="0" y1="-8" x2="0" y2="-14"
                      stroke={healthHex}
                      strokeWidth="2"
                      strokeLinecap="round"
                      transform={`rotate(${angle})`}
                    />
                  ))}
                  <circle r="3" fill={healthHex} />
                </g>
              )}
            </g>

            {/* Pipes */}
            <line x1="30" y1="60" x2="50" y2="60" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
            <line x1="30" y1="90" x2="50" y2="90" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
            <line x1="150" y1="75" x2="170" y2="75" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          </svg>

          {/* Status text */}
          <div className="mt-4 text-center">
            <span className={`status-badge ${colors.class}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${isRunning ? 'animate-pulse' : ''}`} />
              {status}
            </span>
          </div>
        </div>

        {/* Sensor values overlay */}
        {prediction && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[
              { label: 'TEMP', value: prediction.temperature, unit: '°C' },
              { label: 'VIB', value: prediction.vibration, unit: 'mm/s' },
              { label: 'PSI', value: prediction.pressure, unit: '' },
              { label: 'RPM', value: prediction.rpm, unit: '' },
            ].map((s) => (
              <div key={s.label} className="bg-surface-800/60 rounded-lg px-3 py-2 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
                <p className="text-sm font-mono font-semibold text-gray-300">
                  {s.value != null ? `${s.value}${s.unit ? ' ' + s.unit : ''}` : '--'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
