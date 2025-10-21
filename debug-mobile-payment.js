// Mobile Payment Debug Script
// Tests checkout session creation from mobile-like environment

const testMobileCheckout = async () => {
  console.log('\n📱 Testing Mobile Checkout Flow...\n');
  
  const testData = {
    ticketQuantity: 2,
    movieDetails: {
      title: 'Janai Harayeko Manche',
      date: 'November 1st, 2025',
      time: '6:00 PM',
      venue: '777 Kinnear Rd, Columbus, OH 43212'
    }
  };

  try {
    console.log('📤 Simulating mobile request...');
    console.log('📋 Request data:', JSON.stringify(testData, null, 2));
    
    // Simulate mobile user agent
    const response = await fetch(
      'https://gnjofqqwhvtkqdctwazt.supabase.co/functions/v1/create-checkout-session',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imduam9mcXF3aHZ0a3FkY3R3YXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTE1MDQsImV4cCI6MjA3NDUyNzUwNH0.d2NiU_sF8L-G-GRQeMQfSzr6Ji8sErPK24HbAm-Qhqo',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imduam9mcXF3aHZ0a3FkY3R3YXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTE1MDQsImV4cCI6MjA3NDUyNzUwNH0.d2NiU_sF8L-G-GRQeMQfSzr6Ji8sErPK24HbAm-Qhqo',
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
        },
        body: JSON.stringify(testData)
      }
    );

    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('\n❌ ERROR RESPONSE:');
      console.log(errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.log('\n📄 Parsed Error:', JSON.stringify(errorJson, null, 2));
      } catch (e) {
        console.log('(Could not parse as JSON)');
      }
      return;
    }

    const data = await response.json();
    console.log('\n✅ SUCCESS!');
    console.log('📝 Full Response:', JSON.stringify(data, null, 2));
    
    if (data.sessionId) {
      console.log('\n🎟️ Session ID:', data.sessionId);
      
      if (data.sessionId.startsWith('cs_live_')) {
        console.log('   ✅ LIVE MODE session');
      } else if (data.sessionId.startsWith('cs_test_')) {
        console.log('   ⚠️  TEST MODE session');
      }
    }
    
    if (data.url) {
      console.log('🔗 Checkout URL:', data.url);
      console.log('\n✅ Mobile checkout should work!');
    } else {
      console.log('⚠️  Warning: No checkout URL returned');
    }
    
  } catch (error) {
    console.log('\n❌ CAUGHT ERROR:');
    console.log('Error type:', error.constructor.name);
    console.log('Error message:', error.message);
    console.log('Error stack:', error.stack);
  }
};

console.log('═══════════════════════════════════════════');
console.log('     MOBILE PAYMENT ERROR DIAGNOSTICS');
console.log('═══════════════════════════════════════════\n');

testMobileCheckout().then(() => {
  console.log('\n═══════════════════════════════════════════');
  console.log('Test completed. Check output above.');
  console.log('═══════════════════════════════════════════\n');
});
