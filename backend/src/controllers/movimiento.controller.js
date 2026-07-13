const Movimiento = require('../models/Movimiento');
const Producto = require('../models/Producto');

// HU-07: Registrar entrada
exports.registrarEntrada = async (req, res) => {
  try {
    const { productoId, cantidad, proveedor, motivo } = req.body;

    if (cantidad <= 0) {
      return res.status(400).json({ mensaje: 'La cantidad debe ser mayor a 0' });
    }

    const producto = await Producto.findById(productoId);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    producto.stock += Number(cantidad);
    await producto.save();

    const movimiento = await Movimiento.create({
      producto: producto._id,
      tipo: 'entrada',
      cantidad,
      stockResultante: producto.stock,
      proveedor,
      motivo,
    });

    res.status(201).json({ movimiento, stockActual: producto.stock });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar entrada' });
  }
};

// HU-08: Registrar salida
exports.registrarSalida = async (req, res) => {
  try {
    const { productoId, cantidad, motivo } = req.body;

    if (cantidad <= 0) {
      return res.status(400).json({ mensaje: 'La cantidad debe ser mayor a 0' });
    }

    const producto = await Producto.findById(productoId);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    if (producto.stock < cantidad) {
      return res.status(400).json({ mensaje: 'Stock insuficiente para esta salida' });
    }

    producto.stock -= Number(cantidad);
    await producto.save();

    const movimiento = await Movimiento.create({
      producto: producto._id,
      tipo: 'salida',
      cantidad,
      stockResultante: producto.stock,
      motivo,
    });

    res.status(201).json({ movimiento, stockActual: producto.stock });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar salida' });
  }
};

// HU-09: Ver historial
exports.obtenerHistorial = async (req, res) => {
  try {
    const { productoId, fechaInicio, fechaFin } = req.query;
    const filtro = {};

    if (productoId) filtro.producto = productoId;
    if (fechaInicio || fechaFin) {
      filtro.createdAt = {};
      if (fechaInicio) filtro.createdAt.$gte = new Date(fechaInicio);
      if (fechaFin) filtro.createdAt.$lte = new Date(fechaFin);
    }

    const movimientos = await Movimiento.find(filtro)
      .populate('producto', 'nombre')
      .sort({ createdAt: -1 });

    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener historial' });
  }
};