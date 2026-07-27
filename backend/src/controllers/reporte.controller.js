const Venta = require('../models/Venta');
const Movimiento = require('../models/Movimiento');
const Producto = require('../models/Producto');

exports.reporteVentas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const filtro = { estado: { $ne: 'cancelado' } };
    if (fechaInicio || fechaFin) {
      filtro.createdAt = {};
      if (fechaInicio) filtro.createdAt.$gte = new Date(fechaInicio);
      if (fechaFin) {
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        filtro.createdAt.$lte = fin;
      }
    }

    const ventas = await Venta.find(filtro)
      .populate('cliente', 'nombre')
      .sort({ createdAt: -1 });

    const totalVentas = ventas.length;
    const ingresosTotales = ventas.reduce((sum, v) => sum + v.total, 0);

    // Producto más vendido
    const conteoProductos = {};
    ventas.forEach((v) => {
      v.detalle.forEach((d) => {
        conteoProductos[d.nombre] = (conteoProductos[d.nombre] || 0) + d.cantidad;
      });
    });

    const productoMasVendido = Object.entries(conteoProductos)
      .sort((a, b) => b[1] - a[1])[0];

    res.json({
      totalVentas,
      ingresosTotales,
      productoMasVendido: productoMasVendido
        ? { nombre: productoMasVendido[0], cantidad: productoMasVendido[1] }
        : null,
      ventas,
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al generar reporte de ventas' });
  }
};