// Debug webhook to understand 401 errors
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import Stripe from 'https://esm.sh/stripe@13.11.0'

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response>): void;
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

Deno.serve(async (req: Request) => {
  console.log('🔍 WEBHOOK DEBUG - Request received')
  console.log('🔍 Method:', req.method)
  console.log('🔍 URL:', req.url)
  
  // Log all headers
  const headers = Object.fromEntries(req.headers.entries())
  console.log('🔍 Headers:', headers)
  
  // Check for Stripe signature
  const signature = req.headers.get('stripe-signature')
  console.log('🔍 Stripe Signature present:', !!signature)
  console.log('🔍 Stripe Signature preview:', signature ? signature.substring(0, 50) + '...' : 'MISSING')
  
  // Check environment variables
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
  console.log('🔍 Environment check:')
  console.log('  - STRIPE_WEBHOOK_SECRET present:', !!webhookSecret)
  console.log('  - STRIPE_SECRET_KEY present:', !!stripeKey)
  console.log('  - Webhook secret preview:', webhookSecret ? webhookSecret.substring(0, 20) + '...' : 'MISSING')
  
  if (!signature) {
    console.log('❌ No signature found - returning 400')
    return new Response(JSON.stringify({
      error: 'No stripe-signature header found',
      receivedHeaders: Object.keys(headers),
      timestamp: new Date().toISOString()
    }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await req.text()
    console.log('🔍 Body length:', body.length)
    console.log('🔍 Body preview:', body.substring(0, 200))
    
    if (!webhookSecret) {
      console.log('❌ No webhook secret found')
      return new Response(JSON.stringify({
        error: 'STRIPE_WEBHOOK_SECRET environment variable not set',
        timestamp: new Date().toISOString()
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Try to verify the webhook
    console.log('🔍 Attempting to verify webhook signature...')
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    
    console.log('✅ Webhook verified successfully!')
    console.log('🔍 Event type:', event.type)
    console.log('🔍 Event ID:', event.id)
    
    return new Response(JSON.stringify({
      success: true,
      eventType: event.type,
      eventId: event.id,
      timestamp: new Date().toISOString(),
      message: 'Webhook verified and processed successfully'
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error: any) {
    console.error('❌ Webhook verification failed:', error)
    console.error('❌ Error details:', {
      message: error?.message,
      type: error?.type,
      stack: error?.stack
    })
    
    return new Response(JSON.stringify({
      error: 'Webhook verification failed',
      details: error?.message,
      errorType: error?.type,
      timestamp: new Date().toISOString()
    }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})