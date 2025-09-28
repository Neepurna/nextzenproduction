// Simplified Stripe webhook without authentication issues
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
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

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const resendApiKey = Deno.env.get('RESEND_API_KEY')!

console.log("🚀 Simple Stripe webhook handler loaded")

Deno.serve(async (req: Request) => {
  console.log('📨 Webhook request received')
  console.log('🔍 Method:', req.method)
  console.log('🔍 Headers:', Object.fromEntries(req.headers.entries()))
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': '*',
      },
    })
  }

  const signature = req.headers.get('stripe-signature')
  
  if (!signature) {
    console.log('❌ No Stripe signature found')
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    
    console.log('🔐 Verifying webhook signature...')
    
    // Try both sync and async methods
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
    } catch (asyncError) {
      console.log('Async method failed, trying sync method...')
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    }
    
    console.log('✅ Webhook verified successfully!')
    console.log('🎯 Event type:', event.type)
    console.log('🔢 Event ID:', event.id)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      
      console.log('💳 Payment successful for session:', session.id)
      console.log('📧 Customer email:', session.customer_details?.email)
      
      // Create booking data
      const bookingData = {
        movie: session.metadata?.movie || 'Test Movie',
        date: session.metadata?.date || 'TBD',
        time: session.metadata?.time || 'TBD', 
        theater: session.metadata?.theater || 'Main Theater',
        seats: session.metadata?.seats || '1,2',
        total: (session.amount_total || 0) / 100,
        bookingId: session.id,
        customerEmail: 'neepurna@gmail.com', // Test mode - all emails to admin
        originalCustomerEmail: session.customer_details?.email || 'no-email@example.com'
      }
      
      console.log('🎫 Booking data:', bookingData)
      
      // Try to send email
      try {
        console.log('📧 Attempting to send email...')
        
        const emailData = {
          from: 'Next Zen Production <onboarding@resend.dev>',
          to: bookingData.customerEmail,
          subject: `🎬 Your Movie Ticket - ${bookingData.movie}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #00ff88;">🎬 Next Zen Production</h1>
              
              <div style="background: #ffeb3b; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0; color: #e65100;">🧪 TEST MODE</h3>
                <p style="margin: 10px 0; color: #bf360c;">Original Customer: ${bookingData.originalCustomerEmail}</p>
              </div>

              <h2>Payment Successful! ✅</h2>
              <p>Your ticket for <strong>${bookingData.movie}</strong> is confirmed.</p>
              
              <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>📋 Booking Details:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li><strong>🎬 Movie:</strong> ${bookingData.movie}</li>
                  <li><strong>📅 Date:</strong> ${bookingData.date}</li>
                  <li><strong>🕐 Time:</strong> ${bookingData.time}</li>
                  <li><strong>📍 Theater:</strong> ${bookingData.theater}</li>
                  <li><strong>💺 Seats:</strong> ${bookingData.seats}</li>
                  <li><strong>💰 Total:</strong> $${bookingData.total}</li>
                  <li><strong>🎫 Booking ID:</strong> ${bookingData.bookingId}</li>
                </ul>
              </div>
              
              <p style="text-align: center; color: #666;">
                🎉 Webhook is working! Email delivery successful! 🎉
              </p>
            </div>
          `
        }

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailData)
        })

        const result = await response.json()
        console.log('📧 Email API response:', response.status, result)
        
        if (response.ok) {
          console.log('🎉 EMAIL SENT SUCCESSFULLY!')
        } else {
          console.log('❌ Email failed:', result)
        }
        
      } catch (emailError) {
        console.error('❌ Email error:', emailError)
      }
      
      // Update seats in database
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        const seatIds = bookingData.seats.split(',')
        
        const { error } = await supabase
          .from('seats')
          .update({ 
            status: 'occupied',
            stripe_session_id: session.id,
            booking_id: crypto.randomUUID()
          })
          .in('id', seatIds)
        
        if (error) {
          console.error('Database error:', error)
        } else {
          console.log('✅ Seats updated successfully')
        }
      } catch (dbError) {
        console.error('❌ Database error:', dbError)
      }
    }

    console.log('✅ Webhook processed successfully')
    return new Response('Webhook handled successfully', { status: 200 })
    
  } catch (error: any) {
    console.error('❌ Webhook error:', error)
    console.error('❌ Error details:', error.message, error.stack)
    return new Response(`Webhook error: ${error.message}`, { status: 400 })
  }
})