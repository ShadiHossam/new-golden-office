const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_PATH = path.join(DATA_DIR, 'users.json');

const DEFAULT_PASSWORD = process.argv[2] || 'admin';

if (DEFAULT_PASSWORD.length < 5) {
  console.error('Password must be at least 5 characters.');
  process.exit(1);
}

console.log('Hashing password...');
const hash = bcrypt.hashSync(DEFAULT_PASSWORD, 12);

const users = [
  {
    id: 1,
    username: 'admin',
    password_hash: hash,
    role: 'admin',
    created_at: new Date().toISOString()
  }
];

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), 'utf-8');

console.log('');
console.log('✓ Admin user created successfully!');
console.log('  Username: admin');
console.log(`  Password: ${DEFAULT_PASSWORD}`);
console.log('');
console.log('Change the password after first login at /2ef65f179f12439e317a23628b016653/password');
