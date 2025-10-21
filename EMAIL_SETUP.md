# EmailJS Setup Instructions - CRITICAL EMAIL ROUTING FIX

## ⚠️ IMPORTANT: Email Template Configuration

### The Problem
If emails are going to the wrong recipient (e.g., neepurna@gmail.com instead of customer's email), the issue is in your EmailJS template settings, NOT the code.

### The Fix
1. **Go to your EmailJS dashboard**
2. **Edit template `template_67nupk`**
3. **In the template settings, find the "To email" field**
4. **Make sure it says: `{{to_email}}`** (NOT a fixed email address)
5. **Save the template**

### Template Settings Should Look Like:
```
To email: {{to_email}}
From name: Next Zen Production
From email: your-sender-email@domain.com
Subject: Your Movie Tickets - {{movie_title}}
```

### Common Mistake:
❌ **Wrong**: To email: `neepurna@gmail.com` (fixed email)
✅ **Correct**: To email: `{{to_email}}` (dynamic variable)

## Service Configuration
- Service ID: `service_3898n7y` (already configured)
- Public Key: `dkDuNb7IVGYaAtWwL` (configured in App.jsx)

## Required Template Setup

### Template ID
Use the existing template with ID: `template_67nupk` (Order Confirmation)

### Template Variables
The template should include these variables:

- `{{email}}` - **Recipient email address (THIS CONTROLS WHERE EMAIL GOES)**
- `{{to_email}}` - Alternative recipient email (for compatibility)
- `{{movie_title}}` - Movie title (Janai Harayeko Manche)
- `{{show_date}}` - Show date
- `{{show_time}}` - Show time
- `{{theater_name}}` - Theater name
- `{{seat_numbers}}` - Comma-separated seat numbers
- `{{ticket_count}}` - Number of tickets
- `{{total_amount}}` - Total payment amount

**IMPORTANT**: In your EmailJS template, make sure the "To Email" field in Settings uses `{{email}}`, not `{{to_email}}`!

### Sample Email Template

```html
Subject: Your Movie Tickets - {{movie_title}}

<div
  style="
    font-family: system-ui, sans-serif, Arial;
    font-size: 14px;
    color: #333;
    padding: 14px 8px;
    background-color: #f5f5f5;
  "
>
  <div style="max-width: 600px; margin: auto; background-color: #fff">
    <div style="border-top: 6px solid #458500; padding: 16px">
      <a
        style="text-decoration: none; outline: none; margin-right: 8px; vertical-align: middle"
        href="[Website Link]"
        target="_blank"
      >
        <img
          style="height: 32px; vertical-align: middle"
          height="32px"
          src="cid:logo.png"
          alt="Next Zen Production"
        />
      </a>
      <span
        style="
          font-size: 16px;
          vertical-align: middle;
          border-left: 1px solid #333;
          padding-left: 8px;
        "
      >
        <strong>🎬 Your Movie Tickets</strong>
      </span>
    </div>
    <div style="padding: 0 16px">
      <p>Thank you for your purchase! Your tickets are confirmed. Please save this email and present it at the theater.</p>
      <div
        style="
          text-align: left;
          font-size: 14px;
          padding-bottom: 4px;
          border-bottom: 2px solid #333;
        "
      >
        <strong>🎟️ {{movie_title}}</strong>
      </div>
      
      <table style="width: 100%; border-collapse: collapse">
        <tr style="vertical-align: top">
          <td style="padding: 24px 8px 0 4px; display: inline-block; width: max-content">
            <div style="
              height: 64px; 
              width: 64px; 
              background-color: #458500; 
              border-radius: 8px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              color: white; 
              font-size: 24px;
            ">🎬</div>
          </td>
          <td style="padding: 24px 8px 0 8px; width: 100%">
            <div><strong>{{movie_title}}</strong></div>
            <div style="font-size: 14px; color: #666; padding-top: 4px">
              📅 {{show_date}} at {{show_time}}<br>
              🏛️ {{theater_name}}<br>
              🎫 Seats: {{seat_numbers}}
            </div>
          </td>
          <td style="padding: 24px 4px 0 0; white-space: nowrap">
            <strong>{{total_amount}}</strong>
          </td>
        </tr>
      </table>
      
      <div style="padding: 24px 0">
        <div style="border-top: 2px solid #333"></div>
      </div>
      
      <table style="border-collapse: collapse; width: 100%; text-align: right">
        <tr>
          <td style="width: 60%"></td>
          <td>Number of Tickets</td>
          <td style="padding: 8px; white-space: nowrap">{{ticket_count}}</td>
        </tr>
        <tr>
          <td style="width: 60%"></td>
          <td>Price per Ticket</td>
          <td style="padding: 8px; white-space: nowrap">$15.00</td>
        </tr>
        <tr>
          <td style="width: 60%"></td>
          <td style="border-top: 2px solid #333">
            <strong style="white-space: nowrap">Total Amount</strong>
          </td>
          <td style="padding: 16px 8px; border-top: 2px solid #333; white-space: nowrap">
            <strong>{{total_amount}}</strong>
          </td>
        </tr>
      </table>
      
      <div style="
        background-color: #f9f9f9; 
        padding: 16px; 
        margin: 20px 0; 
        border-radius: 8px; 
        border-left: 4px solid #458500;
      ">
        <h3 style="margin: 0 0 10px 0; color: #458500;">Important Information</h3>
        <ul style="margin: 0; padding-left: 20px; color: #666;">
          <li>Please arrive at the theater at least 15 minutes before showtime</li>
          <li>Present this email at the entrance for entry</li>
          <li>Seats are reserved - no need to rush for seating</li>
          <li>Outside food and beverages are not permitted</li>
        </ul>
      </div>
    </div>
  </div>
  <div style="max-width: 600px; margin: auto">
    <p style="color: #999; text-align: center;">
      This email was sent to {{email}}<br />
      You received this email because you purchased movie tickets<br />
      <br />
      <strong>Next Zen Production</strong><br />
      Enjoy your movie! 🍿
    </p>
  </div>
</div>
```

## Steps to Update Existing Template

1. Go to your EmailJS dashboard
2. Navigate to Email Templates
3. Find the existing template "Order Confirmation" (ID: `template_67nupk`)
4. Edit the template content
5. Replace the existing content with the sample template above
6. Save the template

## Testing

The new improved flow works as follows:
1. Select seats on the website
2. Complete payment via Stripe (email is collected by Stripe)
3. Automatically redirected back to website
4. Ticket confirmation email is sent automatically to customer's email
5. Confirmation dialog shows with option to download PDF ticket
6. No manual email entry required - seamless experience!

## Features

### Automatic Email Delivery
- Customer email is retrieved from Stripe checkout session
- Ticket confirmation sent automatically
- No manual email input required

### PDF Download Option
- Generate downloadable PDF tickets
- Professional ticket design with all details
- Includes session ID for verification
- High-quality PDF with movie poster styling

### Improved UX
- Streamlined process
- No extra steps for customers
- Immediate confirmation
- Multiple ticket delivery options