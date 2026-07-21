import { useEffect, useState } from 'react';
import api from '../api/axios';

const AlertasStock = () => {
  const [alertas, setAlertas] = useState({ total: 0, productos: [] });
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const cargarAlertas = async () => {
      try {
        const { data } = await api.get('/productos/alertas');
        setAlertas(data);
      } catch {
        console.error('Error al cargar alertas');
      }
    };
    cargarAlertas();
    const intervalo = setInterval(cargarAlertas, 60000);
    return () => clearInterval(intervalo);
  }, []);

  if (alertas.total === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setAbierto(!abierto)}
        className="relative flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-700 transition w-full"
      >
        <span>⚠️</span>
        <span>{alertas.total} stock bajo</span>
      </button>

      {abierto && (
        <div className="absolute left-0 bottom-10 w-64 bg-white rounded-xl shadow-xl border z-50">
          <div className="p-3 border-b">
            <h4 className="text-sm font-bold text-gray-800">Productos con stock bajo</h4>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {alertas.productos.map((p) => (
              <div key={p._id} className="p-3 border-b last:border-0">
                <p className="text-sm font-medium text-gray-800">{p.nombre}</p>
                <p className="text-xs text-gray-500">{p.categoria}</p>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-red-600 font-medium">
                    Stock: {p.stock}
                  </span>
                  <span className="text-xs text-gray-400">
                    Mínimo: {p.stockMinimo}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3">
            <button
              onClick={() => setAbierto(false)}
              className="w-full text-xs text-gray-500 hover:text-gray-800"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertasStock;