// Simple email test with verified domain
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response>): void;
};

Deno.serve(async (req: Request) => {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')!
  
  console.log('🧪 Simple email test starting...')
  console.log('🔑 API Key present:', !!resendApiKey)
  
  if (!resendApiKey) {
    return new Response('❌ RESEND_API_KEY missing', { status: 500 })
  }

  try {
    const emailData = {
      from: 'Next Zen Production <onboarding@resend.dev>',
      to: 'neepurna@gmail.com',
      subject: '🎉 Email Working - Next Zen Production!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #00ff88;">🎬 Success! Email is Working!</h1>
          <p>If you receive this email, your ticket system will work perfectly!</p>
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>✅ System Status: WORKING</h3>
            <p>Domain: onboarding@resend.dev (verified)</p>
            <p>API: Connected</p>
            <p>Ready for ticket delivery!</p>
          </div>
          <p><strong>Your movie tickets will now be delivered automatically after payment! 🎫</strong></p>
        </div>
      `
    }

    console.log('📧 Sending simple test email...')
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    })

    const result = await response.json()
    console.log('📧 Response Status:', response.status)
    console.log('📧 Response Data:', result)
    
    if (response.ok) {
      return new Response(JSON.stringify({
        status: '✅ SUCCESS',
        message: 'Email sent successfully!',
        emailId: result.id,
        note: 'Check your email - ticket system is now working!'
      }, null, 2), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } else {
      return new Response(JSON.stringify({
        status: '❌ FAILED',
        error: result,
        responseStatus: response.status
      }, null, 2), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
  } catch (error: any) {
    console.error('❌ Email test error:', error)
    return new Response(JSON.stringify({
      status: '❌ ERROR',
      message: error.message
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})