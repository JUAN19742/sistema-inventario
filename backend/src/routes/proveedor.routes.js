const router = require('express').Router();
const verificarToken = require('../middleware/auth.middleware');
const {
  obtenerProveedores,
  crearProveedor,
  eliminarProveedor
} = require('../controllers/proveedor.controller');

router.get('/',       verificarToken, obtenerProveedores);
router.post('/',      verificarToken, crearProveedor);
router.delete('/:id', verificarToken, eliminarProveedor);

module.exports = router;