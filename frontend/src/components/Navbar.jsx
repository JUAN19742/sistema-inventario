import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconDashboard, IconPackage, IconLogOut, IconBoxes, IconSales } from './Icons';

const Navbar = () => {
  const { usuario, logout } = useAuth();

  return (
    <nav className="bg-gray-900 text-white w-64 min-h-screen flex flex-col p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">🛒 Mi Tienda</h1>
        <p className="text-gray-400 text-sm mt-1">Hola, {usuario?.nombre}</p>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition"
        >
          <IconDashboard />
          Dashboard
        </Link>
        <Link
          to="/productos"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition"
        >
          <IconPackage />
          Productos
        </Link>
        <Link
          to="/inventario"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition"
        >
          <IconBoxes />
          Inventario
        </Link>
        <Link
          to="/ventas"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition"
        >
          <IconSales />
          Ventas
        </Link>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-700 transition text-red-400 hover:text-white mt-auto"
      >
        <IconLogOut />
        Cerrar sesión
      </button>
    </nav>
  );
};

export default Navbar;