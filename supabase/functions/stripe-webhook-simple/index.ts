import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.11.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

console.log("Simple webhook loaded - EMAIL SENDING DISABLED")

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': '*',
      },
    })
  }

  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')
    
    if (!signature) {
      console.error('No Stripe signature found')
      return new Response('No signature', { status: 401 })
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
    
    console.log('Event type:', event.type)
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      console.log('Payment completed for session:', session.id)
      console.log('EMAIL SENDING DISABLED - EmailJS handles emails')
      
      // Only update seats - NO EMAIL SENDING
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      const seatIds = session.metadata?.seats?.split(',') || []
      
      if (seatIds.length > 0) {
        await supabase
          .from('seats')
          .update({ 
            status: 'occupied',
            stripe_session_id: session.id
          })
          .in('id', seatIds)
        
        console.log('Seats updated - Email handled by frontend EmailJS')
      }
    }

    return new Response('OK', { status: 200 })
    
  } catch (error: any) {
    console.error('Webhook error:', error)
    return new Response('Error', { status: 400 })
  }
})
