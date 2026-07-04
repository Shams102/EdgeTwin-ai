/**
 * Format a health score to display string.
 * @param {number} score - Health score 0-100
 * @returns {string}
 */
export const formatHealthScore = (score) => {
  if (score == null) return '--';
  return `${Math.round(score)}%`;
};

/**
 * Format failure probability to percentage.
 * @param {number} prob - 0.0 to 1.0
 * @returns {string}
 */
export const formatProbability = (prob) => {
  if (prob == null) return '--';
  return `${Math.round(prob * 100)}%`;
};

/**
 * Format a timestamp to relative time or date string.
 * @param {string} isoString
 * @returns {string}
 */
export const formatTimestamp = (isoString) => {
  if (!isoString) return '--';

  const date = new Date(isoString);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/**
 * Get health color class based on score.
 * @param {number} score - 0 to 100
 * @returns {string} Tailwind color class
 */
export const getHealthColor = (score) => {
  if (score == null) return 'text-gray-400';
  if (score >= 70) return 'text-emerald-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
};

/**
 * Get health gradient for SVG/canvas.
 * @param {number} score
 * @returns {string} hex color
 */
export const getHealthHex = (score) => {
  if (score == null) return '#9ca3af';
  if (score >= 70) return '#10b981';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};
