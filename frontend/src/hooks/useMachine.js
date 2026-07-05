import { useState, useEffect, useCallback } from 'react';
import { getMachine, getPredictions, triggerPrediction, getAlertsByMachine } from '../api/client';

const POLL_INTERVAL_MS = 3000;

export default function useMachine(machineId) {
  const [machine, setMachine] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [predicting, setPredicting] = useState(false);

  const fetchMachineData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const [machineRes, predRes, alertRes] = await Promise.all([
        getMachine(machineId),
        getPredictions(machineId, 20),
        getAlertsByMachine(machineId, 10),
      ]);
      setMachine(machineRes.data);
      setPredictions(predRes.data);
      setAlerts(alertRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load machine data');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [machineId]);

  const runPrediction = useCallback(async (sensorData) => {
    try {
      setPredicting(true);
      const response = await triggerPrediction(machineId, sensorData);
      await fetchMachineData(false);
      return response.data;
    } catch (err) {
      setError(err.message || 'Prediction failed');
      throw err;
    } finally {
      setPredicting(false);
    }
  }, [machineId, fetchMachineData]);

  useEffect(() => {
    if (!machineId) return;
    // Initial load with spinner
    fetchMachineData(true);
    // Silent background poll every 3s
    const id = setInterval(() => fetchMachineData(false), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [machineId, fetchMachineData]);

  const refetch = () => fetchMachineData(true);

  return {
    machine,
    predictions,
    alerts,
    loading,
    error,
    predicting,
    runPrediction,
    refetch,
  };
}
