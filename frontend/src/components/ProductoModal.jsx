import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { IconX } from './Icons';

const camposIniciales = {
  nombre: '', descripcion: '', categoriaId: '',
  precioCompra: '', precioVenta: '', stock: '', stockMinimo: 5, imagen: ''
};

const ProductoModal = ({ producto, onClose, onGuardado }) => {
  const [form, setForm] = useState(producto
    ? { ...producto, categoriaId: producto.categoria?._id || '' }
    : camposIniciales
  );
  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [mostrarNuevaCategoria, setMostrarNuevaCategoria] = useState(false);
  const [preview, setPreview] = useState(producto?.imagen || '');
  const [cargando, setCargando] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const { data } = await api.get('/categorias');
        setCategorias(data);
      } catch {
        toast.error('Error al cargar categorías');
      }
    };
    cargarCategorias();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no debe superar 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setForm((prev) => ({ ...prev, imagen: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const agregarNuevaCategoria = async () => {
    if (!nuevaCategoria.trim()) return;
    try {
      const { data } = await api.post('/categorias', { nombre: nuevaCategoria });
      setCategorias((prev) => [...prev, data]);
      setForm((prev) => ({ ...prev, categoriaId: data._id }));
      setNuevaCategoria('');
      setMostrarNuevaCategoria(false);
      toast.success('Categoría agregada');
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al agregar categoría');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const { categoriaId, ...resto } = form;
      const body = categoriaId ? { ...resto, categoria: categoriaId } : resto;

      if (producto) {
        await api.put(`/productos/${producto._id}`, body);
        toast.success('Producto actualizado');
      } else {
        await api.post('/productos', body);
        toast.success('Producto creado');
      }
      onGuardado();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al guardar');
    } finally {
      setCargando(false);
    }
  };

  const campo = (label, name, type = 'text') => (
    <div>
      <label className="text-sm text-gray-600 mb-1 block">{label}</label>
      <input
        type={type}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        required={name !== 'descripcion'}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-bold text-gray-800">
            {producto ? 'Editar producto' : 'Nuevo producto'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <IconX />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {campo('Nombre', 'nombre')}
          {campo('Descripción', 'descripcion')}

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Categoría</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={form.categoriaId}
              onChange={(e) => {
                if (e.target.value === 'nueva') {
                  setMostrarNuevaCategoria(true);
                  setForm({ ...form, categoriaId: '' });
                } else {
                  setMostrarNuevaCategoria(false);
                  setForm({ ...form, categoriaId: e.target.value });
                }
              }}
              required
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((c) => (
                <option key={c._id} value={c._id}>{c.nombre}</option>
              ))}
              <option value="nueva">+ Agregar nueva categoría</option>
            </select>

            {mostrarNuevaCategoria && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Nombre de la categoría"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                />
                <button
                  type="button"
                  onClick={agregarNuevaCategoria}
                  className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition"
                >
                  Guardar
                </button>
              </div>
            )}
          </div>

          {campo('Precio de compra', 'precioCompra', 'number')}
          {campo('Precio de venta', 'precioVenta', 'number')}
          {campo('Stock inicial', 'stock', 'number')}
          {campo('Stock mínimo', 'stockMinimo', 'number')}

          {/* Imagen */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Imagen del producto</label>
            <div className="flex flex-col gap-3">
              {preview && (
                <div className="relative w-full h-40 bg-gray-100 rounded-xl overflow-hidden">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreview('');
                      setForm((prev) => ({ ...prev, imagen: '' }));
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition"
                  >
                    <IconX />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition"
              >
                {preview ? '🔄 Cambiar imagen' : '📷 Seleccionar imagen'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleImageChange}
              />
              <p className="text-xs text-gray-400">
                Formatos: JPG, PNG, WEBP. Máximo 2MB.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50 mt-2"
          >
            {cargando ? 'Guardando...' : 'Guardar producto'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductoModal;