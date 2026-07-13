import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { IconPlus, IconMinus } from '../components/Icons';

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [tipoModal, setTipoModal] = useState(null);
  const [nuevoProveedor, setNuevoProveedor] = useState('');
  const [mostrarNuevoProveedor, setMostrarNuevoProveedor] = useState(false);
  const [form, setForm] = useState({
    productoId: '', cantidad: '', proveedorId: '', motivo: ''
  });
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [prodRes, movRes, provRes] = await Promise.all([
          api.get('/productos'),
          api.get('/movimientos'),
          api.get('/proveedores'),
        ]);
        setProductos(prodRes.data);
        setMovimientos(movRes.data);
        setProveedores(provRes.data);
      } catch {
        toast.error('Error al cargar datos');
      }
    };
    cargarDatos();
  }, []);

  const abrirModal = (tipo) => {
    setForm({ productoId: '', cantidad: '', proveedorId: '', motivo: '' });
    setNuevoProveedor('');
    setMostrarNuevoProveedor(false);
    setTipoModal(tipo);
  };

  const agregarNuevoProveedor = async () => {
    if (!nuevoProveedor.trim()) return;
    try {
      const { data } = await api.post('/proveedores', { nombre: nuevoProveedor });
      setProveedores((prev) => [...prev, data]);
      setForm((prev) => ({ ...prev, proveedorId: data._id }));
      setNuevoProveedor('');
      setMostrarNuevoProveedor(false);
      toast.success('Proveedor agregado');
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al agregar proveedor');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const endpoint = tipoModal === 'entrada'
        ? '/movimientos/entrada'
        : '/movimientos/salida';

      const body = tipoModal === 'entrada'
        ? {
            productoId: form.productoId,
            cantidad: form.cantidad,
            proveedorId: form.proveedorId,
            motivo: form.motivo
          }
        : {
            productoId: form.productoId,
            cantidad: form.cantidad,
            motivo: form.motivo
          };

      await api.post(endpoint, body);
      toast.success(tipoModal === 'entrada' ? 'Entrada registrada' : 'Salida registrada');
      setTipoModal(null);

      const [prodRes, movRes] = await Promise.all([
        api.get('/productos'),
        api.get('/movimientos'),
      ]);
      setProductos(prodRes.data);
      setMovimientos(movRes.data);
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al registrar movimiento');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Inventario</h2>
        <div className="flex gap-2">
          <button
            onClick={() => abrirModal('entrada')}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
          >
            <IconPlus /> Entrada
          </button>
          <button
            onClick={() => abrirModal('salida')}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition"
          >
            <IconMinus /> Salida
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Producto</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Cantidad</th>
              <th className="px-4 py-3 text-left">Stock resultante</th>
              <th className="px-4 py-3 text-left">Motivo / Proveedor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {movimientos.map((m) => (
              <tr key={m._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">
                  {new Date(m.createdAt).toLocaleDateString()}{' '}
                  {new Date(m.createdAt).toLocaleTimeString()}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {m.producto?.nombre || 'Producto eliminado'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    m.tipo === 'entrada' ? 'bg-green-100 text-green-600' :
                    m.tipo === 'venta' ? 'bg-blue-100 text-blue-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {m.tipo}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-800">{m.cantidad}</td>
                <td className="px-4 py-3 text-gray-500">{m.stockResultante}</td>
                <td className="px-4 py-3 text-gray-500">
                  {m.proveedor?.nombre || m.motivo || '—'}
                </td>
              </tr>
            ))}
            {movimientos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No hay movimientos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {tipoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-800">
                {tipoModal === 'entrada' ? 'Registrar entrada' : 'Registrar salida'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Producto</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  value={form.productoId}
                  onChange={(e) => setForm({ ...form, productoId: e.target.value })}
                  required
                >
                  <option value="">Selecciona un producto</option>
                  {productos.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.nombre} (stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  value={form.cantidad}
                  onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                  required
                />
              </div>

              {tipoModal === 'entrada' && (
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Proveedor</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                    value={form.proveedorId}
                    onChange={(e) => {
                      if (e.target.value === 'nuevo') {
                        setMostrarNuevoProveedor(true);
                        setForm({ ...form, proveedorId: '' });
                      } else {
                        setMostrarNuevoProveedor(false);
                        setForm({ ...form, proveedorId: e.target.value });
                      }
                    }}
                  >
                    <option value="">Sin proveedor</option>
                    {proveedores.map((p) => (
                      <option key={p._id} value={p._id}>{p.nombre}</option>
                    ))}
                    <option value="nuevo">+ Agregar nuevo proveedor</option>
                  </select>

                  {mostrarNuevoProveedor && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Nombre del proveedor"
                        className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                        value={nuevoProveedor}
                        onChange={(e) => setNuevoProveedor(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={agregarNuevoProveedor}
                        className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition"
                      >
                        Guardar
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  {tipoModal === 'entrada' ? 'Observación' : 'Motivo'}
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  value={form.motivo}
                  onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                  placeholder={tipoModal === 'salida' ? 'Ej: producto dañado' : 'Ej: reposición mensual'}
                />
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setTipoModal(null)}
                  className="flex-1 border rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  className={`flex-1 text-white rounded-lg py-2 text-sm font-medium transition disabled:opacity-50 ${
                    tipoModal === 'entrada'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {cargando ? 'Guardando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventario;