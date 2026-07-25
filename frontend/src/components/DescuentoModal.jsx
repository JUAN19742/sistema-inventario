import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { IconX } from './Icons';

const DescuentoModal = ({ producto, onClose, onGuardado }) => {
  const [form, setForm] = useState({
    descuento: producto.descuento || 0,
    enOferta: producto.enOferta || false,
  });
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await api.put(`/productos/${producto._id}/descuento`, form);
      toast.success('Descuento actualizado');
      onGuardado();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al actualizar descuento');
    } finally {
      setCargando(false);
    }
  };

  const precioConDescuento = producto.precioVenta * (1 - form.descuento / 100);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Gestionar descuento</h3>
            <p className="text-sm text-gray-500 mt-1">{producto.nombre}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <IconX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Porcentaje de descuento (0-100%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={form.descuento}
              onChange={(e) => setForm({ ...form, descuento: Number(e.target.value) })}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enOferta"
              checked={form.enOferta}
              onChange={(e) => setForm({ ...form, enOferta: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="enOferta" className="text-sm text-gray-600">
              Activar oferta en el catálogo público
            </label>
          </div>

          {form.descuento > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Vista previa del precio:</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-gray-400 line-through text-sm">
                  ${producto.precioVenta.toFixed(2)}
                </span>
                <span className="text-green-600 font-bold text-lg">
                  ${precioConDescuento.toFixed(2)}
                </span>
                <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                  -{form.descuento}%
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="flex-1 bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
            >
              {cargando ? 'Guardando...' : 'Guardar descuento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DescuentoModal;