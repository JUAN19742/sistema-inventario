const Proveedor = require('../models/Proveedor');

exports.obtenerProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.find({ activo: true }).sort({ nombre: 1 });
    res.json(proveedores);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener proveedores' });
  }
};

exports.crearProveedor = async (req, res) => {
  try {
    const proveedor = await Proveedor.create(req.body);
    res.status(201).json(proveedor);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'Ya existe un proveedor con ese nombre' });
    }
    res.status(500).json({ mensaje: 'Error al crear proveedor' });
  }
};

exports.eliminarProveedor = async (req, res) => {
  try {
    await Proveedor.findByIdAndUpdate(req.params.id, { activo: false });
    res.json({ mensaje: 'Proveedor eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar proveedor' });
  }
};