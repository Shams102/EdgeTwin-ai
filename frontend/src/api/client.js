import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    console.error('[API Error]', message, error.response?.status);
    return Promise.reject({ message, status: error.response?.status });
  }
);

// Dashboard
export const getDashboardSummary = () => api.get('/dashboard/summary');

// Machines
export const getMachines = () => api.get('/machines');
export const getMachine = (id) => api.get(`/machines/${id}`);

// Predictions
export const triggerPrediction = (machineId, sensorData) =>
  api.post(`/machines/${machineId}/predict`, sensorData);
export const getPredictions = (machineId, limit = 20) =>
  api.get(`/machines/${machineId}/predictions?limit=${limit}`);

// Alerts
export const getAlerts = (severity, limit = 20) => {
  const params = new URLSearchParams();
  if (severity) params.append('severity', severity);
  params.append('limit', limit);
  return api.get(`/alerts?${params}`);
};
export const getAlertsByMachine = (machineId, limit = 10) =>
  api.get(`/alerts/machine/${machineId}?limit=${limit}`);

export default api;
