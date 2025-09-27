// Simple test function to isolate the issue
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Test checkout function loaded")

Deno.serve(async (req) => {
  console.log('Test function called, method:', req.method)
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const body = await req.text()
    console.log('Raw request body:', body)
    
    const data = JSON.parse(body)
    console.log('Parsed data:', data)
    
    // Just return success for testing
    return new Response(
      JSON.stringify({ 
        success: true, 
        received: data,
        sessionId: 'test_session_id' 
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      },
    )
  } catch (error) {
    console.error('Test function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      },
    )
  }
})