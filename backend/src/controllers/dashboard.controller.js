const Producto = require('../models/Producto');
const Venta = require('../models/Venta');
const Cliente = require('../models/Cliente');
const Movimiento = require('../models/Movimiento');

exports.obtenerResumen = async (req, res) => {
  try {
    const hoy = new Date();
    const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const finDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);

    // Totales generales
    const totalProductos = await Producto.countDocuments({ activo: true });
    const totalClientes = await Cliente.countDocuments({ activo: true });

    // Productos con stock bajo
    const productosStockBajo = await Producto.countDocuments({
      activo: true,
      $expr: { $lte: ['$stock', '$stockMinimo'] }
    });

    // Ventas del día
    const ventasHoy = await Venta.find({
      createdAt: { $gte: inicioDia, $lt: finDia },
      estado: { $ne: 'cancelado' }
    });
    const totalVentasHoy = ventasHoy.length;
    const ingresosHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0);

    // Ventas últimos 7 días
    const hace7Dias = new Date(hoy);
    hace7Dias.setDate(hoy.getDate() - 6);

    const ventas7Dias = await Venta.find({
      createdAt: { $gte: hace7Dias },
      estado: { $ne: 'cancelado' }
    });

    const ventasPorDia = {};
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - i);
      const key = fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
      ventasPorDia[key] = 0;
    }

    ventas7Dias.forEach((v) => {
      const key = new Date(v.createdAt).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
      if (ventasPorDia[key] !== undefined) {
        ventasPorDia[key] += v.total;
      }
    });

    // Productos más vendidos
    const movimientos = await Movimiento.find({ tipo: 'venta' })
      .populate('producto', 'nombre')
      .sort({ createdAt: -1 })
      .limit(100);

    const productosVendidos = {};
    movimientos.forEach((m) => {
      const nombre = m.producto?.nombre || 'Desconocido';
      productosVendidos[nombre] = (productosVendidos[nombre] || 0) + m.cantidad;
    });

    const topProductos = Object.entries(productosVendidos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }));

    res.json({
      totalProductos,
      totalClientes,
      productosStockBajo,
      totalVentasHoy,
      ingresosHoy,
      ventasPorDia,
      topProductos,
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener resumen' });
  }
};