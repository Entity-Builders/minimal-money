/* eslint-env node */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
let env = {};
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.trim();
    }
  });
}

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: Setup credentials failing. Check .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function forceRecovery() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('--- Force Recovery Mode ---');
  console.log('This script will insert a $500 expense for YESTERDAY.');
  console.log(
    'This will force the "Accumulated Savings" to be negative today.',
  );

  const email = await new Promise(resolve => {
    rl.question('Enter email (default: juan@test.com): ', answer =>
      resolve(answer || 'juan@test.com'),
    );
  });

  const password = await new Promise(resolve => {
    rl.question('Enter password (default: password): ', answer =>
      resolve(answer || 'password'),
    );
  });

  rl.close();

  console.log(`Authenticating...`);
  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !user) {
    console.error('Login failed:', error?.message);
    return;
  }

  console.log(`Logged in. Inserting expense for User ID: ${user.id}`);

  // Create Date for Yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  // Set to noon to avoid timezone edge cases
  yesterday.setHours(12, 0, 0, 0);

  const { error: insertError } = await supabase.from('expenses').insert({
    user_id: user.id,
    amount: 500, // Large amount to force debt
    original_amount: 500,
    currency: 'USD',
    name: 'Simulated Debt',
    category: 'General',
    date: yesterday.toISOString(),
  });

  if (insertError) {
    console.error('Error inserting expense:', insertError);
  } else {
    console.log('✅ Success! Expense added for ' + yesterday.toDateString());
    console.log(
      'Now REFRESH your app. You should be in Recovery Mode immediately.',
    );
  }
}

forceRecovery();
