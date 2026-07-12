const router = require('express').Router();
const verificarToken = require('../middleware/auth.middleware');
const {
  crearProducto,
  obtenerProductos,
  actualizarProducto,
  eliminarProducto
} = require('../controllers/producto.controller');

router.get('/',    verificarToken, obtenerProductos);
router.post('/',   verificarToken, crearProducto);
router.put('/:id', verificarToken, actualizarProducto);
router.delete('/:id', verificarToken, eliminarProducto);

module.exports = router;