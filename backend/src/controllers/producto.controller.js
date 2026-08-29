const Producto = require('../models/Producto');
const Categoria = require('../models/Categoria');

exports.crearProducto = async (req, res) => {
  try {
    const { precioBulto, ...resto } = req.body;
    const producto = await Producto.create({
      ...resto,
      precioBulto: precioBulto === '' ? undefined : precioBulto,
    });
    res.status(201).json(producto);
  } catch (error) {
    console.error('Error al crear producto:', error);
    if (error.code === 11000) return res.status(400).json({ mensaje: 'Ya existe un producto con ese nombre' });
    res.status(500).json({ mensaje: 'Error al crear producto' });
  }
};

exports.obtenerProductos = async (req, res) => {
  try {
    const { nombre, categoria } = req.query;
    const filtro = { activo: true };
    if (nombre) {
      const categoriasCoincidentes = await Categoria.find({
        nombre: { $regex: nombre, $options: 'i' },
      }).select('_id');
      const idsCategorias = categoriasCoincidentes.map((c) => c._id);

      filtro.$or = [
        { nombre: { $regex: nombre, $options: 'i' } },
        { codigo: { $regex: nombre, $options: 'i' } },
        { categoria: { $in: idsCategorias } },
      ];
    }
    if (categoria) filtro.categoria = categoria;

    const productos = await Producto.find(filtro)
      .select('-imagen')
      .populate('categoria', 'nombre')
      .sort({ createdAt: -1 });
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ mensaje: 'Error al obtener productos' });
  }
};

exports.obtenerImagenesProductos = async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.json([]);
    const idArray = ids.split(',').filter(Boolean);
    const productos = await Producto.find({ _id: { $in: idArray } }).select('imagen');
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener imagenes de productos:', error);
    res.status(500).json({ mensaje: 'Error al obtener imagenes' });
  }
};

exports.actualizarProducto = async (req, res) => {
  try {
    const { precioBulto, imagen, ...resto } = req.body;
    const body = {
      ...resto,
      precioBulto: precioBulto === '' ? undefined : precioBulto,
    };
    if (imagen) body.imagen = imagen;
    const producto = await Producto.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ mensaje: 'Error al actualizar producto' });
  }
};

exports.eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto desactivado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ mensaje: 'Error al eliminar producto' });
  }
};

exports.obtenerAlertas = async (req, res) => {
  try {
    const productos = await Producto.find({ activo: true })
      .select('nombre stock stockMinimo categoria')
      .populate('categoria', 'nombre');

    const alertas = productos.filter((p) => p.stock <= p.stockMinimo);

    res.json({
      total: alertas.length,
      productos: alertas.map((p) => ({
        _id: p._id,
        nombre: p.nombre,
        categoria: p.categoria?.nombre || '—',
        stock: p.stock,
        stockMinimo: p.stockMinimo,
      })),
    });
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({ mensaje: 'Error al obtener alertas' });
  }
};

exports.actualizarDescuento = async (req, res) => {
  try {
    const { descuento, enOferta } = req.body;
    if (descuento < 0 || descuento > 100) {
      return res.status(400).json({ mensaje: 'El descuento debe estar entre 0 y 100' });
    }
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { descuento, enOferta },
      { new: true }
    );
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    console.error('Error al actualizar descuento:', error);
    res.status(500).json({ mensaje: 'Error al actualizar descuento' });
  }
};