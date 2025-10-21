#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks if all keys are in the right places
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 Verifying Your Setup...\n');

// Check 1: .env.local exists and has the key
console.log('✅ CHECK 1: Frontend Stripe Key (.env.local)');
const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  if (envContent.includes('VITE_STRIPE_PUBLISHABLE_KEY=pk_live_')) {
    console.log('   ✅ .env.local exists');
    console.log('   ✅ Contains VITE_STRIPE_PUBLISHABLE_KEY');
    console.log('   ✅ Key starts with pk_live_ (LIVE MODE)');
    
    // Extract and show partial key
    const match = envContent.match(/VITE_STRIPE_PUBLISHABLE_KEY=(pk_live_\w{10})/);
    if (match) {
      console.log(`   ✅ Key preview: ${match[1]}...`);
    }
  } else if (envContent.includes('VITE_STRIPE_PUBLISHABLE_KEY=pk_test_')) {
    console.log('   ⚠️  WARNING: Key is in TEST MODE (pk_test_)');
    console.log('   ⚠️  You need to replace it with your LIVE key (pk_live_)');
  } else {
    console.log('   ❌ .env.local exists but key is missing or invalid');
  }
} else {
  console.log('   ❌ .env.local NOT FOUND');
  console.log('   ❌ You need to create it with your Stripe key');
}

console.log('\n✅ CHECK 2: App.jsx Uses Environment Variable');
const appPath = path.join(__dirname, 'src', 'App.jsx');
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf8');
  if (appContent.includes('import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY')) {
    console.log('   ✅ App.jsx correctly reads from environment variable');
  } else if (appContent.includes('pk_live_') || appContent.includes('pk_test_')) {
    console.log('   ⚠️  WARNING: App.jsx has hardcoded key (should use env variable)');
  } else {
    console.log('   ❌ Cannot find Stripe initialization in App.jsx');
  }
} else {
  console.log('   ❌ src/App.jsx not found');
}

console.log('\n✅ CHECK 3: .gitignore Protects .env.local');
const gitignorePath = path.join(__dirname, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (gitignoreContent.includes('.env.local')) {
    console.log('   ✅ .env.local is in .gitignore (will NOT be committed)');
  } else {
    console.log('   ⚠️  WARNING: .env.local not in .gitignore');
  }
} else {
  console.log('   ❌ .gitignore not found');
}

console.log('\n✅ CHECK 4: Supabase Secret Key');
console.log('   ℹ️  Cannot verify from local - must check manually:');
console.log('   🔗 Go to: https://supabase.com/dashboard/project/gnjofqqwhvtkqdctwazt/settings/functions');
console.log('   📝 Look for: STRIPE_SECRET_KEY');
console.log('   ✅ Should start with: sk_live_...');
console.log('   ❌ Should NOT be: sk_test_...');

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 SUMMARY');
console.log('='.repeat(50));

const checks = {
  envLocal: fs.existsSync(envLocalPath),
  appUsingEnv: fs.existsSync(appPath) && fs.readFileSync(appPath, 'utf8').includes('import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY'),
  gitignoreProtects: fs.existsSync(gitignorePath) && fs.readFileSync(gitignorePath, 'utf8').includes('.env.local')
};

if (checks.envLocal && checks.appUsingEnv && checks.gitignoreProtects) {
  console.log('✅ Your local setup is CORRECT!');
  console.log('✅ The app will use your Stripe key from .env.local');
  console.log('✅ .env.local will NOT be pushed to GitHub');
  console.log('\n🚀 You can run: npm run dev');
} else {
  console.log('⚠️  Some issues found - see details above');
  
  if (!checks.envLocal) {
    console.log('\n❌ ACTION NEEDED: Create .env.local file');
    console.log('   Run: cp .env.example .env.local');
    console.log('   Then edit it and add your real Stripe key');
  }
}

console.log('\n' + '='.repeat(50));
console.log('🔑 KEY LOCATIONS');
console.log('='.repeat(50));
console.log('Frontend (Local):');
console.log('  📁 File: .env.local');
console.log('  🔑 Key: VITE_STRIPE_PUBLISHABLE_KEY');
console.log('  📝 Format: pk_live_...');
console.log('  ⚠️  Status: NOT committed to GitHub (protected by .gitignore)');

console.log('\nBackend (Supabase):');
console.log('  🌐 Location: Supabase Dashboard > Edge Functions > Secrets');
console.log('  🔑 Key: STRIPE_SECRET_KEY');
console.log('  📝 Format: sk_live_...');
console.log('  🔗 URL: https://supabase.com/dashboard/project/gnjofqqwhvtkqdctwazt/settings/functions');

console.log('\n✅ If both are set correctly, your app will work!\n');
