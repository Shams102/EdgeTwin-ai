import { useState, useEffect } from 'react';
import useDashboard from '../hooks/useDashboard';
import FleetOverview from '../components/dashboard/FleetOverview';
import AlertBanner from '../components/dashboard/AlertBanner';
import Loader from '../components/common/Loader';
import ErrorFallback from '../components/common/ErrorFallback';

export default function DashboardPage() {
  const { data, loading, error, refetch } = useDashboard();
  const [lastUpdated, setLastUpdated] = useState(null);

  // Track when data last refreshed
  useEffect(() => {
    if (data) setLastUpdated(new Date());
  }, [data]);

  if (loading && !data) return <Loader text="Loading fleet data..." />;
  if (error && !data) return <ErrorFallback message={error} onRetry={refetch} />;
  if (!data) return null;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Fleet Overview</h1>
          <p className="text-sm text-gray-400 mt-1">
            Monitoring {data.totalMachines} machines across your facility
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-800/60 border border-white/5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-gray-400">Live</span>
            {lastUpdated && (
              <span className="text-[10px] text-gray-600 font-mono">
                {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-surface-800 hover:bg-surface-700 border border-white/5 rounded-xl text-sm text-gray-300 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Machines', value: data.totalMachines, color: 'text-primary-400', bg: 'from-primary-500/10' },
          { label: 'Running', value: data.running, color: 'text-emerald-400', bg: 'from-emerald-500/10' },
          { label: 'Warning', value: data.warning, color: 'text-amber-400', bg: 'from-amber-500/10' },
          { label: 'Critical', value: data.critical, color: 'text-red-400', bg: 'from-red-500/10' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`glass-card p-4 bg-gradient-to-br ${stat.bg} to-transparent animate-slide-up`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <p className="metric-label">{stat.label}</p>
            <p className={`metric-value mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Fleet Grid */}
      <div className="mb-8">
        <h2 className="section-title mb-4">Machines</h2>
        <FleetOverview machines={data.machines} />
      </div>

      {/* Recent Alerts */}
      <div>
        <h2 className="section-title mb-4">Recent Alerts</h2>
        <AlertBanner alerts={data.recentAlerts} />
      </div>
    </div>
  );
}
