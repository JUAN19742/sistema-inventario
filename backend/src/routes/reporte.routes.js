const router = require('express').Router();
const verificarToken = require('../middleware/auth.middleware');
const { reporteVentas } = require('../controllers/reporte.controller');

router.get('/ventas', verificarToken, reporteVentas);

module.exports = router;