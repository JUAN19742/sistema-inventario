const Venta = require('../models/Venta');
const Producto = require('../models/Producto');
const Movimiento = require('../models/Movimiento');

exports.registrarVenta = async (req, res) => {
  try {
    const { detalle, clienteId } = req.body;

    if (!detalle || detalle.length === 0) {
      return res.status(400).json({ mensaje: 'La venta debe tener al menos un producto' });
    }

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

    const venta = new Venta({
      detalle: detalleCompleto,
      total,
      cliente: clienteId || null,
    });
    await venta.save();

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
      .populate('cliente', 'nombre whatsapp')
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

exports.cancelarVenta = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id);
    if (!venta) return res.status(404).json({ mensaje: 'Venta no encontrada' });

    if (venta.estado === 'cancelada') {
      return res.status(400).json({ mensaje: 'La venta ya está cancelada' });
    }

    const hoy = new Date();
    const fechaVenta = new Date(venta.createdAt);
    const mismoDia =
      hoy.getFullYear() === fechaVenta.getFullYear() &&
      hoy.getMonth() === fechaVenta.getMonth() &&
      hoy.getDate() === fechaVenta.getDate();

    if (!mismoDia) {
      return res.status(400).json({ mensaje: 'Solo se puede cancelar una venta del mismo día' });
    }

    // Restaurar stock de cada producto
    for (const item of venta.detalle) {
      const producto = await Producto.findById(item.producto);
      if (producto) {
        producto.stock += item.cantidad;
        await producto.save();

        await Movimiento.create({
          producto: producto._id,
          tipo: 'entrada',
          cantidad: item.cantidad,
          stockResultante: producto.stock,
          motivo: `Cancelación de venta ${venta.folio}`,
          referencia: venta.folio,
        });
      }
    }

    venta.estado = 'cancelada';
    await venta.save();

    res.json({ mensaje: 'Venta cancelada correctamente', venta });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cancelar venta' });
  }
};

exports.obtenerVentasPorCliente = async (req, res) => {
  try {
    const ventas = await Venta.find({
      cliente: req.params.clienteId,
      estado: 'activa'
    })
      .populate('cliente', 'nombre whatsapp')
      .sort({ createdAt: -1 });

    const totalGastado = ventas.reduce((sum, v) => sum + v.total, 0);
    const totalCompras = ventas.length;

    res.json({ ventas, totalGastado, totalCompras });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener ventas del cliente' });
  }
};