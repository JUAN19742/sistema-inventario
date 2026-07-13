import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { IconX } from './Icons';

const camposIniciales = {
  nombre: '', descripcion: '', categoria: '',
  precioCompra: '', precioVenta: '', stock: '', stockMinimo: 5, imagen: ''
};

const ProductoModal = ({ producto, onClose, onGuardado }) => {
  const [form, setForm] = useState(producto || camposIniciales);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      if (producto) {
        await api.put(`/productos/${producto._id}`, form);
        toast.success('Producto actualizado');
      } else {
        await api.post('/productos', form);
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
        required={name !== 'descripcion' && name !== 'imagen'}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
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
          {campo('Categoría', 'categoria')}
          {campo('Precio de compra', 'precioCompra', 'number')}
          {campo('Precio de venta', 'precioVenta', 'number')}
          {campo('Stock inicial', 'stock', 'number')}
          {campo('Stock mínimo', 'stockMinimo', 'number')}
          {campo('URL de imagen', 'imagen')}
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