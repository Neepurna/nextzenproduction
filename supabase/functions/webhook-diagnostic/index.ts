// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// Declare Deno global for TypeScript
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response>): void;
};

Deno.serve(async (req: Request) => {
  console.log('🔍 Webhook Diagnostic - Request received')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  console.log('Headers:', Object.fromEntries(req.headers.entries()))
  
  const body = await req.text()
  console.log('Body length:', body.length)
  console.log('Body preview:', body.substring(0, 200))
  
  // Return success so Stripe doesn't retry
  return new Response(JSON.stringify({
    message: 'Diagnostic complete',
    timestamp: new Date().toISOString(),
    bodyLength: body.length,
    headers: Object.fromEntries(req.headers.entries())
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
})