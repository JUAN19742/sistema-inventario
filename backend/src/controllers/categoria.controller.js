const Categoria = require('../models/Categoria');

exports.obtenerCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find({ activo: true }).sort({ nombre: 1 });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener categorías' });
  }
};

exports.crearCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.create(req.body);
    res.status(201).json(categoria);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'Ya existe una categoría con ese nombre' });
    }
    res.status(500).json({ mensaje: 'Error al crear categoría' });
  }
};

exports.eliminarCategoria = async (req, res) => {
  try {
    await Categoria.findByIdAndUpdate(req.params.id, { activo: false });
    res.json({ mensaje: 'Categoría eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar categoría' });
  }
};