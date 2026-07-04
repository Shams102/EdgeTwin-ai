import { SEVERITY_COLORS } from '../../utils/constants';
import { formatTimestamp } from '../../utils/formatters';

export default function AlertBanner({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-2 text-emerald-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">No active alerts</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, index) => {
        const colors = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.INFO;
        return (
          <div
            key={alert.id}
            className={`glass-card p-4 rounded-xl border ${colors.border} animate-slide-in-right`}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex items-start gap-3">
              {/* Severity icon */}
              <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                {alert.severity === 'CRITICAL' ? (
                  <svg className={`w-4 h-4 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                ) : (
                  <svg className={`w-4 h-4 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                    {alert.severity}
                  </span>
                  {alert.machineName && (
                    <span className="text-xs text-gray-500">• {alert.machineName}</span>
                  )}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{alert.message}</p>
                <p className="text-[11px] text-gray-500 mt-1">{formatTimestamp(alert.triggeredAt)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
