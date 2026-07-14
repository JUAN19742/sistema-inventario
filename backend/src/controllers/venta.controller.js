const Venta = require('../models/Venta');
const Producto = require('../models/Producto');
const Movimiento = require('../models/Movimiento');

exports.registrarVenta = async (req, res) => {
  try {
    const { detalle } = req.body;

    if (!detalle || detalle.length === 0) {
      return res.status(400).json({ mensaje: 'La venta debe tener al menos un producto' });
    }

    // Verificar stock y construir detalle
    const detalleCompleto = [];
    let total = 0;

    for (const item of detalle) {
      const producto = await Producto.findById(item.productoId);
      if (!producto) {
        return res.status(404).json({ mensaje: `Producto no encontrado: ${item.productoId}` });
      }
      if (producto.stock < item.cantidad) {
        return res.status(400).json({
          mensaje: `Stock insuficiente para: ${producto.nombre}`
        });
      }

      const subtotal = producto.precioVenta * item.cantidad;
      total += subtotal;

      detalleCompleto.push({
        producto: producto._id,
        nombre: producto.nombre,
        cantidad: item.cantidad,
        precioUnitario: producto.precioVenta,
        subtotal,
      });
    }

    // Crear la venta
    const venta = new Venta({ detalle: detalleCompleto, total });
    await venta.save();

    // Descontar stock y registrar movimientos
    for (const item of detalleCompleto) {
      const producto = await Producto.findById(item.producto);
      producto.stock -= item.cantidad;
      await producto.save();

      await Movimiento.create({
        producto: producto._id,
        tipo: 'venta',
        cantidad: item.cantidad,
        stockResultante: producto.stock,
        referencia: venta.folio,
        motivo: `Venta ${venta.folio}`,
      });
    }

    res.status(201).json(venta);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar venta' });
  }
};

exports.obtenerVentas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const filtro = {};

    if (fechaInicio || fechaFin) {
      filtro.createdAt = {};
      if (fechaInicio) filtro.createdAt.$gte = new Date(fechaInicio);
      if (fechaFin) filtro.createdAt.$lte = new Date(fechaFin);
    }

    const ventas = await Venta.find(filtro)
      .sort({ createdAt: -1 });

    res.json(ventas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener ventas' });
  }
};

exports.obtenerVenta = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id);
    if (!venta) return res.status(404).json({ mensaje: 'Venta no encontrada' });
    res.json(venta);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener venta' });
  }
};