const mongoose = require('mongoose');

const detalleVentaSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  nombre: { type: String, required: true },
  cantidad: { type: Number, required: true },
  precioUnitario: { type: Number, required: true },
  subtotal: { type: Number, required: true },
});

const ventaSchema = new mongoose.Schema({
  folio: { type: String, unique: true },
  detalle: [detalleVentaSchema],
  total: { type: Number, required: true },
  estado: { type: String, enum: ['activa', 'cancelada'], default: 'activa' },
}, { timestamps: true });

ventaSchema.pre('save', async function () {
  if (!this.folio) {
    const count = await mongoose.model('Venta').countDocuments();
    this.folio = `VTA-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Venta', ventaSchema);