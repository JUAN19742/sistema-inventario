const router = require('express').Router();
const verificarToken = require('../middleware/auth.middleware');
const { obtenerResumen } = require('../controllers/dashboard.controller');

router.get('/', verificarToken, obtenerResumen);

module.exports = router;