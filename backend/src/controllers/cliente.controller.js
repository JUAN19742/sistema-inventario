const Cliente = require('../models/Cliente');

exports.obtenerClientes = async (req, res) => {
  try {
    const { nombre } = req.query;
    const filtro = { activo: true };
    if (nombre) filtro.nombre = { $regex: nombre, $options: 'i' };
    const clientes = await Cliente.find(filtro).sort({ nombre: 1 });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener clientes' });
  }
};

exports.crearCliente = async (req, res) => {
  try {
    const cliente = await Cliente.create(req.body);
    res.status(201).json(cliente);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'Ya existe un cliente con ese número de WhatsApp' });
    }
    res.status(500).json({ mensaje: 'Error al crear cliente' });
  }
};

exports.actualizarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar cliente' });
  }
};

exports.eliminarCliente = async (req, res) => {
  try {
    await Cliente.findByIdAndUpdate(req.params.id, { activo: false });
    res.json({ mensaje: 'Cliente eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar cliente' });
  }
};