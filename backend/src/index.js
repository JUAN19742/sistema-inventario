require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/db');

const app = express();
conectarDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth',     require('./routes/auth.routes'));
app.use('/api/productos', require('./routes/producto.routes'));
app.use('/api/auth',      require('./routes/auth.routes'));
app.use('/api/productos', require('./routes/producto.routes'));
app.use('/api/movimientos', require('./routes/movimiento.routes'));
app.use('/api/catalogo',    require('./routes/catalogo.routes'));
app.use('/api/proveedores', require('./routes/proveedor.routes'));
app.use('/api/categorias', require('./routes/categoria.routes'));
app.use('/api/ventas', require('./routes/venta.routes'));
app.use('/api/clientes', require('./routes/cliente.routes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));