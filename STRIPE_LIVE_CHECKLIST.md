# ✅ Stripe Live Mode - Quick Checklist

## What You Need to Do

### 1. Get Your Live Stripe Keys ⏱️ 2 minutes

**URL:** https://dashboard.stripe.com/apikeys

- [ ] Toggle to "Live mode" (top left corner)
- [ ] Copy **Publishable key** (starts with `pk_live_`)
- [ ] Copy **Secret key** (starts with `sk_live_`)

---

### 2. Update Frontend ⏱️ 1 minute

**File:** `src/App.jsx` (line ~29)

- [ ] Find: `const stripePromise = loadStripe('pk_live_51S9wWyCOzTrWTYckYOUR_LIVE_KEY_HERE');`
- [ ] Replace `YOUR_LIVE_KEY_HERE` with your actual live publishable key
- [ ] Save file

**Example:**
```javascript
const stripePromise = loadStripe('pk_live_51S9wWyCOzTrWTYck123456789ABC');
```

---

### 3. Update Backend (Supabase) ⏱️ 2 minutes

**Option A - Dashboard (Easier):**
1. [ ] Go to: https://supabase.com/dashboard/project/gnjofqqwhvtkqdctwazt/settings/functions
2. [ ] Click "Add new secret"
3. [ ] Name: `STRIPE_SECRET_KEY`
4. [ ] Value: Your live secret key (`sk_live_...`)
5. [ ] Click "Save"

**Option B - CLI:**
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY
```

---

### 4. Test It ⏱️ 1 minute

Run test:
```bash
node test-edge-function.js
```

**Look for:**
- ✅ `sessionId: 'cs_live_...'` (should say "live" not "test")

---

### 5. Deploy & Test in Browser ⏱️ 2 minutes

```bash
npm run dev
```

- [ ] Open http://localhost:5173
- [ ] Select 1 ticket
- [ ] Click "Buy 1 Ticket"
- [ ] Should redirect to Stripe checkout
- [ ] Use test card: `4242 4242 4242 4242` (still works in test!)

**Note:** Even with live keys, Stripe test cards work until you process real cards.

---

## 🔴 Before Going Fully Live

- [ ] Test with a **real credit card** (charge yourself $15)
- [ ] Verify email confirmation arrives
- [ ] Check Stripe dashboard for payment
- [ ] **Refund test payment** immediately
- [ ] Update success/cancel URLs to your production domain

---

## 📋 Your Keys Reference

Fill this in for your records (keep secure!):

```
Publishable Key (Frontend):
pk_live_51S9wWyCOzTrWTYck_____________________

Secret Key (Supabase):
sk_live_51S9wWyCOzTrWTYck_____________________
```

---

## 🆘 Quick Help

**Can't find live keys?**
→ https://dashboard.stripe.com/apikeys (toggle "Live")

**Still showing test sessions?**
→ Check Supabase environment variables are saved

**Payment not working?**
→ Check browser console for errors

**Need more help?**
→ See `STRIPE_LIVE_MODE_SETUP.md` for detailed guide

---

## ✅ Done!

Once all checkboxes are checked, your app will accept real payments! 🎉

**Estimated Total Time:** 8 minutes
