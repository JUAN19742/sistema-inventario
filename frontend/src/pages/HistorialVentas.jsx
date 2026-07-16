import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const HistorialVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    const cargarVentas = async () => {
      try {
        const params = {};
        if (fechaInicio) params.fechaInicio = fechaInicio;
        if (fechaFin) params.fechaFin = fechaFin;
        const { data } = await api.get('/ventas', { params });
        setVentas(data);
      } catch {
        toast.error('Error al cargar ventas');
      }
    };
    cargarVentas();
  }, [fechaInicio, fechaFin]);
  
  const cancelarVenta = async (id) => {
    if (!confirm('¿Seguro que deseas cancelar esta venta? El stock se restaurará automáticamente.')) return;
    try {
      await api.put(`/ventas/${id}/cancelar`);
      toast.success('Venta cancelada correctamente');
      setVentaSeleccionada(null);
      const { data } = await api.get('/ventas');
      setVentas(data);
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al cancelar venta');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Historial de ventas</h2>
        <div className="flex gap-2 items-center">
          <input
            type="date"
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
          <span className="text-gray-400 text-sm">a</span>
          <input
            type="date"
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
          {(fechaInicio || fechaFin) && (
            <button
              onClick={() => { setFechaInicio(''); setFechaFin(''); }}
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Folio</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Productos</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ventas.map((v) => (
              <tr key={v._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{v.folio}</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(v.createdAt).toLocaleDateString()}{' '}
                  {new Date(v.createdAt).toLocaleTimeString()}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {v.detalle.map((d) => `${d.cantidad}x ${d.nombre}`).join(', ')}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  ${v.total.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    v.estado === 'activa'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {v.estado}
                  </span>
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
            {ventas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No hay ventas registradas
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
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                ventaSeleccionada.estado === 'activa'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              }`}>
                {ventaSeleccionada.estado}
              </span>
            </div>

            <div className="p-6">
              <table className="w-full text-sm">
                <thead className="text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="text-left pb-2">Producto</th>
                    <th className="text-center pb-2">Cant.</th>
                    <th className="text-right pb-2">Precio</th>
                    <th className="text-right pb-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ventaSeleccionada.detalle.map((d, i) => (
                    <tr key={i}>
                      <td className="py-2 text-gray-800">{d.nombre}</td>
                      <td className="py-2 text-center text-gray-500">{d.cantidad}</td>
                      <td className="py-2 text-right text-gray-500">
                        ${d.precioUnitario.toFixed(2)}
                      </td>
                      <td className="py-2 text-right font-medium text-gray-800">
                        ${d.subtotal.toFixed(2)}
                      </td>
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

            <div className="px-6 pb-6 flex flex-col gap-2">
              {ventaSeleccionada.estado === 'activa' && (
                <button
                  onClick={() => cancelarVenta(ventaSeleccionada._id)}
                  className="w-full bg-red-600 text-white rounded-xl py-2 text-sm font-medium hover:bg-red-700 transition"
                >
                  Cancelar venta
                </button>
              )}
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

export default HistorialVentas;