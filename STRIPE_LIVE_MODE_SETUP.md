# 🔴 SWITCHING TO STRIPE LIVE MODE - ACTION REQUIRED

## ⚠️ IMPORTANT: You Need Live Stripe API Keys

Your app is currently configured to use Stripe **test mode**. To accept real payments, you need to:

1. Get your **live** Stripe API keys
2. Update keys in **two places**

---

## 📋 Step-by-Step Instructions

### Step 1: Get Your Live Stripe Keys

1. **Go to Stripe Dashboard:**
   https://dashboard.stripe.com/apikeys

2. **Toggle to LIVE mode** (top left - should say "Viewing live data")

3. **Find your keys:**
   - **Publishable key:** `pk_live_51S9wWy...` (starts with `pk_live_`)
   - **Secret key:** `sk_live_51S9wWy...` (starts with `sk_live_`)

4. **Copy both keys** (you'll need them for next steps)

---

### Step 2: Update Frontend (App.jsx)

**File:** `/src/App.jsx`

Find this line (around line 29):
```javascript
const stripePromise = loadStripe('pk_live_YOUR_PUBLISHABLE_KEY_HERE');
```

**Replace with your actual live publishable key:**
```javascript
const stripePromise = loadStripe('pk_live_51S9wWy...[YOUR_KEY]');
```

---

### Step 3: Update Backend (Supabase Edge Function)

You need to add your **live secret key** to Supabase environment variables.

#### Option A: Via Supabase Dashboard (Easiest)

1. **Go to:** https://supabase.com/dashboard/project/gnjofqqwhvtkqdctwazt/settings/functions

2. **Add Environment Variable:**
   - Name: `STRIPE_SECRET_KEY`
   - Value: `sk_live_51S9wWy...[YOUR_SECRET_KEY]` (your live secret key)

3. **Click "Save"**

4. **Important:** Edge functions will automatically use this new value

#### Option B: Via Supabase CLI

```bash
# Set the secret key
supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE

# Redeploy the function to use new secret
supabase functions deploy create-checkout-session
```

---

### Step 4: Verify Setup

Run this test command:
```bash
node test-edge-function.js
```

**Expected Result:**
```
✅ Success! Response: { sessionId: 'cs_live_...' }
```

Note: The session ID should now start with `cs_live_` instead of `cs_test_`

---

## 🔒 Security Checklist

### ✅ Do's
- ✅ Use **publishable key** (`pk_live_`) in frontend
- ✅ Use **secret key** (`sk_live_`) only in backend/Supabase
- ✅ Store secret key in Supabase environment variables
- ✅ Never commit secret keys to Git

### ❌ Don'ts
- ❌ Never put secret key in frontend code
- ❌ Never commit secret keys to GitHub
- ❌ Never share secret keys in screenshots/support tickets

---

## 🧪 Testing Live Mode

### Option 1: Small Real Transaction (Recommended)
1. Use a real credit card
2. Purchase 1 ticket ($15)
3. **Immediately refund** via Stripe dashboard
4. Verify email confirmation works

### Option 2: Stripe Test Mode Parallel Setup
Keep test mode for development:

**Create `.env` file:**
```env
# Development
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51S9wWy...

# Production (use in build)
VITE_STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_51S9wWy...
```

**Update App.jsx:**
```javascript
const stripeKey = import.meta.env.MODE === 'production' 
  ? import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_LIVE
  : import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
const stripePromise = loadStripe(stripeKey);
```

---

## 📝 Current Status

### Frontend
- ❌ **Status:** Using placeholder live key
- ⚠️ **Action Required:** Update with your actual `pk_live_` key

### Backend (Supabase)
- ❌ **Status:** Using test secret key (or not set)
- ⚠️ **Action Required:** Add live `sk_live_` key to environment variables

---

## 🎯 Quick Setup (Copy & Paste)

### 1. Get Your Keys
```
1. Visit: https://dashboard.stripe.com/apikeys
2. Toggle to "Live mode"
3. Copy both keys
```

### 2. Update App.jsx (Line ~29)
```javascript
const stripePromise = loadStripe('pk_live_YOUR_ACTUAL_KEY');
```

### 3. Set Supabase Secret
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_SECRET_KEY
```

### 4. Test
```bash
node test-edge-function.js
# Should show: cs_live_xxx
```

---

## 🆘 Troubleshooting

### Issue: "Invalid API key"
**Fix:** Double-check you copied the correct live key (should start with `pk_live_`)

### Issue: "No such customer"
**Fix:** Test data from test mode doesn't exist in live mode. This is normal.

### Issue: Still showing test sessions
**Fix:** Make sure you updated the secret key in Supabase environment variables

### Issue: Stripe Dashboard shows no payments
**Fix:** Make sure you're viewing "Live" mode in dashboard (toggle top-left)

---

## 📞 Need Your Live Keys?

**Get them here:** https://dashboard.stripe.com/apikeys

1. Click "Developers" in top right
2. Click "API keys"
3. Toggle to "Live" (not "Test")
4. Copy both:
   - Publishable key → Frontend
   - Secret key → Supabase

---

## ⚡ After Setup

Once you've updated both keys:

1. **Frontend:** Will create live checkout sessions
2. **Backend:** Will process real payments
3. **Stripe:** Will charge real credit cards
4. **Customers:** Will receive real charges

**Make sure to test with small amount first!**

---

**Ready?** Update your keys and you're live! 🚀
