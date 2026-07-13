const router = require('express').Router();
const { obtenerCatalogo } = require('../controllers/catalogo.controller');

router.get('/', obtenerCatalogo); // sin verificarToken, es pública

module.exports = router;