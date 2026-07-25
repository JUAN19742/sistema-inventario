const Producto = require('../models/Producto');
const Categoria = require('../models/Categoria');

exports.obtenerCatalogo = async (req, res) => {
  try {
    const { categoria } = req.query;
    const filtro = { activo: true, stock: { $gt: 0 } };

    if (categoria) {
      const cat = await Categoria.findOne({ nombre: categoria });
      if (cat) {
        filtro.categoria = cat._id;
      } else {
        return res.json([]);
      }
    }

    const productos = await Producto.find(filtro)
      .select('nombre descripcion categoria precioVenta imagen stock descuento enOferta')
      .populate('categoria', 'nombre')
      .sort({ categoria: 1 });

    res.json(productos);
  } catch (error) {
    console.error('Error catálogo:', error);
    res.status(500).json({ mensaje: 'Error al obtener catálogo' });
  }
};