import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface DockerContainer {
  Id: string;
  Names: string[];
  Image: string;
  State: string;
  Status: string;
  Created: number;
  Ports?: any[];
}

export function useDockerContainers() {
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchContainers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/docker-api/containers`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch containers');

      const data = await response.json();
      setContainers(data);
    } catch (error: any) {
      console.error('Error fetching containers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load containers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const controlContainer = async (containerId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/docker-api/containers/${containerId}/${action}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error(`Failed to ${action} container`);

      toast({
        title: 'Success',
        description: `Container ${action}ed successfully`,
      });

      // Refresh container list
      await fetchContainers();
    } catch (error: any) {
      console.error(`Error ${action}ing container:`, error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchContainers();
    
    // Poll for updates every 5 seconds as backup to WebSocket
    const interval = setInterval(fetchContainers, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return { containers, loading, controlContainer, refetch: fetchContainers };
}
