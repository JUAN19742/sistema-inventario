const router = require('express').Router();
const verificarToken = require('../middleware/auth.middleware');
const {
  registrarVenta,
  obtenerVentas,
  obtenerVenta
} = require('../controllers/venta.controller');

router.post('/',     verificarToken, registrarVenta);
router.get('/',      verificarToken, obtenerVentas);
router.get('/:id',   verificarToken, obtenerVenta);

module.exports = router;