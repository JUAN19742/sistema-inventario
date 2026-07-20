import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ESTADOS = ['pendiente', 'confirmado', 'en preparacion', 'entregado', 'cancelado'];

const colorEstado = (estado) => {
  switch (estado) {
    case 'pendiente':      return 'bg-yellow-100 text-yellow-700';
    case 'confirmado':     return 'bg-blue-100 text-blue-700';
    case 'en preparacion': return 'bg-orange-100 text-orange-700';
    case 'entregado':      return 'bg-green-100 text-green-700';
    case 'cancelado':      return 'bg-red-100 text-red-700';
    default:               return 'bg-gray-100 text-gray-700';
  }
};

const Pedidos = () => {
  const [ventas, setVentas] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  useEffect(() => {
    const cargarVentas = async () => {
      try {
        const { data } = await api.get('/ventas');
        setVentas(data);
      } catch {
        toast.error('Error al cargar pedidos');
      }
    };
    cargarVentas();
  }, []);

  const cambiarEstado = async (id, estado) => {
    try {
      await api.put(`/ventas/${id}/estado`, { estado });
      toast.success('Estado actualizado');
      const { data } = await api.get('/ventas');
      setVentas(data);
      if (ventaSeleccionada?._id === id) {
        setVentaSeleccionada((prev) => ({ ...prev, estado }));
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al cambiar estado');
    }
  };

  const ventasFiltradas = filtroEstado
    ? ventas.filter((v) => v.estado === filtroEstado)
    : ventas;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Pedidos</h2>
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFiltroEstado('')}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
              filtroEstado === '' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Todos
          </button>
          {ESTADOS.map((e) => (
            <button
              key={e}
              onClick={() => setFiltroEstado(e)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                filtroEstado === e ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {e.charAt(0).toUpperCase() + e.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Folio</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Cambiar estado</th>
              <th className="px-4 py-3 text-left">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ventasFiltradas.map((v) => (
              <tr key={v._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{v.folio}</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(v.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {v.cliente ? (
                    <button
                      onClick={() => window.open(`https://wa.me/${v.cliente.whatsapp}`, '_blank')}
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
                      {v.cliente.nombre}
                    </button>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  ${v.total.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorEstado(v.estado)}`}>
                    {v.estado}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {v.estado !== 'cancelado' && v.estado !== 'entregado' && (
                    <select
                      className="border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-gray-300"
                      value={v.estado}
                      onChange={(e) => cambiarEstado(v._id, e.target.value)}
                    >
                      {ESTADOS.filter((e) => e !== 'cancelado').map((e) => (
                        <option key={e} value={e}>
                          {e.charAt(0).toUpperCase() + e.slice(1)}
                        </option>
                      ))}
                    </select>
                  )}
                  {(v.estado === 'cancelado' || v.estado === 'entregado') && (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setVentaSeleccionada(v)}
                    className="text-blue-500 hover:text-blue-700 text-xs underline"
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
            {ventasFiltradas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No hay pedidos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {ventaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {ventaSeleccionada.folio}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(ventaSeleccionada.createdAt).toLocaleDateString()}{' '}
                  {new Date(ventaSeleccionada.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorEstado(ventaSeleccionada.estado)}`}>
                {ventaSeleccionada.estado}
              </span>
            </div>

            <div className="p-6">
              {ventaSeleccionada.cliente && (
                <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-800">
                    {ventaSeleccionada.cliente.nombre}
                  </p>
                  <p className="text-xs text-gray-500">{ventaSeleccionada.cliente.whatsapp}</p>
                </div>
              )}
              <table className="w-full text-sm">
                <thead className="text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="text-left pb-2">Producto</th>
                    <th className="text-center pb-2">Cant.</th>
                    <th className="text-right pb-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ventaSeleccionada.detalle.map((d, i) => (
                    <tr key={i}>
                      <td className="py-2 text-gray-800">{d.nombre}</td>
                      <td className="py-2 text-center text-gray-500">{d.cantidad}</td>
                      <td className="py-2 text-right font-medium">${d.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <span className="font-medium text-gray-600">Total</span>
                <span className="text-xl font-bold text-gray-900">
                  ${ventaSeleccionada.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={() => setVentaSeleccionada(null)}
                className="w-full border rounded-xl py-2 text-sm font-medium hover:bg-gray-50 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pedidos;