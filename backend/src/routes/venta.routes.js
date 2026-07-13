const router = require('express').Router();
const verificarToken = require('../middleware/auth.middleware');
const { registrarVenta } = require('../controllers/venta.controller');

router.post('/', verificarToken, registrarVenta);

module.exports = router;