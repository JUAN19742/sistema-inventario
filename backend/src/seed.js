require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('./models/Usuario');
const conectarDB = require('./config/db');

conectarDB().then(async () => {
  await Usuario.create({
    nombre: 'Admin',
    email: 'admin@tienda.com',
    password: 'admin123'
  });
  console.log('Admin creado');
  process.exit();
});
