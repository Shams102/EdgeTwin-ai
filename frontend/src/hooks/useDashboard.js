import { useState, useEffect, useCallback } from 'react';
import { getDashboardSummary } from '../api/client';

const POLL_INTERVAL_MS = 3000;

export default function useDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const response = await getDashboardSummary();
      setData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load with spinner
    fetchDashboard(true);
    // Silent background poll every 3s
    const id = setInterval(() => fetchDashboard(false), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchDashboard]);

  // Manual refetch shows the loading spinner
  const refetch = () => fetchDashboard(true);

  return { data, loading, error, refetch };
}
