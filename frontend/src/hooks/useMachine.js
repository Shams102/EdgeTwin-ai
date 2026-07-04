import { useState, useEffect, useCallback } from 'react';
import { getMachine, getPredictions, triggerPrediction } from '../api/client';
import { getAlertsByMachine } from '../api/client';

export default function useMachine(machineId) {
  const [machine, setMachine] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [predicting, setPredicting] = useState(false);

  const fetchMachineData = useCallback(async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  }, [machineId]);

  const runPrediction = useCallback(async (sensorData) => {
    try {
      setPredicting(true);
      const response = await triggerPrediction(machineId, sensorData);
      // Refresh all data after prediction
      await fetchMachineData();
      return response.data;
    } catch (err) {
      setError(err.message || 'Prediction failed');
      throw err;
    } finally {
      setPredicting(false);
    }
  }, [machineId, fetchMachineData]);

  useEffect(() => {
    if (machineId) fetchMachineData();
  }, [machineId, fetchMachineData]);

  return {
    machine,
    predictions,
    alerts,
    loading,
    error,
    predicting,
    runPrediction,
    refetch: fetchMachineData,
  };
}
