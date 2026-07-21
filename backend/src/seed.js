require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('./models/Usuario');
const conectarDB = require('./config/db');

conectarDB().then(async () => {
  const existe = await Usuario.findOne({ email: 'admin@tienda.com' });
  if (existe) {
    await Usuario.findOneAndUpdate(
      { email: 'admin@tienda.com' },
      { rol: 'admin' }
    );
    console.log('Admin actualizado con rol admin');
  } else {
    await Usuario.create({
      nombre: 'Admin',
      email: 'admin@tienda.com',
      password: 'admin123',
      rol: 'admin'
    });
    console.log('Admin creado');
  }
  process.exit();
});