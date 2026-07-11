const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(401).json({ mensaje: 'Credenciales incorrectas' });

    const valido = await usuario.compararPassword(password);
    if (!valido) return res.status(401).json({ mensaje: 'Credenciales incorrectas' });

    const token = jwt.sign(
      { id: usuario._id, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ token, nombre: usuario.nombre });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};