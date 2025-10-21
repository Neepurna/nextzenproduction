// Quick test to verify Stripe integration works end-to-end

const testCheckout = async () => {
  console.log('\n🧪 Testing Stripe Integration...\n');
  
  const testData = {
    ticketQuantity: 2,
    movieDetails: {
      title: 'Bhairava',
      date: 'November 1st, 2025',
      time: '6:00 PM',
      venue: '777 Kinnear Rd, Columbus, OH 43212',
      price: 15
    }
  };

  try {
    console.log('📤 Calling create-checkout-session...');
    const response = await fetch(
      'https://gnjofqqwhvtkqdctwazt.supabase.co/functions/v1/create-checkout-session',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imduam9mcXF3aHZ0a3FkY3R3YXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTE1MDQsImV4cCI6MjA3NDUyNzUwNH0.d2NiU_sF8L-G-GRQeMQfSzr6Ji8sErPK24HbAm-Qhqo',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imduam9mcXF3aHZ0a3FkY3R3YXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTE1MDQsImV4cCI6MjA3NDUyNzUwNH0.d2NiU_sF8L-G-GRQeMQfSzr6Ji8sErPK24HbAm-Qhqo'
        },
        body: JSON.stringify(testData)
      }
    );

    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error Response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('\n✅ SUCCESS!');
    console.log('📝 Session Details:');
    console.log(`   Session ID: ${data.sessionId}`);
    
    if (data.sessionId.startsWith('cs_live_')) {
      console.log('   ✅ LIVE MODE - Using real Stripe (sk_live_...)');
    } else if (data.sessionId.startsWith('cs_test_')) {
      console.log('   ⚠️  TEST MODE - Using test Stripe (sk_test_...)');
      console.log('   ⚠️  You need to update STRIPE_SECRET_KEY in Supabase');
    }
    
    console.log(`\n🔗 Checkout URL: ${data.url}`);
    console.log('\n✅ Your keys are working correctly!');
    console.log('✅ Frontend (.env.local) ← → Backend (Supabase) ← → Stripe');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

testCheckout();
