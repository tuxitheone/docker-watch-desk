import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const DOCKER_SOCKET = '/var/run/docker.sock';
const HOST_PROC = '/host/proc';

// Helper to make Unix socket HTTP requests
async function dockerRequest(path: string) {
  const conn = await Deno.connect({ transport: "unix", path: DOCKER_SOCKET });
  
  const request = `GET ${path} HTTP/1.1\r\nHost: localhost\r\n\r\n`;
  await conn.write(new TextEncoder().encode(request));
  
  const decoder = new TextDecoder();
  const buffer = new Uint8Array(65536);
  const n = await conn.read(buffer);
  conn.close();
  
  if (!n) throw new Error('No response');
  
  const response = decoder.decode(buffer.subarray(0, n));
  const [, body] = response.split('\r\n\r\n');
  
  return JSON.parse(body);
}

// Read host metrics from /proc
async function getHostMetrics() {
  try {
    // CPU info
    const cpuInfo = await Deno.readTextFile(`${HOST_PROC}/stat`);
    const cpuLine = cpuInfo.split('\n')[0];
    const cpuValues = cpuLine.split(/\s+/).slice(1).map(Number);
    const total = cpuValues.reduce((a, b) => a + b, 0);
    const idle = cpuValues[3];
    const cpuUsage = ((total - idle) / total) * 100;

    // Memory info
    const memInfo = await Deno.readTextFile(`${HOST_PROC}/meminfo`);
    const memLines = memInfo.split('\n');
    const memTotal = parseInt(memLines.find(l => l.startsWith('MemTotal'))?.split(/\s+/)[1] || '0');
    const memFree = parseInt(memLines.find(l => l.startsWith('MemFree'))?.split(/\s+/)[1] || '0');
    const memAvailable = parseInt(memLines.find(l => l.startsWith('MemAvailable'))?.split(/\s+/)[1] || '0');
    
    // Uptime
    const uptime = await Deno.readTextFile(`${HOST_PROC}/uptime`);
    const uptimeSeconds = parseFloat(uptime.split(' ')[0]);

    return {
      cpu: { usage: cpuUsage.toFixed(2) },
      memory: {
        total: memTotal,
        free: memFree,
        available: memAvailable,
        used: memTotal - memFree,
        usage: ((memTotal - memAvailable) / memTotal * 100).toFixed(2)
      },
      uptime: uptimeSeconds
    };
  } catch (error) {
    console.error('Error reading host metrics:', error);
    return {
      cpu: { usage: 0 },
      memory: { total: 0, free: 0, available: 0, used: 0, usage: 0 },
      uptime: 0
    };
  }
}

serve(async (req) => {
  const upgrade = req.headers.get("upgrade") || "";
  
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket", { status: 400 });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response("Missing authorization", { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);

    let intervalId: number;

    socket.onopen = () => {
      console.log("WebSocket metrics connection opened");
      
      // Send metrics every 2 seconds
      intervalId = setInterval(async () => {
        try {
          const hostMetrics = await getHostMetrics();
          const containers = await dockerRequest('/containers/json');
          
          const containerStats = [];
          for (const container of containers) {
            try {
              const stats = await dockerRequest(`/containers/${container.Id}/stats?stream=false`);
              containerStats.push({
                id: container.Id,
                name: container.Names[0].replace(/^\//, ''),
                cpu: calculateCPUPercent(stats),
                memory: calculateMemoryUsage(stats),
                network: calculateNetworkIO(stats),
                blockIO: calculateBlockIO(stats)
              });
            } catch (e) {
              console.error(`Error getting stats for ${container.Id}:`, e);
            }
          }

          socket.send(JSON.stringify({
            type: 'metrics',
            timestamp: new Date().toISOString(),
            host: hostMetrics,
            containers: containerStats
          }));
        } catch (error) {
          console.error('Error sending metrics:', error);
        }
      }, 2000);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
      if (intervalId) clearInterval(intervalId);
    };

    socket.onerror = (e) => {
      console.error("WebSocket error:", e);
      if (intervalId) clearInterval(intervalId);
    };

    return response;
  } catch (error) {
    console.error("WebSocket setup error:", error);
    return new Response("Internal error", { status: 500 });
  }
});

// Helper functions to calculate stats
function calculateCPUPercent(stats: any): string {
  const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
  const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
  const cpuPercent = (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100;
  return cpuPercent.toFixed(2);
}

function calculateMemoryUsage(stats: any): { used: number; limit: number; percent: string } {
  const used = stats.memory_stats.usage - (stats.memory_stats.stats?.cache || 0);
  const limit = stats.memory_stats.limit;
  const percent = (used / limit * 100).toFixed(2);
  return { used, limit, percent };
}

function calculateNetworkIO(stats: any): { rx: number; tx: number } {
  const networks = stats.networks || {};
  let rx = 0, tx = 0;
  for (const net of Object.values(networks) as any[]) {
    rx += net.rx_bytes || 0;
    tx += net.tx_bytes || 0;
  }
  return { rx, tx };
}

function calculateBlockIO(stats: any): { read: number; write: number } {
  const io = stats.blkio_stats.io_service_bytes_recursive || [];
  let read = 0, write = 0;
  for (const entry of io) {
    if (entry.op === 'Read') read += entry.value;
    if (entry.op === 'Write') write += entry.value;
  }
  return { read, write };
}
