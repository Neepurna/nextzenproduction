// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.11.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

console.log("Create checkout session function loaded")

Deno.serve(async (req) => {
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

  console.log('Function called, method:', req.method)
  console.log('Environment check - STRIPE_SECRET_KEY exists:', !!Deno.env.get('STRIPE_SECRET_KEY'))
  console.log('Environment check - SUPABASE_URL exists:', !!Deno.env.get('SUPABASE_URL'))

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
    
    const { selectedSeats, movieDetails } = requestData
    console.log('Parsed data - selectedSeats:', selectedSeats, 'movieDetails:', movieDetails)
    
    if (!selectedSeats || selectedSeats.length === 0) {
      throw new Error('No seats selected')
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Create line items for Stripe
    const lineItems = [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${movieDetails.title} - Movie Tickets`,
          description: `${movieDetails.date} at ${movieDetails.time} - ${movieDetails.theater}`,
        },
        unit_amount: 1500, // $15.00 per ticket
      },
      quantity: selectedSeats.length,
    }]

    // Create Stripe checkout session
    console.log('Creating Stripe session with lineItems:', JSON.stringify(lineItems))
    console.log('Origin header:', req.headers.get('origin'))
    
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.get('origin') || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin') || 'http://localhost:5173'}/`,
      metadata: {
        seats: selectedSeats.join(','),
        movie: movieDetails.title,
        date: movieDetails.date,
        time: movieDetails.time,
        theater: movieDetails.theater,
      },
    }
    
    console.log('Session config:', JSON.stringify(sessionConfig))
    
    let session
    try {
      session = await stripe.checkout.sessions.create(sessionConfig)
      console.log('Stripe session created successfully:', session.id)
    } catch (stripeError) {
      console.error('Stripe error:', stripeError)
      throw new Error(`Stripe session creation failed: ${stripeError.message}`)
    }

    // Update seat status to 'held' temporarily
    const { error: updateError } = await supabase
      .from('seats')
      .upsert(
        selectedSeats.map((seatId: string) => ({
          id: seatId,
          status: 'held',
          stripe_session_id: session.id,
          held_until: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // Hold for 15 minutes
        }))
      )

    if (updateError) {
      console.error('Error updating seat status:', updateError)
      throw updateError
    }

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      },
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
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

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-checkout-session' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
