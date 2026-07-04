import { RISK_COLORS } from '../../utils/constants';
import { formatProbability, formatTimestamp } from '../../utils/formatters';

export default function PredictionPanel({ prediction }) {
  if (!prediction) {
    return (
      <div className="glass-card p-6 rounded-2xl text-center">
        <p className="text-gray-400 text-sm">No predictions yet</p>
        <p className="text-gray-500 text-xs mt-1">Trigger a prediction to see results</p>
      </div>
    );
  }

  const riskColor = RISK_COLORS[prediction.riskLevel] || 'text-gray-400';

  const sensors = [
    { label: 'Temperature', value: prediction.temperature, unit: '°C', icon: '🌡️' },
    { label: 'Vibration', value: prediction.vibration, unit: 'mm/s', icon: '📳' },
    { label: 'Pressure', value: prediction.pressure, unit: 'PSI', icon: '🔵' },
    { label: 'RPM', value: prediction.rpm, unit: '', icon: '⚙️' },
  ];

  return (
    <div className="glass-card p-6 rounded-2xl animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <h3 className="section-title">Latest Prediction</h3>
        <span className="text-xs text-gray-500">{formatTimestamp(prediction.predictedAt)}</span>
      </div>

      {/* Risk Level & Failure Probability */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-surface-900/60 rounded-xl p-4 text-center">
          <p className="metric-label mb-1">Risk Level</p>
          <p className={`text-xl font-bold ${riskColor}`}>{prediction.riskLevel}</p>
        </div>
        <div className="bg-surface-900/60 rounded-xl p-4 text-center">
          <p className="metric-label mb-1">Failure Probability</p>
          <p className={`text-xl font-bold ${riskColor}`}>
            {formatProbability(prediction.failureProbability)}
          </p>
        </div>
      </div>

      {/* Recommendation */}
      {prediction.recommendation && (
        <div className="bg-surface-900/60 rounded-xl p-4 mb-5">
          <p className="metric-label mb-2">AI Recommendation</p>
          <p className="text-sm text-gray-300 leading-relaxed">{prediction.recommendation}</p>
        </div>
      )}

      {/* Sensor Readings */}
      <div>
        <p className="metric-label mb-3">Sensor Readings</p>
        <div className="grid grid-cols-2 gap-3">
          {sensors.map((sensor) => (
            <div key={sensor.label} className="bg-surface-900/40 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs">{sensor.icon}</span>
                <span className="text-[11px] text-gray-500 uppercase tracking-wider">{sensor.label}</span>
              </div>
              <p className="text-sm font-semibold text-gray-200">
                {sensor.value != null ? `${sensor.value}${sensor.unit ? ' ' + sensor.unit : ''}` : '--'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
