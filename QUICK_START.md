# Quick Start Guide - Updated Ticketing System

## What Changed? 🎉

### ✅ Removed
- ❌ Seat selection popup/modal
- ❌ Interactive seat grid
- ❌ Seat availability checking
- ❌ Database seat reservations

### ✅ Added
- ✨ Simple ticket quantity selector (1-10 tickets)
- ✨ Screening details on main page
- ✨ One-click checkout
- ✨ Updated venue information

## How It Works Now

```
Main Landing Page
├── Movie Title: "Janai Harayeko Manche"
├── Movie Description
├── 📅 Screening Info Box (NEW!)
│   ├── Date: November 1st, 2025
│   ├── Time: 6:00 PM
│   ├── Venue: 777 Kinnear Rd, Columbus, OH 43212
│   └── Price: $15 per ticket
├── 🎫 Quantity Selector (NEW!)
│   ├── [-] Button (decrease)
│   ├── Number Display (1-10)
│   ├── [+] Button (increase)
│   └── Total Price: $XX.XX
└── [Buy X Ticket(s) →] Button
        ↓
    Stripe Checkout
        ↓
    Payment Success
        ↓
    Email + PDF Ticket
```

## User Experience

### Before:
1. Click "Buy Ticket" → 😐
2. Wait for seat grid to load → ⏳
3. Browse available seats → 🔍
4. Click to select seats → 👆
5. Confirm selection → ✓
6. Finally checkout → 💳

### After:
1. Choose quantity with +/- → 👆
2. Click "Buy X Tickets" → 💳
3. Done! → ✨

**Time saved: ~30 seconds per purchase**

## Testing the App

### Start Development Server
```bash
npm run dev
```

### Test Flow
1. Open http://localhost:5173
2. You should see:
   - Movie title and description
   - Screening information box with icons
   - Ticket quantity selector
   - "Buy X Ticket(s)" button
3. Click +/- to change quantity
4. Watch total price update
5. Click "Buy Ticket(s)"
6. Should redirect to Stripe checkout

### Verify Ticket Email
After successful payment:
- Email should contain:
  - ✅ Movie title
  - ✅ Date: November 1st, 2025
  - ✅ Time: 6:00 PM
  - ✅ Venue: 777 Kinnear Rd, Columbus, OH 43212
  - ✅ Number of tickets
  - ✅ Total amount
  - ❌ NO seat numbers (removed)

## Important: Update EmailJS Template

🚨 **You must update your EmailJS template** to avoid errors:

1. Log in to https://emailjs.com
2. Go to Email Templates
3. Find template: `template_bk2ftqf`
4. Update the template content:

### Remove:
```
Seats: {{seat_numbers}}
Theater: {{theater_name}}
```

### Replace with:
```
Venue: {{venue}}
Tickets: {{ticket_count}}
```

### Example Template:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Your Movie Tickets</title>
</head>
<body>
    <h1>🎬 Janai Harayeko Manche</h1>
    <p><strong>Date:</strong> {{show_date}}</p>
    <p><strong>Time:</strong> {{show_time}}</p>
    <p><strong>Venue:</strong> {{venue}}</p>
    <p><strong>Tickets:</strong> {{ticket_count}}</p>
    <p><strong>Total:</strong> {{total_amount}}</p>
    
    <p>See you at the show!</p>
</body>
</html>
```

## Troubleshooting

### Issue: Button shows "Processing..." indefinitely
**Fix:** Check browser console for Supabase function errors

### Issue: Email not received
**Fix:** 
1. Check EmailJS template is updated
2. Verify `{{to_email}}` or `{{email}}` is set correctly
3. Check spam folder

### Issue: Wrong amount charged
**Fix:** Ticket price is set to $15 in:
- `App.jsx`: `const ticketPrice = 15`
- `create-checkout-session/index.ts`: `unit_amount: 1500` (cents)

### Issue: Stripe checkout fails
**Fix:** Check Supabase edge function logs for detailed error

## Configuration

### Ticket Price
To change price, update both:

**App.jsx:**
```javascript
const ticketPrice = 15; // Change this number
```

**create-checkout-session/index.ts:**
```typescript
unit_amount: 1500, // Change to (price * 100) in cents
```

### Ticket Quantity Limits
**App.jsx:**
```javascript
// Minimum
setTicketQuantity(Math.max(1, ticketQuantity - 1))

// Maximum  
setTicketQuantity(Math.min(10, ticketQuantity + 1)) // Change 10 to your max
```

### Screening Details
**App.jsx:**
```javascript
const selectedDate = 'November 1st, 2025';
const selectedTime = '6:00 PM';
const selectedVenue = '777 Kinnear Rd, Columbus, OH 43212';
const ticketPrice = 15;
```

## Support

If you encounter any issues:
1. Check browser console for errors
2. Check Supabase function logs
3. Verify EmailJS template settings
4. Review CHANGES_SUMMARY.md for detailed changes

---

**Ready to go! 🚀**
