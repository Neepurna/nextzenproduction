// Minimal Stripe test function
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import Stripe from 'https://esm.sh/stripe@13.11.0'

console.log("Stripe test function loaded")

Deno.serve(async (req) => {
  console.log('Stripe test function called')
  
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
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    console.log('Stripe key exists:', !!stripeKey)
    console.log('Stripe key prefix:', stripeKey ? stripeKey.substring(0, 20) + '...' : 'none')
    
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable not set')
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    })

    // Simple test - create a minimal checkout session
    console.log('Creating test Stripe session...')
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Test Movie Ticket',
          },
          unit_amount: 1500,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/',
    })

    console.log('Stripe session created successfully:', session.id)

    return new Response(
      JSON.stringify({ 
        success: true,
        sessionId: session.id,
        stripeKeyPrefix: stripeKey.substring(0, 20) + '...'
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      },
    )
  } catch (error) {
    console.error('Stripe test error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack
      }),
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