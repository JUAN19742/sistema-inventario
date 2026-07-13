const router = require('express').Router();
const verificarToken = require('../middleware/auth.middleware');
const {
  obtenerCategorias,
  crearCategoria,
  eliminarCategoria
} = require('../controllers/categoria.controller');

router.get('/',       verificarToken, obtenerCategorias);
router.post('/',      verificarToken, crearCategoria);
router.delete('/:id', verificarToken, eliminarCategoria);

module.exports = router;