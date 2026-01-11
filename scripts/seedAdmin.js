// Seeder para crear un usuario admin inicial de forma segura
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const connectDB = require('../src/config/db');

// Lee email y password desde env o argumentos
const email = process.env.SEED_ADMIN_EMAIL || process.argv[2];
const password = process.env.SEED_ADMIN_PASS || process.argv[3];
const name = process.env.SEED_ADMIN_NAME || 'Admin';

if (!email || !password) {
  console.error('Faltan email o password. Usa variables de entorno SEED_ADMIN_EMAIL y SEED_ADMIN_PASS o pásalos como argumentos. Ejemplo:');
  console.error('  node scripts/seedAdmin.js admin@dominio.com Pass123!');
  process.exit(1);
}

async function seed() {
  await connectDB();
  const exists = await User.findOne({ email });
  if (exists) {
    console.log('Ya existe un usuario con ese email. No se crea otro.');
    await mongoose.disconnect();
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hash, role: 'admin' });
  await user.save();
  console.log('Usuario admin creado:', { email, password });
  await mongoose.disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });