const Producto = require('../models/Producto');

exports.crearProducto = async (req, res) => {
  try {
    const { categoriaId, precioBulto, ...resto } = req.body;
    const producto = await Producto.create({
      ...resto,
      categoria: categoriaId,
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
      filtro.$or = [
        { nombre: { $regex: nombre, $options: 'i' } },
        { codigo: { $regex: nombre, $options: 'i' } },
      ];
    }
    if (categoria) filtro.categoria = categoria;

    const productos = await Producto.find(filtro)
      .populate('categoria', 'nombre')
      .sort({ createdAt: -1 });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos' });
  }
};

exports.actualizarProducto = async (req, res) => {
  try {
    const { categoriaId, precioBulto, ...resto } = req.body;
    const body = {
      ...resto,
      ...(categoriaId ? { categoria: categoriaId } : {}),
      precioBulto: precioBulto === '' ? undefined : precioBulto,
    };
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
    res.status(500).json({ mensaje: 'Error al eliminar producto' });
  }
};

exports.obtenerAlertas = async (req, res) => {
  try {
    const productos = await Producto.find({ activo: true })
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
    res.status(500).json({ mensaje: 'Error al actualizar descuento' });
  }
};