const router = require('express').Router();
const verificarToken = require('../middleware/auth.middleware');
const {
  registrarVenta,
  obtenerVentas,
  obtenerVenta,
  cancelarVenta,
  obtenerVentasPorCliente
} = require('../controllers/venta.controller');

router.post('/',                    verificarToken, registrarVenta);
router.get('/',                     verificarToken, obtenerVentas);
router.get('/cliente/:clienteId',   verificarToken, obtenerVentasPorCliente);
router.get('/:id',                  verificarToken, obtenerVenta);
router.put('/:id/cancelar',         verificarToken, cancelarVenta);

module.exports = router;