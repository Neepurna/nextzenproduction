# 🚨 DEPLOYMENT REQUIRED

## Problem
The Edge Function `create-checkout-session` is still using the OLD code that expects `selectedSeats`. 
We updated the code locally but it hasn't been deployed to Supabase yet.

## Solution: Deploy the Updated Edge Function

### Option 1: Deploy via Supabase CLI (Recommended)

```bash
# Make sure you're in the project directory
cd /Users/shibakriwo/Downloads/nextzenproduction-JHM_TestMode

# Login to Supabase (if not already logged in)
npx supabase login

# Link to your project
npx supabase link --project-ref gnjofqqwhvtkqdctwazt

# Deploy the create-checkout-session function
npx supabase functions deploy create-checkout-session

# Or deploy all functions
npx supabase functions deploy
```

### Option 2: Deploy via Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/gnjofqqwhvtkqdctwazt
2. Navigate to **Edge Functions** in the sidebar
3. Find `create-checkout-session`
4. Click the **Deploy** or **Update** button
5. Copy and paste the updated code from:
   `/supabase/functions/create-checkout-session/index.ts`

### Option 3: Manual Deployment

If you don't have Supabase CLI installed:

```bash
# Install Supabase CLI
npm install -g supabase

# Then follow Option 1 steps above
```

## What Changed in the Function

**OLD CODE (Currently Deployed):**
```typescript
const { selectedSeats, movieDetails } = requestData
if (!selectedSeats || selectedSeats.length === 0) {
  throw new Error('No seats selected')  // ← THIS ERROR IS SHOWING
}
```

**NEW CODE (Needs to be Deployed):**
```typescript
const { ticketQuantity, movieDetails } = requestData
if (!ticketQuantity || ticketQuantity < 1) {
  throw new Error('Invalid ticket quantity')
}
```

## After Deployment

1. Wait 30-60 seconds for deployment to complete
2. Test again by clicking "Buy 1 Ticket" button
3. Should now work and redirect to Stripe checkout

## Verify Deployment

Run this test after deploying:
```bash
node test-edge-function.js
```

Expected output:
```
✅ Success! Response: { sessionId: 'cs_test_...' }
```

---

**Current Error:** `{"error":"No seats selected"}`
**After Deploy:** Should create Stripe session successfully
