const mongoose = require('mongoose');

const proveedorSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true, trim: true },
  telefono: { type: String, default: '' },
  email: { type: String, default: '' },
  activo: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Proveedor', proveedorSchema);