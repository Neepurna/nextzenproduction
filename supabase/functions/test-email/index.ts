// Test email function to verify Resend setup
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response>): void;
};

const resendApiKey = Deno.env.get('RESEND_API_KEY')!

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

  try {
    const { email } = await req.json()
    
    console.log('🧪 Testing email setup...')
    console.log('📧 Target email:', email)
    console.log('🔑 API Key present:', !!resendApiKey)
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }

    const emailData = {
      from: 'Next Zen Production <onboarding@resend.dev>',
      to: email,
      subject: '🧪 Email Test - Next Zen Production',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #00ff88;">🎬 Next Zen Production</h1>
          <h2>Email Test Successful! ✅</h2>
          <p>If you're reading this, your email configuration is working correctly.</p>
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>✅ What's Working:</h3>
            <ul>
              <li>Domain: nextzenproduction.com</li>
              <li>DNS Records: Configured</li>
              <li>Resend API: Connected</li>
              <li>Email Delivery: Success!</li>
            </ul>
          </div>
          <p>Your movie ticket emails should now work properly! 🎫</p>
        </div>
      `
    }

    console.log('📤 Sending test email...')
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    })

    const result = await response.json()
    console.log('📧 Response status:', response.status)
    console.log('📧 Response:', result)
    
    if (!response.ok) {
      throw new Error(`Email API failed: ${response.status} - ${JSON.stringify(result)}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Test email sent successfully!',
        result: result
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      },
    )
    
  } catch (error: any) {
    console.error('❌ Test email failed:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error?.message || 'Unknown error occurred',
        details: error?.stack
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