import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-800 border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
        </p>
      ))}
    </div>
  );
};

export default function SensorChart({ predictions }) {
  if (!predictions || predictions.length === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl text-center">
        <p className="text-gray-400 text-sm">No prediction history</p>
      </div>
    );
  }

  // Prepare data in chronological order
  const data = [...predictions].reverse().map((p, i) => ({
    index: i + 1,
    time: new Date(p.predictedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    healthScore: p.healthScore,
    failureProb: Math.round(p.failureProbability * 100),
    temperature: p.temperature,
    vibration: p.vibration ? Math.round(p.vibration * 1000) / 1000 : null,
  }));

  return (
    <div className="glass-card p-6 rounded-2xl animate-fade-in">
      <h3 className="section-title mb-4">Prediction History</h3>

      {/* Health Score Trend */}
      <div className="mb-6">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Health Score Trend</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone" dataKey="healthScore" name="Health %"
              stroke="#10b981" strokeWidth={2} fill="url(#healthGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Failure Probability & Temperature */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Failure Probability & Temperature</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="failGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '8px' }}
              formatter={(value) => <span className="text-xs text-gray-400">{value}</span>}
            />
            <Area
              type="monotone" dataKey="failureProb" name="Failure %"
              stroke="#ef4444" strokeWidth={2} fill="url(#failGrad)"
            />
            <Area
              type="monotone" dataKey="temperature" name="Temp °C"
              stroke="#f59e0b" strokeWidth={1.5} fill="url(#tempGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
