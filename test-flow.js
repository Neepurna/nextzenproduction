// Complete payment flow test
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gnjofqqwhvtkqdctwazt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdaham9mcXF3aHZ0a3FkY3R3YXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0MDgwNDMsImV4cCI6MjA1Mjk4NDA0M30.afPZdOHE2LR4fGPqkPgzKJ2P6E5hSI9-K-MZHSC4kzI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Payment Flow...')
  
  // Step 1: Test checkout session creation
  console.log('\n1️⃣ Testing checkout session creation...')
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { 
        selectedSeats: [1, 2, 3],
        movie: 'Bhairava Test',
        date: '2024-01-15',
        time: '7:00 PM',
        theater: 'Screen 1'
      }
    })
    
    if (error) {
      console.error('❌ Checkout session creation failed:', error)
      return
    }
    
    console.log('✅ Checkout session created successfully')
    console.log('Session ID:', data.id)
    console.log('Checkout URL:', data.url)
    
    // Step 2: Simulate webhook call (since Stripe webhook isn't working)
    console.log('\n2️⃣ Testing webhook simulation...')
    const webhookTest = await supabase.functions.invoke('webhook-test', {
      body: {
        sessionId: data.id,
        customerEmail: 'shibakriwo@test.com',
        amount: 2500,
        metadata: {
          movie: 'Bhairava Test',
          date: '2024-01-15',
          time: '7:00 PM',
          theater: 'Screen 1',
          seats: '1,2,3'
        }
      }
    })
    
    if (webhookTest.error) {
      console.error('❌ Webhook test failed:', webhookTest.error)
    } else {
      console.log('✅ Webhook test successful')
      console.log('Email sent with ID:', webhookTest.data.emailResult.id)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run test
testCompleteFlow()