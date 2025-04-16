import React, { useEffect, useState } from 'react';
import { simulationApi, HastadAttackResponse } from '../api/simulationApi';

interface AsyncSimulationResultFetcherProps {
  simulationId: string;
  params: any;
  show: boolean;
  onResult: (result: any) => void;
  onError?: (error: string) => void;
}

const AsyncSimulationResultFetcher: React.FC<AsyncSimulationResultFetcherProps> = ({
  simulationId,
  params,
  show,
  onResult,
  onError
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HastadAttackResponse | null>(null);

  useEffect(() => {
    if (!show) return;
    setLoading(true);
    setError(null);
    setResult(null);
    const fetchResult = async () => {
      try {
        let res;
        if (simulationId === 'hastad-attack') {
          res = await simulationApi.runHastadAttack(params);
        } else {
          // Add more simulation types as needed
          res = null;
        }
        setResult(res);
        onResult(res);
      } catch (err) {
        const msg = `Error fetching simulation result: ${err instanceof Error ? err.message : String(err)}`;
        setError(msg);
        if (onError) onError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, simulationId, JSON.stringify(params)]);

  if (!show) return null;
  if (loading) return <div className="p-4">Fetching simulation result...</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!result) return null;
  return null; // Result is passed to parent via onResult
};

export default AsyncSimulationResultFetcher;
