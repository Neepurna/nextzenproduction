// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// @ts-ignore - External module imports for Supabase Edge Functions
import Stripe from 'https://esm.sh/stripe@13.11.0'

// Declare Deno global for TypeScript
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response>): void;
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

console.log("Get session details function loaded")

Deno.serve(async (req: Request) => {
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

  console.log('Get session details function called')

  try {
    const body = await req.text()
    console.log('Raw request body:', body)
    
    let requestData
    try {
      requestData = JSON.parse(body)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      throw new Error('Invalid JSON in request body')
    }
    
    const { sessionId } = requestData
    console.log('Getting details for session:', sessionId)
    
    if (!sessionId) {
      throw new Error('No session ID provided')
    }

    // Get session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    console.log('Retrieved session:', session.id, 'customer_email:', session.customer_details?.email)

    return new Response(
      JSON.stringify({ 
        customer_email: session.customer_details?.email || null,
        customer_name: session.customer_details?.name || null,
        session_id: session.id
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      },
    )
  } catch (error: any) {
    console.error('Error getting session details:', error)
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error occurred' }),
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