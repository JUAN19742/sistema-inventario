const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  whatsapp: { type: String, required: true, unique: true, trim: true },
  direccion: { type: String, default: '' },
  activo: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Cliente', clienteSchema);