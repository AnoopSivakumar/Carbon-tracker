/**
 * Seeds default emission factors and an admin account.
 * Run with: npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./pool');

const emissionFactors = [
  { category: 'commute', key: 'car', label: 'Car (petrol/diesel)', factor_value: 0.192, unit: 'km' },
  { category: 'commute', key: 'bike', label: 'Motorbike', factor_value: 0.103, unit: 'km' },
  { category: 'commute', key: 'bus', label: 'Bus', factor_value: 0.089, unit: 'km' },
  { category: 'commute', key: 'train', label: 'Train/Metro', factor_value: 0.041, unit: 'km' },
  { category: 'commute', key: 'cycle', label: 'Bicycle', factor_value: 0.0, unit: 'km' },
  { category: 'commute', key: 'walk', label: 'Walking', factor_value: 0.0, unit: 'km' },
  { category: 'commute', key: 'wfh', label: 'Work from home', factor_value: 0.0, unit: 'km' },
  { category: 'electricity', key: 'kwh', label: 'Grid electricity', factor_value: 0.716, unit: 'kwh' },
  { category: 'water', key: 'liter', label: 'Treated water supply', factor_value: 0.000344, unit: 'liter' },
  { category: 'waste', key: 'segregated_bonus', label: 'Waste segregation bonus (reduction)', factor_value: -0.5, unit: 'flat' }
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const ef of emissionFactors) {
      await client.query(
        `INSERT INTO emission_factors (category, key, label, factor_value, unit)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (category, key) DO UPDATE
           SET label = EXCLUDED.label, factor_value = EXCLUDED.factor_value, unit = EXCLUDED.unit`,
        [ef.category, ef.key, ef.label, ef.factor_value, ef.unit]
      );
    }

    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@carbontracker.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
    const hash = await bcrypt.hash(adminPassword, 10);

    await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ('Platform Admin', $1, $2, 'admin')
       ON CONFLICT (email) DO NOTHING`,
      [adminEmail, hash]
    );

    await client.query('COMMIT');
    console.log('Seed complete.');
    console.log(`Admin login -> email: ${adminEmail}  password: ${adminPassword}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
