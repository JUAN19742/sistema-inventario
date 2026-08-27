import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { IconPlus, IconMinus, IconTrash, IconSearch } from '../components/Icons';

const Ventas = () => {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [prodRes, cliRes] = await Promise.all([
          api.get('/productos'),
          api.get('/clientes'),
        ]);
        setProductos(prodRes.data);
        setClientes(cliRes.data);
      } catch {
        toast.error('Error al cargar datos');
      }
    };
    cargarDatos();
  }, []);

  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item._id === producto._id);
      if (existe) {
        if (existe.cantidad >= producto.stock) {
          toast.error('No hay más stock disponible');
          return prev;
        }
        return prev.map((item) =>
          item._id === producto._id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      if (producto.stock === 0) {
        toast.error('Producto sin stock');
        return prev;
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id, delta) => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if (item._id !== id) return item;
          const nuevaCantidad = item.cantidad + delta;
          if (nuevaCantidad > item.stock) {
            toast.error('No hay más stock disponible');
            return item;
          }
          return { ...item, cantidad: nuevaCantidad };
        })
        .filter((item) => item.cantidad > 0)
    );
  };

  const quitarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((item) => item._id !== id));
  };

  const total = carrito.reduce(
    (sum, item) => sum + item.precioVenta * item.cantidad, 0
  );

  const productosFiltrados = productos.filter((p) => {
    const texto = busqueda.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(texto) ||
      (p.codigo || '').toLowerCase().includes(texto)
    );
  });

  const registrarVenta = async () => {
    if (carrito.length === 0) {
      toast.error('Agrega al menos un producto');
      return;
    }
    setCargando(true);
    try {
      const detalle = carrito.map((item) => ({
        productoId: item._id,
        cantidad: item.cantidad,
      }));
      const { data } = await api.post('/ventas', { detalle, clienteId: clienteId || null });
      toast.success(`Venta ${data.folio} registrada exitosamente`);
      setCarrito([]);
      setClienteId('');
      const { data: productosActualizados } = await api.get('/productos');
      setProductos(productosActualizados);
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al registrar venta');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">

      {/* Lista de productos */}
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Nueva venta</h2>

        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder="Buscar producto por nombre o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {productosFiltrados.map((p) => (
            <div
              key={p._id}
              className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col ${
                p.stock === 0 ? 'opacity-50' : 'hover:shadow-md transition'
              }`}
            >
              <div className="bg-gray-50 aspect-square flex items-center justify-center p-2">
                {p.imagen ? (
                  <img src={p.imagen} alt={p.nombre} className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-3xl">📦</span>
                )}
              </div>
              <div className="p-3 flex flex-col gap-2">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{p.nombre}</p>
                  <p className="text-gray-500 text-xs">
                    Stock: {p.stock} · ${p.precioVenta}
                  </p>
                </div>
                <button
                  onClick={() => agregarAlCarrito(p)}
                  disabled={p.stock === 0}
                  className="w-full bg-gray-900 text-white py-1.5 rounded-lg text-xs font-medium hover:bg-gray-700 transition disabled:opacity-50"
                >
                  {p.stock === 0 ? 'Sin stock' : 'Agregar'}
                </button>
              </div>
            </div>
          ))}
          {productosFiltrados.length === 0 && (
            <p className="col-span-full text-center text-gray-400 py-12">
              No se encontraron productos
            </p>
          )}
        </div>
      </div>

      {/* Carrito de venta — panel fijo */}
      <div className="lg:w-80 lg:shrink-0">
        <div className="lg:sticky lg:top-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen de venta</h3>
          <div className="bg-white rounded-2xl shadow flex flex-col max-h-[85vh] overflow-hidden">

            <div className="overflow-y-auto p-4 flex flex-col gap-3" style={{ maxHeight: '40vh' }}>
              {carrito.length === 0 && (
                <p className="text-center text-gray-400 py-8 text-sm">
                  Agrega productos para iniciar la venta
                </p>
              )}
              {carrito.map((item) => (
                <div key={item._id} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-gray-800 text-sm flex-1">{item.nombre}</p>
                    <button
                      onClick={() => quitarDelCarrito(item._id)}
                      className="text-gray-400 hover:text-red-500 ml-2"
                    >
                      <IconTrash />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => cambiarCantidad(item._id, -1)}
                        className="bg-gray-200 p-1 rounded-lg hover:bg-gray-300 transition"
                      >
                        <IconMinus />
                      </button>
                      <span className="text-sm font-medium w-5 text-center">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => cambiarCantidad(item._id, 1)}
                        className="bg-gray-200 p-1 rounded-lg hover:bg-gray-300 transition"
                      >
                        <IconPlus />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-gray-800">
                      ${(item.precioVenta * item.cantidad).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t shrink-0">
              <div className="flex justify-between mb-4">
                <span className="text-gray-600 font-medium">Total</span>
                <span className="text-xl font-bold text-gray-900">
                  ${total.toFixed(2)}
                </span>
              </div>
              <div className="mb-3">
                <label className="text-sm text-gray-600 mb-1 block">Cliente (opcional)</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                >
                  <option value="">Sin cliente</option>
                  {clientes.map((c) => (
                    <option key={c._id} value={c._id}>{c.nombre} — {c.whatsapp}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={registrarVenta}
                disabled={carrito.length === 0 || cargando}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50"
              >
                {cargando ? 'Registrando...' : 'Confirmar venta'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ventas;