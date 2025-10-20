import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ContainerMetrics {
  id: string;
  name: string;
  cpu: string;
  memory: {
    used: number;
    limit: number;
    percent: string;
  };
  network: {
    rx: number;
    tx: number;
  };
  blockIO: {
    read: number;
    write: number;
  };
}

interface HostMetrics {
  cpu: { usage: string };
  memory: {
    total: number;
    free: number;
    available: number;
    used: number;
    usage: string;
  };
  uptime: number;
}

interface MetricsData {
  type: string;
  timestamp: string;
  host: HostMetrics;
  containers: ContainerMetrics[];
}

export function useDockerMetrics() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;

    const connect = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('Not authenticated');
          return;
        }

        const wsUrl = `${import.meta.env.VITE_SUPABASE_URL.replace('https://', 'wss://')}/functions/v1/docker-metrics`;
        ws = new WebSocket(wsUrl, ['Bearer', session.access_token]);

        ws.onopen = () => {
          console.log('WebSocket connected');
          setConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setMetrics(data);
          } catch (e) {
            console.error('Failed to parse metrics:', e);
          }
        };

        ws.onerror = (e) => {
          console.error('WebSocket error:', e);
          setError('Connection error');
          setConnected(false);
        };

        ws.onclose = () => {
          console.log('WebSocket closed');
          setConnected(false);
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            if (!ws || ws.readyState === WebSocket.CLOSED) {
              connect();
            }
          }, 5000);
        };

      } catch (e) {
        console.error('Failed to connect:', e);
        setError('Failed to connect');
      }
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return { metrics, connected, error };
}
