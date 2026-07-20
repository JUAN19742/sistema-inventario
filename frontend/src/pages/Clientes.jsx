import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { IconPlus, IconEdit, IconTrash, IconX } from '../components/Icons';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditar, setClienteEditar] = useState(null);
  const [form, setForm] = useState({ nombre: '', whatsapp: '', direccion: '' });
  const [cargando, setCargando] = useState(false);
  const [clienteHistorial, setClienteHistorial] = useState(null);
  const [historial, setHistorial] = useState({ ventas: [], totalGastado: 0, totalCompras: 0 });
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const { data } = await api.get(`/clientes?nombre=${busqueda}`);
        setClientes(data);
      } catch {
        toast.error('Error al cargar clientes');
      }
    };
    cargarClientes();
  }, [busqueda]);

  const abrirModal = (cliente = null) => {
    setClienteEditar(cliente);
    setForm(cliente
      ? { nombre: cliente.nombre, whatsapp: cliente.whatsapp, direccion: cliente.direccion }
      : { nombre: '', whatsapp: '', direccion: '' }
    );
    setModalAbierto(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      if (clienteEditar) {
        await api.put(`/clientes/${clienteEditar._id}`, form);
        toast.success('Cliente actualizado');
      } else {
        await api.post('/clientes', form);
        toast.success('Cliente registrado');
      }
      setModalAbierto(false);
      const { data } = await api.get(`/clientes?nombre=${busqueda}`);
      setClientes(data);
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al guardar cliente');
    } finally {
      setCargando(false);
    }
  };

  const eliminarCliente = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este cliente?')) return;
    try {
      await api.delete(`/clientes/${id}`);
      toast.success('Cliente eliminado');
      const { data } = await api.get('/clientes');
      setClientes(data);
    } catch {
      toast.error('Error al eliminar cliente');
    }
  };

  const abrirWhatsApp = (numero) => {
    window.open(`https://wa.me/${numero}`, '_blank');
  };

  const verHistorial = async (cliente) => {
    setCargandoHistorial(true);
    setClienteHistorial(cliente);
    try {
      const { data } = await api.get(`/ventas/cliente/${cliente._id}`);
      setHistorial(data);
    } catch {
      toast.error('Error al cargar historial');
    } finally {
      setCargandoHistorial(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
        <button
          onClick={() => abrirModal()}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition"
        >
          <IconPlus /> Nuevo cliente
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar cliente..."
        className="w-full border rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-gray-300"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">WhatsApp</th>
              <th className="px-4 py-3 text-left">Dirección</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clientes.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{c.nombre}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => abrirWhatsApp(c.whatsapp)}
                    className="text-green-600 hover:text-green-800 font-medium"
                  >
                    {c.whatsapp}
                  </button>
                </td>
                <td className="px-4 py-3 text-gray-500">{c.direccion || '—'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => abrirModal(c)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition"
                  >
                    <IconEdit />
                  </button>
                  <button
                    onClick={() => eliminarCliente(c._id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition"
                  >
                    <IconTrash />
                  </button>
                  <button
                    onClick={() => verHistorial(c)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition text-xs font-medium"
                  >
                    Historial
                  </button>
                </td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  No hay clientes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-bold text-gray-800">
                {clienteEditar ? 'Editar cliente' : 'Nuevo cliente'}
              </h3>
              <button onClick={() => setModalAbierto(false)} className="text-gray-400 hover:text-gray-600">
                <IconX />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Nombre</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Número WhatsApp (con código de país)
                </label>
                <input
                  type="text"
                  placeholder="Ej: 593987654321"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Dirección (opcional)</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={cargando}
                className="bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50 mt-2"
              >
                {cargando ? 'Guardando...' : 'Guardar cliente'}
              </button>
            </form>
          </div>
        </div>
      )}

      {clienteHistorial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {clienteHistorial.nombre}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{clienteHistorial.whatsapp}</p>
              </div>
              <button
                onClick={() => setClienteHistorial(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <IconX />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-6 border-b">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-800">{historial.totalCompras}</p>
                <p className="text-sm text-gray-500 mt-1">Compras realizadas</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-800">${historial.totalGastado.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-1">Total gastado</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cargandoHistorial && (
                <p className="text-center text-gray-400">Cargando...</p>
              )}
              {!cargandoHistorial && historial.ventas.length === 0 && (
                <p className="text-center text-gray-400 py-8">
                  Este cliente no tiene compras registradas
                </p>
              )}
              <div className="flex flex-col gap-3">
                {historial.ventas.map((v) => (
                  <div key={v._id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800">{v.folio}</span>
                      <span className="font-bold text-gray-900">${v.total.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {new Date(v.createdAt).toLocaleDateString()}{' '}
                      {new Date(v.createdAt).toLocaleTimeString()}
                    </p>
                    <div className="flex flex-col gap-1">
                      {v.detalle.map((d, i) => (
                        <p key={i} className="text-xs text-gray-600">
                          {d.cantidad}x {d.nombre} — ${d.subtotal.toFixed(2)}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t">
              <button
                onClick={() => window.open(`https://wa.me/${clienteHistorial.whatsapp}`, '_blank')}
                className="w-full bg-green-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition"
              >
                Contactar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;