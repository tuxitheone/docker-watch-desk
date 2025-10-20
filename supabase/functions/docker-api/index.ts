import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DOCKER_SOCKET = '/var/run/docker.sock';

// Helper to make Unix socket HTTP requests to Docker API
async function dockerRequest(path: string, method = 'GET', body?: any) {
  const conn = await Deno.connect({ transport: "unix", path: DOCKER_SOCKET });
  
  const request = [
    `${method} ${path} HTTP/1.1`,
    'Host: localhost',
    'Content-Type: application/json',
    body ? `Content-Length: ${new TextEncoder().encode(JSON.stringify(body)).length}` : '',
    '',
    body ? JSON.stringify(body) : ''
  ].join('\r\n');

  await conn.write(new TextEncoder().encode(request));
  
  const decoder = new TextDecoder();
  const buffer = new Uint8Array(65536);
  const n = await conn.read(buffer);
  conn.close();
  
  if (!n) throw new Error('No response from Docker');
  
  const response = decoder.decode(buffer.subarray(0, n));
  const [headers, ...bodyParts] = response.split('\r\n\r\n');
  const responseBody = bodyParts.join('\r\n\r\n');
  
  // Check for chunked transfer encoding
  if (headers.includes('Transfer-Encoding: chunked')) {
    const chunks: string[] = [];
    const lines = responseBody.split('\r\n');
    for (let i = 0; i < lines.length; i++) {
      const chunkSize = parseInt(lines[i], 16);
      if (chunkSize === 0) break;
      if (i + 1 < lines.length) {
        chunks.push(lines[i + 1]);
        i++; // Skip the chunk data line
      }
    }
    return JSON.parse(chunks.join(''));
  }
  
  return JSON.parse(responseBody);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const url = new URL(req.url);
    const path = url.pathname.replace('/docker-api', '');
    
    // List all containers
    if (path === '/containers' && req.method === 'GET') {
      const containers = await dockerRequest('/containers/json?all=true');
      return new Response(JSON.stringify(containers), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Get container details
    if (path.match(/^\/containers\/[^\/]+$/) && req.method === 'GET') {
      const containerId = path.split('/')[2];
      const details = await dockerRequest(`/containers/${containerId}/json`);
      return new Response(JSON.stringify(details), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Container actions: start, stop, restart
    if (path.match(/^\/containers\/[^\/]+\/(start|stop|restart)$/) && req.method === 'POST') {
      const parts = path.split('/');
      const containerId = parts[2];
      const action = parts[3];
      
      const details = await dockerRequest(`/containers/${containerId}/json`);
      const containerName = details.Name.replace(/^\//, '');
      
      await dockerRequest(`/containers/${containerId}/${action}`, 'POST');
      
      // Log to audit log
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: action,
        container_id: containerId,
        container_name: containerName,
        details: { timestamp: new Date().toISOString() }
      });
      
      return new Response(JSON.stringify({ success: true, action, containerId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Docker API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
