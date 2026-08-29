const router = require('express').Router();
const verificarToken = require('../middleware/auth.middleware');
const verificarRol = require('../middleware/rol.middleware');
const {
  crearProducto,
  obtenerProductos,
  actualizarProducto,
  eliminarProducto,
  obtenerAlertas,
  actualizarDescuento
} = require('../controllers/producto.controller');

router.get('/alertas',      verificarToken, obtenerAlertas);
router.get('/',             verificarToken, obtenerProductos);
router.post('/',            verificarToken, verificarRol('admin'), crearProducto);
router.put('/:id',          verificarToken, verificarRol('admin'), actualizarProducto);
router.put('/:id/descuento', verificarToken, verificarRol('admin'), actualizarDescuento);
router.delete('/:id',       verificarToken, verificarRol('admin'), eliminarProducto);

module.exports = router;