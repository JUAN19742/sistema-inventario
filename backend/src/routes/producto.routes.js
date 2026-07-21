const router = require('express').Router();
const verificarToken = require('../middleware/auth.middleware');
const verificarRol = require('../middleware/rol.middleware');
const {
  crearProducto,
  obtenerProductos,
  actualizarProducto,
  eliminarProducto
} = require('../controllers/producto.controller');

router.get('/',     verificarToken, obtenerProductos);
router.post('/',    verificarToken, verificarRol('admin'), crearProducto);
router.put('/:id',  verificarToken, verificarRol('admin'), actualizarProducto);
router.delete('/:id', verificarToken, verificarRol('admin'), eliminarProducto);

module.exports = router;