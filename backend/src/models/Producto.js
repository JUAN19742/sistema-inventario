const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre:       { type: String, required: true, unique: true },
  codigo:       { type: String, default: '', trim: true },
  precioBulto:  { type: Number },
  descripcion:  { type: String, default: '' },
  categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true },
  precioCompra: { type: Number, required: true },
  precioVenta:  { type: Number, required: true },
  stock:        { type: Number, required: true, default: 0 },
  stockMinimo:  { type: Number, default: 5 },
  imagen:       { type: String, default: '' },
  activo:       { type: Boolean, default: true },
  descuento: { type: Number, default: 0, min: 0, max: 100 },
  enOferta: { type: Boolean, default: false },
}, { timestamps: true });

productoSchema.index({ createdAt: -1 });
module.exports = mongoose.model('Producto', productoSchema);