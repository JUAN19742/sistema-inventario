const router = require('express').Router();
const verificarToken = require('../middleware/auth.middleware');
const verificarRol = require('../middleware/rol.middleware');
const {
  obtenerUsuarios,
  crearUsuario,
  eliminarUsuario
} = require('../controllers/usuario.controller');

router.get('/',       verificarToken, verificarRol('admin'), obtenerUsuarios);
router.post('/',      verificarToken, verificarRol('admin'), crearUsuario);
router.delete('/:id', verificarToken, verificarRol('admin'), eliminarUsuario);

module.exports = router;