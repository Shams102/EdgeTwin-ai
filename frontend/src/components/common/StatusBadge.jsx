import { STATUS_COLORS } from '../../utils/constants';

export default function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.STOPPED;

  return (
    <span className={`status-badge ${colors.class}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} animate-pulse`} />
      {status}
    </span>
  );
}
