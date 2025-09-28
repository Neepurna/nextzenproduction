// Test webhook payload manually
const crypto = require('crypto');

const payload = JSON.stringify({
  id: 'evt_test_webhook',
  object: 'event',
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_session_12345',
      amount_total: 2500, // $25.00
      customer_details: {
        email: 'test@example.com'
      },
      metadata: {
        movie: 'Bhairava',
        date: '2024-01-15',
        time: '7:00 PM',
        theater: 'Screen 1',
        seats: '1,2,3'
      }
    }
  }
});

console.log("Test payload to send to webhook:");
console.log(payload);

// You would need the actual webhook secret to create a proper signature
// This is just for testing the payload structure