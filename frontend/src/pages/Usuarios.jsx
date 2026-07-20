import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { IconPlus, IconTrash, IconX } from '../components/Icons';
import { useAuth } from '../context/AuthContext';

const Usuarios = () => {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'vendedor' });
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const { data } = await api.get('/usuarios');
        setUsuarios(data);
      } catch {
        toast.error('Error al cargar usuarios');
      }
    };
    cargarUsuarios();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await api.post('/usuarios', form);
      toast.success('Usuario creado');
      setModalAbierto(false);
      setForm({ nombre: '', email: '', password: '', rol: 'vendedor' });
      const { data } = await api.get('/usuarios');
      setUsuarios(data);
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al crear usuario');
    } finally {
      setCargando(false);
    }
  };

  const eliminarUsuario = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;
    try {
      await api.delete(`/usuarios/${id}`);
      toast.success('Usuario eliminado');
      const { data } = await api.get('/usuarios');
      setUsuarios(data);
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al eliminar usuario');
    }
  };

  if (usuario?.rol !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">No tienes permiso para ver esta sección.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Usuarios</h2>
        <button
          onClick={() => setModalAbierto(true)}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition"
        >
          <IconPlus /> Nuevo usuario
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Rol</th>
              <th className="px-4 py-3 text-left">Registrado</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usuarios.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{u.nombre}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    u.rol === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {u.rol}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {u.rol !== 'admin' && (
                    <button
                      onClick={() => eliminarUsuario(u._id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition"
                    >
                      <IconTrash />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No hay usuarios registrados
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
              <h3 className="text-lg font-bold text-gray-800">Nuevo usuario</h3>
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
                <label className="text-sm text-gray-600 mb-1 block">Email</label>
                <input
                  type="email"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Contraseña</label>
                <input
                  type="password"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Rol</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  value={form.rol}
                  onChange={(e) => setForm({ ...form, rol: e.target.value })}
                >
                  <option value="vendedor">Vendedor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={cargando}
                className="bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50 mt-2"
              >
                {cargando ? 'Creando...' : 'Crear usuario'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;