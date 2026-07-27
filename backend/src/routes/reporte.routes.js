const router = require('express').Router();
const verificarToken = require('../middleware/auth.middleware');
const { reporteVentas, reporteInventario } = require('../controllers/reporte.controller');

router.get('/ventas',     verificarToken, reporteVentas);
router.get('/inventario', verificarToken, reporteInventario);

module.exports = router;