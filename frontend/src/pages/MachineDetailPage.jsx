import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useMachine from '../hooks/useMachine';
import HealthGauge from '../components/machine/HealthGauge';
import PredictionPanel from '../components/machine/PredictionPanel';
import SensorChart from '../components/machine/SensorChart';
import DigitalTwinViewer from '../components/machine/DigitalTwinViewer';
import AlertBanner from '../components/dashboard/AlertBanner';
import StatusBadge from '../components/common/StatusBadge';
import Loader from '../components/common/Loader';
import ErrorFallback from '../components/common/ErrorFallback';

export default function MachineDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { machine, predictions, alerts, loading, error, predicting, runPrediction, refetch } = useMachine(id);

  // Sensor input form
  const [sensorForm, setSensorForm] = useState({
    temperature: 75,
    vibration: 0.03,
    pressure: 30,
    rpm: 1500,
  });

  const handlePredict = async () => {
    try {
      await runPrediction(sensorForm);
    } catch (e) {
      // Error already handled by hook
    }
  };

  if (loading) return <Loader text="Loading machine data..." />;
  if (error) return <ErrorFallback message={error} onRetry={refetch} />;

  const latestPrediction = predictions?.[0] || null;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 rounded-xl bg-surface-800 hover:bg-surface-700 border border-white/5 flex items-center justify-center transition-colors"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="page-title">{machine?.name}</h1>
            {machine?.status && <StatusBadge status={machine.status} />}
          </div>
          <p className="text-sm text-gray-400 mt-0.5">{machine?.location}</p>
        </div>
      </div>

      {/* Top Section: Health Gauge + Prediction Trigger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Health Gauge */}
        <div className="glass-card p-6 rounded-2xl flex items-center justify-center">
          <HealthGauge score={latestPrediction?.healthScore ?? machine?.healthScore} size="lg" />
        </div>

        {/* Sensor Input & Predict Button */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-2">
          <h3 className="section-title mb-4">Run Prediction</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { key: 'temperature', label: 'Temperature (°C)', min: 50, max: 120, step: 1 },
              { key: 'vibration', label: 'Vibration (mm/s)', min: 0.005, max: 0.1, step: 0.001 },
              { key: 'pressure', label: 'Pressure (PSI)', min: 15, max: 50, step: 0.5 },
              { key: 'rpm', label: 'RPM', min: 500, max: 2500, step: 10 },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">
                  {field.label}
                </label>
                <input
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={sensorForm[field.key]}
                  onChange={(e) =>
                    setSensorForm((prev) => ({ ...prev, [field.key]: parseFloat(e.target.value) || 0 }))
                  }
                  className="w-full bg-surface-900 border border-white/5 rounded-lg px-3 py-2 text-sm text-gray-200 font-mono focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-colors"
                />
              </div>
            ))}
          </div>
          <button
            onClick={handlePredict}
            disabled={predicting}
            className="w-full py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {predicting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Running Prediction...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Run AI Prediction
              </>
            )}
          </button>
        </div>
      </div>

      {/* Middle Section: Digital Twin + Prediction Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DigitalTwinViewer machine={machine} prediction={latestPrediction} />
        <PredictionPanel prediction={latestPrediction} />
      </div>

      {/* Charts */}
      <div className="mb-6">
        <SensorChart predictions={predictions} />
      </div>

      {/* Alerts for this machine */}
      {alerts.length > 0 && (
        <div>
          <h2 className="section-title mb-4">Machine Alerts</h2>
          <AlertBanner alerts={alerts} />
        </div>
      )}
    </div>
  );
}
