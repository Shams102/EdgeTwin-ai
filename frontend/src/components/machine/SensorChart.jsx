import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
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
    healthScore: p.healthScore != null ? Math.round(p.healthScore) : null,
    failureProb: p.failureProbability != null ? Math.round(p.failureProbability * 100) : null,
    temperature: p.temperature != null ? Math.round(p.temperature * 10) / 10 : null,
    vibration: p.vibration != null ? Math.round(p.vibration * 1000) / 1000 : null,
    rpm: p.rpm != null ? Math.round(p.rpm) : null,
    pressure: p.pressure != null ? Math.round(p.pressure * 10) / 10 : null,
  }));

  return (
    <div className="glass-card p-6 rounded-2xl animate-fade-in space-y-8">
      <h3 className="section-title">Prediction History</h3>

      {/* Chart 1 — Health Score Trend */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Health Score vs Time</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone" dataKey="healthScore" name="Health %"
              stroke="#10b981" strokeWidth={2} fill="url(#healthGrad)"
              dot={{ fill: '#10b981', r: 3 }} activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2 — Failure Probability & Temperature */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Failure Probability & Temperature vs Time</p>
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
            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '8px' }}
              formatter={(value) => <span className="text-xs text-gray-400">{value}</span>}
            />
            <Area
              type="monotone" dataKey="failureProb" name="Failure %"
              stroke="#ef4444" strokeWidth={2} fill="url(#failGrad)"
              dot={{ fill: '#ef4444', r: 3 }} activeDot={{ r: 5 }}
            />
            <Area
              type="monotone" dataKey="temperature" name="Temp °C"
              stroke="#f59e0b" strokeWidth={1.5} fill="url(#tempGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 3 — RPM & Vibration */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">RPM & Vibration vs Time</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="rpm" orientation="left" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="vib" orientation="right" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '8px' }}
              formatter={(value) => <span className="text-xs text-gray-400">{value}</span>}
            />
            <Line
              yAxisId="rpm"
              type="monotone" dataKey="rpm" name="RPM"
              stroke="#818cf8" strokeWidth={2}
              dot={{ fill: '#818cf8', r: 3 }} activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="vib"
              type="monotone" dataKey="vibration" name="Vibration (mm/s)"
              stroke="#fb923c" strokeWidth={1.5} strokeDasharray="4 2"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
