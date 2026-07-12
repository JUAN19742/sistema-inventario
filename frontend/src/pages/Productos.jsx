import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Plus } from 'lucide-react';
import ProductoModal from '../components/ProductoModal';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);

  const cargarProductos = async () => {
    try {
      const { data } = await api.get(`/productos?nombre=${busqueda}`);
      setProductos(data);
    } catch {
      toast.error('Error al cargar productos');
    }
  };

  useEffect(() => {
    cargarProductos();
  }, [busqueda]);

  const eliminarProducto = async (id) => {
    if (!confirm('¿Seguro que deseas desactivar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      toast.success('Producto desactivado');
      cargarProductos();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const abrirModal = (producto = null) => {
    setProductoEditar(producto);
    setModalAbierto(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Productos</h2>
        <button
          onClick={() => abrirModal()}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition"
        >
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar producto..."
        className="w-full border rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-gray-300"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Categoría</th>
              <th className="px-4 py-3 text-left">Precio venta</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {productos.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{p.nombre}</td>
                <td className="px-4 py-3 text-gray-500">{p.categoria}</td>
                <td className="px-4 py-3 text-gray-800">${p.precioVenta}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    p.stock <= p.stockMinimo
                      ? 'bg-red-100 text-red-600'
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {p.stock} uds
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => abrirModal(p)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => eliminarProducto(p._id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No hay productos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <ProductoModal
          producto={productoEditar}
          onClose={() => setModalAbierto(false)}
          onGuardado={() => { setModalAbierto(false); cargarProductos(); }}
        />
      )}
    </div>
  );
};

export default Productos;