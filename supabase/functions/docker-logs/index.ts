import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DOCKER_SOCKET = '/var/run/docker.sock';

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
    const containerId = url.searchParams.get('container');
    const tail = url.searchParams.get('tail') || '100';
    
    if (!containerId) {
      throw new Error('Container ID required');
    }

    // Connect to Docker socket
    const conn = await Deno.connect({ transport: "unix", path: DOCKER_SOCKET });
    
    const request = `GET /containers/${containerId}/logs?stdout=true&stderr=true&tail=${tail}&follow=true HTTP/1.1\r\nHost: localhost\r\n\r\n`;
    await conn.write(new TextEncoder().encode(request));
    
    // Create a readable stream from the socket
    const stream = new ReadableStream({
      async start(controller) {
        const decoder = new TextDecoder();
        let buffer = new Uint8Array(8192);
        let headerRead = false;
        
        try {
          while (true) {
            const n = await conn.read(buffer);
            if (n === null) break;
            
            let data = decoder.decode(buffer.subarray(0, n));
            
            // Skip HTTP headers on first read
            if (!headerRead) {
              const headerEnd = data.indexOf('\r\n\r\n');
              if (headerEnd !== -1) {
                data = data.substring(headerEnd + 4);
                headerRead = true;
              }
            }
            
            // Docker logs use a special frame format:
            // [8]byte{STREAM_TYPE, 0, 0, 0, SIZE1, SIZE2, SIZE3, SIZE4}
            // We'll parse and clean this
            const lines = data.split('\n').filter(line => {
              // Skip binary headers (first 8 bytes of each frame)
              if (line.length > 8) {
                return line.substring(8).trim().length > 0;
              }
              return false;
            });
            
            for (const line of lines) {
              if (line.length > 8) {
                const cleaned = line.substring(8).trim();
                if (cleaned) {
                  controller.enqueue(new TextEncoder().encode(`data: ${cleaned}\n\n`));
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
        } finally {
          conn.close();
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Docker logs error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
