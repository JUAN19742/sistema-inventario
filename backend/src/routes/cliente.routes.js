const router = require('express').Router();
const verificarToken = require('../middleware/auth.middleware');
const {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente
} = require('../controllers/cliente.controller');

router.get('/',       verificarToken, obtenerClientes);
router.post('/',      verificarToken, crearCliente);
router.put('/:id',    verificarToken, actualizarCliente);
router.delete('/:id', verificarToken, eliminarCliente);

module.exports = router;