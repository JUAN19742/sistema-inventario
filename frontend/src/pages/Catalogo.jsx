import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { IconPlus, IconMinus, IconX } from '../components/Icons';

const API_URL = 'http://localhost:5000/api';
const NUMERO_WHATSAPP = '59392247811'; // <-- cambia esto por tu número con código de país, sin + ni espacios

const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [categoria, setCategoria] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  useEffect(() => {
    const cargarCatalogo = async () => {
        try {
        const { data } = await axios.get(`${API_URL}/catalogo`, {
            params: categoria ? { categoria } : {},
        });
        setProductos(data);
        } catch {
        toast.error('Error al cargar el catálogo');
        }
    };
    cargarCatalogo();
    }, [categoria]);

  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item._id === producto._id);
      if (existe) {
        if (existe.cantidad >= producto.stock) {
          toast.error('No hay más stock disponible');
          return prev;
        }
        return prev.map((item) =>
          item._id === producto._id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
    toast.success('Agregado al carrito');
  };

  const cambiarCantidad = (id, delta) => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if (item._id !== id) return item;
          const nuevaCantidad = item.cantidad + delta;
          if (nuevaCantidad > item.stock) {
            toast.error('No hay más stock disponible');
            return item;
          }
          return { ...item, cantidad: nuevaCantidad };
        })
        .filter((item) => item.cantidad > 0)
    );
  };

  const quitarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((item) => item._id !== id));
  };

  const total = carrito.reduce((sum, item) => sum + item.precioVenta * item.cantidad, 0);
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  const categorias = [...new Set(productos.map((p) => p.categoria?.nombre).filter(Boolean))];

  const enviarPedidoWhatsApp = () => {
    if (carrito.length === 0) return;

    let mensaje = 'Hola! Me gustaría hacer el siguiente pedido:\n\n';
    carrito.forEach((item) => {
      mensaje += `- ${item.cantidad}x ${item.nombre} - $${(item.precioVenta * item.cantidad).toFixed(2)}\n`;
    });
    mensaje += `\nTotal estimado: $${total.toFixed(2)}`;

    const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white px-4 py-4 sticky top-0 z-30 flex justify-between items-center">
        <h1 className="text-lg font-bold">🛒 Mi Tienda</h1>
        <button
          onClick={() => setCarritoAbierto(true)}
          className="relative bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium"
        >
          Carrito
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
      </header>

      {/* Filtro de categorías */}
      {categorias.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-4 py-3 bg-white border-b">
          <button
            onClick={() => setCategoria('')}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
              categoria === '' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoria(cat)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                categoria === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid de productos */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {productos.map((p) => (
          <div key={p._id} className="bg-white rounded-2xl shadow overflow-hidden flex flex-col">
            <div className="bg-gray-100 aspect-square flex items-center justify-center">
              {p.imagen ? (
                <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-300 text-4xl">📦</span>
              )}
            </div>
            <div className="p-3 flex flex-col flex-1">
              <h3 className="font-medium text-gray-800 text-sm">{p.nombre}</h3>
              <p className="text-gray-400 text-xs mt-1 flex-1">{p.descripcion}</p>
              <div className="flex justify-between items-center mt-2">
                <div>
                  {p.enOferta && p.descuento > 0 ? (
                    <div className="flex flex-col">
                      <span className="text-gray-400 line-through text-xs">
                        ${p.precioVenta.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-green-600">
                          ${(p.precioVenta * (1 - p.descuento / 100)).toFixed(2)}
                        </span>
                        <span className="bg-red-100 text-red-600 text-xs font-medium px-1.5 py-0.5 rounded-full">
                          -{p.descuento}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="font-bold text-gray-900">${p.precioVenta}</span>
                  )}
                </div>
                <button
                  onClick={() => agregarAlCarrito(p)}
                  className="bg-gray-900 text-white p-1.5 rounded-lg hover:bg-gray-700 transition"
                >
                  <IconPlus />
                </button>
              </div>
            </div>
          </div>
        ))}
        {productos.length === 0 && (
          <p className="col-span-full text-center text-gray-400 py-12">
            No hay productos disponibles
          </p>
        )}
      </div>

      {/* Botón flotante de WhatsApp si hay items */}
      {totalItems > 0 && (
        <button
          onClick={() => setCarritoAbierto(true)}
          className="fixed bottom-4 left-4 right-4 bg-green-600 text-white py-3 rounded-xl font-medium shadow-lg flex justify-between items-center px-6 z-30"
        >
          <span>{totalItems} producto(s) en el carrito</span>
          <span>${total.toFixed(2)}</span>
        </button>
      )}

      {/* Drawer del carrito */}
      {carritoAbierto && (
        <div className="fixed inset-0 bg-black/50 z-40 flex justify-end">
          <div className="bg-white w-full max-w-sm h-full flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">Tu carrito</h2>
              <button onClick={() => setCarritoAbierto(false)} className="text-gray-400 hover:text-gray-600">
                <IconX />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {carrito.length === 0 && (
                <p className="text-center text-gray-400 py-12">Tu carrito está vacío</p>
              )}
              {carrito.map((item) => (
                <div key={item._id} className="flex justify-between items-center bg-gray-50 rounded-xl p-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{item.nombre}</p>
                    <p className="text-gray-500 text-xs">${item.precioVenta} c/u</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cambiarCantidad(item._id, -1)}
                      className="bg-gray-200 p-1 rounded-lg"
                    >
                      <IconMinus />
                    </button>
                    <span className="text-sm font-medium w-5 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => cambiarCantidad(item._id, 1)}
                      className="bg-gray-200 p-1 rounded-lg"
                    >
                      <IconPlus />
                    </button>
                  </div>
                  <button
                    onClick={() => quitarDelCarrito(item._id)}
                    className="ml-2 text-gray-400 hover:text-red-500"
                  >
                    <IconX />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 border-t">
              <div className="flex justify-between mb-3">
                <span className="text-gray-600">Total</span>
                <span className="font-bold text-gray-900 text-lg">${total.toFixed(2)}</span>
              </div>
              <button
                onClick={enviarPedidoWhatsApp}
                disabled={carrito.length === 0}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50"
              >
                Pedir por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalogo;