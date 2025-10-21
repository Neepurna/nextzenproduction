// Test webhook trigger function
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// @ts-ignore - External module imports for Supabase Edge Functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Declare Deno global for TypeScript
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response>): void;
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const resendApiKey = Deno.env.get('RESEND_API_KEY')!

console.log("Webhook test trigger loaded")

// Function to generate QR code URL
function generateQRCode(bookingData: any) {
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
  
  const html = `<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;margin:20px;background:#f5f5f5}.ticket{background:white;border:2px solid #00ff88;padding:30px;border-radius:15px;max-width:500px;margin:0 auto;box-shadow:0 4px 6px rgba(0,0,0,0.1)}.header{text-align:center;color:#00ff88;margin-bottom:30px}.header h1{margin:0;font-size:2em}.header h2{margin:10px 0;color:#333}.info{margin:15px 0;display:flex;justify-content:space-between}.label{font-weight:bold;color:#666}.value{color:#333}.seats{background:#f8f9fa;padding:20px;border-radius:8px;text-align:center;margin:20px 0}.qr-section{text-align:center;margin:25px 0;padding:20px;background:#f8f9fa;border-radius:8px}.total{border-top:2px solid #00ff88;padding-top:15px;text-align:center;font-size:1.2em;font-weight:bold}.footer{text-align:center;color:#888;font-size:0.9em;margin-top:20px}</style></head><body><div class="ticket"><div class="header"><h1>🎬 Next Zen Production</h1><h2>${bookingData.movie}</h2></div><div class="info"><span class="label">Date:</span><span class="value">${bookingData.date}</span></div><div class="info"><span class="label">Time:</span><span class="value">${bookingData.time}</span></div><div class="info"><span class="label">Theater:</span><span class="value">${bookingData.theater}</span></div><div class="seats"><div class="label">Your Seats</div><div style="font-size:1.5em;color:#00ff88;font-weight:bold;margin-top:10px">${bookingData.seats}</div></div><div class="qr-section"><div class="label" style="margin-bottom:10px">Scan at Theater</div><div><img src="${qrCodeUrl}" alt="QR Code" style="width:150px;height:150px" /></div><div style="font-size:0.8em;color:#666;margin-top:10px">Present this QR code at entrance</div></div><div class="total">Total Paid: $${bookingData.total}</div><div class="info"><span class="label">Booking ID:</span><span class="value">${bookingData.bookingId}</span></div><div class="footer">Please arrive 15 minutes before showtime<br>Scan QR code or show this ticket at entrance</div></div></body></html>`;
  
  return html;
}

// Function to send email with ticket
async function sendTicketEmail(email: string, ticketHtml: string, bookingData: any) {
  const qrCodeUrl = generateQRCode(bookingData);
  
  const emailData = {
    from: 'Next Zen Production <onboarding@resend.dev>',
    to: email,
    subject: `🎬 Your Movie Ticket - ${bookingData.movie}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><h2 style="color:#00ff88">🎉 Thank you for your purchase!</h2><p>Your ticket for <strong>${bookingData.movie}</strong> has been confirmed.</p><div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0"><h3>📋 Show Details:</h3><ul style="list-style:none;padding:0"><li><strong>📅 Date:</strong> ${bookingData.date}</li><li><strong>🕐 Time:</strong> ${bookingData.time}</li><li><strong>📍 Theater:</strong> ${bookingData.theater}</li><li><strong>💺 Seats:</strong> ${bookingData.seats}</li><li><strong>💰 Total:</strong> $${bookingData.total}</li><li><strong>🎫 Booking ID:</strong> ${bookingData.bookingId}</li></ul></div><div style="text-align:center;margin:30px 0;padding:20px;background:#e8f5e8;border-radius:8px"><h3>📱 Quick Check-in QR Code</h3><img src="${qrCodeUrl}" alt="QR Code" style="width:200px;height:200px;margin:10px" /><p style="color:#666;font-size:0.9em">Scan this QR code at the theater entrance</p></div><div style="background:#fff3cd;padding:15px;border-radius:8px;margin:20px 0"><h4>⚠️ Important Instructions:</h4><ul><li>📍 Please arrive <strong>15 minutes before showtime</strong></li><li>📱 Show this QR code or ticket at the entrance</li><li>🎫 Keep this email for your records</li><li>💺 Your seats are reserved and guaranteed</li></ul></div><hr style="margin:30px 0"><h3>🎫 Your Digital Ticket:</h3>${ticketHtml}<div style="text-align:center;margin-top:30px;padding:20px;background:#f8f9fa;border-radius:8px"><p style="color:#666">Need help? Contact us at support@nextzenproduction.com<br>Enjoy the show! 🍿</p></div></div>`
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailData)
  })

  return response.json()
}

Deno.serve(async (req: Request) => {
  console.log('Webhook test trigger called')
  
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
    const { sessionId, email, seats } = await req.json()
    
    console.log('Processing test webhook for session:', sessionId)
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Simulate booking data
    const bookingData = {
      movie: 'Janai Harayeko Manche',
      date: 'Oct 15, 2024',
      time: '7:30 PM',
      theater: 'Galaxy Theater',
      seats: seats || 'A5, A6',
      total: '30.00',
      bookingId: sessionId || 'test_' + Date.now(),
      customerEmail: email || 'test@example.com'
    }
    
    // Update seat status to 'occupied'
    if (seats) {
      const seatIds = seats.split(',').map((s: string) => s.trim())
      const { error: updateError } = await supabase
        .from('seats')
        .update({ 
          status: 'occupied',
          stripe_session_id: sessionId,
          booking_id: crypto.randomUUID()
        })
        .in('id', seatIds)
      
      if (updateError) {
        console.error('Error updating seats:', updateError)
      } else {
        console.log('Successfully updated seats to occupied:', seatIds)
      }
    }
    
    // Generate and send PDF ticket
    const ticketHtml = await generatePDFTicket(bookingData)
    const emailResult = await sendTicketEmail(bookingData.customerEmail, ticketHtml, bookingData)
    console.log('Email sent:', emailResult)
    
    return new Response(
      JSON.stringify({ 
        success: true,
        emailResult: emailResult,
        bookingData: bookingData,
        message: 'Test webhook processed successfully!'
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      },
    )
    
  } catch (error: any) {
    console.error('Test webhook error:', error)
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Unknown error occurred',
        stack: error?.stack
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