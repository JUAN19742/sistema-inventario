const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre:       { type: String, required: true, unique: true },
  descripcion:  { type: String, default: '' },
  categoria:    { type: String, required: true },
  precioCompra: { type: Number, required: true },
  precioVenta:  { type: Number, required: true },
  stock:        { type: Number, required: true, default: 0 },
  stockMinimo:  { type: Number, default: 5 },
  imagen:       { type: String, default: '' },
  activo:       { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Producto', productoSchema);