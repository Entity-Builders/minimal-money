/* eslint-env node */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load environment variables from .env manually
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
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  env.EXPO_PUBLIC_SUPABASE_URL ||
  'http://127.0.0.1:54321';
const SUPABASE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    'Error: EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY not found in environment or .env file',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const categories = [
  'Comida',
  'Transporte',
  'Servicios',
  'Entretenimiento',
  'Supermercado',
  'Salud',
  'Educación',
  'Ropa',
  'Hogar',
];
const names = {
  Comida: ['Almuerzo', 'Cena', 'Snack', 'Café', 'Restaurante', 'Delivery'],
  Transporte: ['Uber', 'Nafta', 'Taxi', 'Subte', 'Colectivo', 'Peaje'],
  Servicios: ['Luz', 'Gas', 'Internet', 'Celular', 'Netflix', 'Spotify'],
  Entretenimiento: ['Cine', 'Juego', 'Salida', 'Teatro'],
  Supermercado: ['Compra Semanal', 'Verdulería', 'Carnicería', 'Kiosco'],
  Salud: ['Farmacia', 'Consulta', 'Dentista'],
  Educación: ['Libros', 'Curso', 'Fotocopias'],
  Ropa: ['Remera', 'Pantalón', 'Zapatillas'],
  Hogar: ['Limpieza', 'Decoración', 'Mantenimiento'],
};

function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

function randomAmount(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Exchange rate helper (approximate)
const EXCHANGE_RATE = 1150;

async function seedExpenses(userId, count = 50) {
  console.log(`Seeding ${count} expenses for user ${userId}...`);
  const expenses = [];
  const endDate = new Date(); // To date
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3); // Last 3 months

  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const categoryNames = names[category];
    const name =
      categoryNames[Math.floor(Math.random() * categoryNames.length)];

    // 80% chance of ARS, 20% USD
    const isArs = Math.random() > 0.2;
    const currency = isArs ? 'ARS' : 'USD';

    let originalAmount;
    if (isArs) {
      originalAmount = randomAmount(1000, 50000); // 1k to 50k ARS
    } else {
      originalAmount = randomAmount(5, 100); // 5 to 100 USD
    }

    const amountUSD = isArs
      ? Math.round((originalAmount / EXCHANGE_RATE) * 100) / 100
      : originalAmount;

    // Supabase expects specific fields matching the table schema
    expenses.push({
      user_id: userId,
      amount: amountUSD, // Normalized amount in USD
      original_amount: originalAmount, // Original amount in source currency
      currency: currency,
      name: name,
      category: category,
      date: randomDate(startDate, endDate).toISOString(),
    });
  }

  // Insert in chunks to avoid request size limits if too many
  const { error } = await supabase.from('expenses').insert(expenses);

  if (error) {
    console.error('Error seeding expenses:', error);
  } else {
    console.log(`Successfully seeded ${count} expenses!`);
  }
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('--- Expense Seeder ---');
  console.log(`Connected to: ${SUPABASE_URL}`);

  const email = await new Promise(resolve => {
    rl.question(
      'Enter email to seed data for (leave empty for "juan@test.com"): ',
      answer => {
        resolve(answer || 'juan@test.com');
      },
    );
  });

  const password = await new Promise(resolve => {
    rl.question('Enter password (leave empty for "password"): ', answer => {
      resolve(answer || 'password');
    });
  });

  const countStr = await new Promise(resolve => {
    rl.question('How many expenses to generate? (default 100): ', resolve);
  });
  const count = parseInt(countStr) || 100;

  rl.close();

  console.log(`Authenticating as ${email}...`);
  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !user) {
    console.error('Login failed:', error?.message);
    return;
  }

  console.log(`Logged in as user ID: ${user.id}`);
  await seedExpenses(user.id, count);
}

main();
