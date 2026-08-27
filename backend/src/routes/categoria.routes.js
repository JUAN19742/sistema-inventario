const router = require('express').Router();
const verificarToken = require('../middleware/auth.middleware');
const {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
} = require('../controllers/categoria.controller');

router.get('/',       verificarToken, obtenerCategorias);
router.post('/',      verificarToken, crearCategoria);
router.put('/:id',    verificarToken, actualizarCategoria);
router.delete('/:id', verificarToken, eliminarCategoria);

module.exports = router;