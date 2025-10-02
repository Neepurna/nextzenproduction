// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// @ts-ignore - External module imports for Supabase Edge Functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
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

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const resendApiKey = Deno.env.get('RESEND_API_KEY')!

console.log("Stripe webhook handler loaded")

// Function to generate QR code URL
function generateQRCode(bookingData: any) {
  // Create user-friendly QR code text that shows "Valid Ticket" when scanned
  const qrText = `✅ VALID TICKET
🎬 ${bookingData.movie}
📅 ${bookingData.date} at ${bookingData.time}
🎭 ${bookingData.theater}
💺 Seats: ${bookingData.seats}
🎫 Booking: ${bookingData.bookingId}
💰 Paid: $${bookingData.total}

✨ Next Zen Production
Present this ticket at entrance`;
  
  const encodedText = encodeURIComponent(qrText);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedText}`;
}

// Function to generate PDF ticket
async function generatePDFTicket(bookingData: any) {
  const qrCodeUrl = generateQRCode(bookingData);
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .ticket { 
          background: white; 
          border: 2px solid #00ff88; 
          padding: 30px; 
          border-radius: 15px; 
          max-width: 500px;
          margin: 0 auto;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header { text-align: center; color: #00ff88; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 2em; }
        .header h2 { margin: 10px 0; color: #333; }
        .info { margin: 15px 0; display: flex; justify-content: space-between; }
        .label { font-weight: bold; color: #666; }
        .value { color: #333; }
        .seats { 
          background: #f8f9fa; 
          padding: 20px; 
          border-radius: 8px; 
          text-align: center;
          margin: 20px 0;
        }
        .qr-section {
          text-align: center;
          margin: 25px 0;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .total { 
          border-top: 2px solid #00ff88; 
          padding-top: 15px; 
          text-align: center;
          font-size: 1.2em;
          font-weight: bold;
        }
        .footer { 
          text-align: center; 
          color: #888; 
          font-size: 0.9em; 
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="header">
          <h1>🎬 Next Zen Production</h1>
          <h2>${bookingData.movie}</h2>
        </div>
        
        <div class="info">
          <span class="label">Date:</span>
          <span class="value">${bookingData.date}</span>
        </div>
        
        <div class="info">
          <span class="label">Time:</span>
          <span class="value">${bookingData.time}</span>
        </div>
        
        <div class="info">
          <span class="label">Theater:</span>
          <span class="value">${bookingData.theater}</span>
        </div>
        
        <div class="seats">
          <div class="label">Your Seats</div>
          <div style="font-size: 1.5em; color: #00ff88; font-weight: bold; margin-top: 10px;">
            ${bookingData.seats}
          </div>
        </div>
        
        <div class="qr-section">
          <div class="label" style="margin-bottom: 10px;">Scan at Theater</div>
          <div>
            <img src="${qrCodeUrl}" alt="QR Code" style="width: 150px; height: 150px;" />
          </div>
          <div style="font-size: 0.8em; color: #666; margin-top: 10px;">
            Present this QR code at entrance
          </div>
        </div>
        
        <div class="total">
          Total Paid: $${bookingData.total}
        </div>
        
        <div class="info">
          <span class="label">Booking ID:</span>
          <span class="value">${bookingData.bookingId}</span>
        </div>
        
        <div class="footer">
          Please arrive 15 minutes before showtime<br>
          Scan QR code or show this ticket at entrance
        </div>
      </div>
    </body>
    </html>
  `;
  
  // For now, return the HTML - in production you'd convert to PDF
  return html;
}

// Function to send email with ticket
async function sendTicketEmail(email: string, ticketHtml: string, bookingData: any) {
  console.log('🔧 Email function called with:', { email, hasTicketHtml: !!ticketHtml })
  console.log('🔧 Resend API Key present:', !!resendApiKey)
  
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set')
  }
  
  const emailData = {
    from: 'Next Zen Production <onboarding@resend.dev>',
    to: email,
    subject: `🎬 Your Movie Ticket - ${bookingData.movie}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #00ff88; text-align: center; margin-bottom: 30px;">🎬 Next Zen Production</h1>
          
          <div style="background: #ffeb3b; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
            <h3 style="margin: 0; color: #e65100;">🧪 TEST MODE - Domain Verification Pending</h3>
            <p style="margin: 10px 0; color: #bf360c;">This ticket was sent to your admin email for testing. Once domain is verified, tickets will go to actual customers.</p>
            <p style="margin: 5px 0; color: #bf360c;"><strong>Original Customer Email:</strong> ${bookingData.originalCustomerEmail}</p>
          </div>

          <h2 style="color: #333;">Thank you for your purchase!</h2>
          <p>Your ticket for <strong>${bookingData.movie}</strong> is confirmed.</p>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📋 Show Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>📅 Date:</strong> ${bookingData.date}</li>
              <li><strong>🕐 Time:</strong> ${bookingData.time}</li>
              <li><strong>📍 Theater:</strong> ${bookingData.theater}</li>
              <li><strong>💺 Seats:</strong> ${bookingData.seats}</li>
              <li><strong>💰 Total:</strong> $${bookingData.total}</li>
              <li><strong>🎫 Booking ID:</strong> ${bookingData.bookingId}</li>
            </ul>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>⚠️ Important Instructions:</h4>
            <ul>
              <li>📍 Please arrive <strong>15 minutes before showtime</strong></li>
              <li>📱 Show this QR code or ticket at the entrance</li>
              <li>🎫 Keep this email for your records</li>
              <li>💺 Your seats are reserved and guaranteed</li>
            </ul>
          </div>
          
          <hr style="margin: 30px 0;">
          
          <h3>🎫 Your Digital Ticket:</h3>
          ${ticketHtml}
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <p style="color: #666;">
              Need help? Contact us at support@nextzenproduction.com<br>
              Enjoy the show! 🍿
            </p>
          </div>
        </div>
      </div>
    `
  }

  console.log('📧 Sending email to Resend API...')
  console.log('📧 Email data:', { ...emailData, html: '[HTML_CONTENT]' })

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailData)
  })

  const result = await response.json()
  console.log('📧 Resend API response status:', response.status)
  console.log('📧 Resend API response:', result)
  
  if (!response.ok) {
    throw new Error(`Email API failed: ${response.status} - ${JSON.stringify(result)}`)
  }

  return result
}

Deno.serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature')
  
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    
    // Verify webhook signature (async version for Edge Functions)
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
    
    console.log('Webhook event type:', event.type)

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      
      console.log('Payment successful for session:', session.id)
      
      // Create Supabase client
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      // Get booking details from metadata
      const bookingData = {
        movie: session.metadata?.movie || 'Unknown Movie',
        date: session.metadata?.date || 'Unknown Date',
        time: session.metadata?.time || 'Unknown Time',
        theater: session.metadata?.theater || 'Unknown Theater',
        seats: session.metadata?.seats || 'Unknown Seats',
        total: (session.amount_total || 0) / 100,
        bookingId: session.id,
        customerEmail: session.customer_details?.email || 'neepurna@gmail.com', // Use actual customer email, fallback to your email
        originalCustomerEmail: session.customer_details?.email || 'no-email@example.com' // Keep track of original customer email
      }
      
      // Update seat status to 'occupied'
      const seatIds = bookingData.seats.split(',')
      const { error: updateError } = await supabase
        .from('seats')
        .update({ 
          status: 'occupied',
          stripe_session_id: session.id,
          booking_id: crypto.randomUUID()
        })
        .in('id', seatIds)
      
      if (updateError) {
        console.error('Error updating seats:', updateError)
      } else {
        console.log('Successfully updated seats to occupied:', seatIds)
      }
      
      // Generate and send PDF ticket
      try {
        console.log('🎫 Starting ticket generation for:', bookingData)
        const ticketHtml = await generatePDFTicket(bookingData)
        console.log('🎫 Ticket HTML generated, length:', ticketHtml.length)
        
        console.log('📧 Starting email send process...')
        // Temporarily disable email sending from webhook - let frontend EmailJS handle it
        console.log('📧 Email sending disabled in webhook - EmailJS will handle emails from frontend')
        // const emailResult = await sendTicketEmail(bookingData.customerEmail, ticketHtml, bookingData)
        // console.log('✅ Email sent successfully:', emailResult)
        
        // Log success for debugging
        console.log(`🎉 Ticket processing completed for booking ${bookingData.bookingId} - Email will be sent by frontend EmailJS`)
        
      } catch (emailError: any) {
        console.error('❌ CRITICAL ERROR sending ticket email:', emailError)
        console.error('❌ Error details:', {
          message: emailError?.message,
          stack: emailError?.stack,
          customerEmail: bookingData.customerEmail,
          bookingId: bookingData.bookingId
        })
        
        // This is a critical failure - payment succeeded but user didn't get ticket
        // You might want to store this for manual retry later
        try {
          const supabase = createClient(supabaseUrl, supabaseServiceKey)
          await supabase.from('failed_email_logs').insert({
            session_id: session.id,
            customer_email: bookingData.customerEmail,
            error_message: emailError?.message || 'Unknown error',
            booking_data: bookingData,
            created_at: new Date().toISOString()
          })
          console.log('📝 Failed email logged for manual retry')
        } catch (logError) {
          console.error('❌ Failed to log email failure:', logError)
        }
      }
    }

    return new Response('Webhook handled successfully', { status: 200 })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Webhook error', { status: 400 })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/stripe-webhook' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
