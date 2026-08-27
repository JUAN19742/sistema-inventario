import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { IconEdit, IconTrash, IconPlus } from '../components/Icons';

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [nombreEditado, setNombreEditado] = useState('');

  const cargarCategorias = async () => {
    try {
      const { data } = await api.get('/categorias');
      setCategorias(data);
    } catch {
      toast.error('Error al cargar categorías');
    } finally {
      setCargando(false);
    }
  };
  
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { cargarCategorias(); }, []);

  const crearCategoria = async (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    try {
      await api.post('/categorias', { nombre: nuevoNombre });
      toast.success('Categoría creada');
      setNuevoNombre('');
      cargarCategorias();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al crear categoría');
    }
  };

  const guardarEdicion = async (id) => {
    if (!nombreEditado.trim()) return;
    try {
      await api.put(`/categorias/${id}`, { nombre: nombreEditado });
      toast.success('Categoría actualizada');
      setEditandoId(null);
      cargarCategorias();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al actualizar categoría');
    }
  };

  const eliminarCategoria = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await api.delete(`/categorias/${id}`);
      toast.success('Categoría eliminada');
      cargarCategorias();
    } catch {
      toast.error('Error al eliminar categoría');
    }
  };

  if (cargando) return <div className="p-6 text-gray-400">Cargando...</div>;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Categorías</h1>

      <form onSubmit={crearCategoria} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Nueva categoría..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
        />
        <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition flex items-center gap-1">
          <IconPlus /> Agregar
        </button>
      </form>

      <div className="bg-white rounded-2xl shadow divide-y">
        {categorias.map((cat) => (
          <div key={cat._id} className="flex items-center justify-between p-4">
            {editandoId === cat._id ? (
              <input
                type="text"
                className="flex-1 border rounded-lg px-3 py-1.5 text-sm mr-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                value={nombreEditado}
                onChange={(e) => setNombreEditado(e.target.value)}
                autoFocus
              />
            ) : (
              <span className="text-gray-700 text-sm">{cat.nombre}</span>
            )}
            <div className="flex gap-3">
              {editandoId === cat._id ? (
                <>
                  <button onClick={() => guardarEdicion(cat._id)} className="text-sm text-green-600 hover:text-green-700 font-medium">Guardar</button>
                  <button onClick={() => setEditandoId(null)} className="text-sm text-gray-400 hover:text-gray-600">Cancelar</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setEditandoId(cat._id); setNombreEditado(cat.nombre); }} className="text-gray-400 hover:text-gray-700">
                    <IconEdit />
                  </button>
                  <button onClick={() => eliminarCategoria(cat._id)} className="text-gray-400 hover:text-red-500">
                    <IconTrash />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {categorias.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">No hay categorías todavía</p>
        )}
      </div>
    </div>
  );
};

export default Categorias;