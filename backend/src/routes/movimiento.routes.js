const router = require('express').Router();
const verificarToken = require('../middleware/auth.middleware');
const {
  registrarEntrada,
  registrarSalida,
  obtenerHistorial
} = require('../controllers/movimiento.controller');

router.post('/entrada', verificarToken, registrarEntrada);
router.post('/salida', verificarToken, registrarSalida);
router.get('/', verificarToken, obtenerHistorial);

module.exports = router;