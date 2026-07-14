const Producto = require('../models/Producto');

// Pública - no requiere token
exports.obtenerCatalogo = async (req, res) => {
  try {
    const { categoria } = req.query;
    const filtro = { activo: true, stock: { $gt: 0 } };

    if (categoria) {
      const Categoria = require('../models/Categoria');
      const cat = await Categoria.findOne({ nombre: categoria });
      if (cat) filtro.categoria = cat._id;
    }

    const productos = await Producto.find(filtro)
      .select('nombre descripcion categoria precioVenta imagen stock')
      .populate('categoria', 'nombre')
      .sort({ categoria: 1 });

    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener catálogo' });
  }
};