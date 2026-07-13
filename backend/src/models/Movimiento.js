const mongoose = require('mongoose');

const movimientoSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  tipo: { type: String, enum: ['entrada', 'salida', 'venta'], required: true },
  cantidad: { type: Number, required: true },
  stockResultante: { type: Number, required: true },
  motivo: { type: String, default: '' },
  proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor', default: null },
  referencia: { type: String, default: '' }, // folio de venta si aplica
}, { timestamps: true });

module.exports = mongoose.model('Movimiento', movimientoSchema);