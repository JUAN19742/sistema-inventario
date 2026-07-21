import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { usuario } = useAuth();
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarResumen = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setResumen(data);
      } catch {
        toast.error('Error al cargar el dashboard');
      } finally {
        setCargando(false);
      }
    };
    cargarResumen();
  }, []);

  if (cargando) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400">Cargando dashboard...</p>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">Bienvenido, {usuario?.nombre}</p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">Productos activos</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{resumen.totalProductos}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">Clientes registrados</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{resumen.totalClientes}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">Ventas hoy</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{resumen.totalVentasHoy}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">Ingresos hoy</p>
          <p className="text-3xl font-bold text-green-600 mt-1">${resumen.ingresosHoy.toFixed(2)}</p>
        </div>
      </div>

      {/* Alerta de stock bajo */}
      {resumen.productosStockBajo > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-medium text-red-700">
              {resumen.productosStockBajo} producto(s) con stock bajo
            </p>
            <p className="text-sm text-red-500">
              Revisa el inventario para reponer stock
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica de ventas últimos 7 días */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Ventas últimos 7 días</h3>
          <div className="flex items-end gap-2 h-40">
            {Object.entries(resumen.ventasPorDia).map(([dia, total]) => {
              const maxTotal = Math.max(...Object.values(resumen.ventasPorDia));
              const altura = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
              return (
                <div key={dia} className="flex flex-col items-center flex-1 gap-1">
                  <span className="text-xs text-gray-500">
                    {total > 0 ? `$${total.toFixed(0)}` : ''}
                  </span>
                  <div
                    className="w-full bg-gray-900 rounded-t-lg transition-all"
                    style={{ height: `${Math.max(altura, 4)}%` }}
                  />
                  <span className="text-xs text-gray-400 text-center leading-tight">{dia}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top productos más vendidos */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Productos más vendidos</h3>
          {resumen.topProductos.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay ventas registradas aún</p>
          ) : (
            <div className="flex flex-col gap-3">
              {resumen.topProductos.map((p, i) => {
                const max = resumen.topProductos[0].cantidad;
                const porcentaje = (p.cantidad / max) * 100;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-800">{p.nombre}</span>
                      <span className="text-gray-500">{p.cantidad} uds</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gray-900 h-2 rounded-full transition-all"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;