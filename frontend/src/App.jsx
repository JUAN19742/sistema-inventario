import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Inventario from './pages/Inventario';
import Catalogo from './pages/Catalogo';
import Ventas from './pages/Ventas';
import HistorialVentas from './pages/HistorialVentas';
import Clientes from './pages/Clientes';
import Pedidos from './pages/Pedidos';
import Usuarios from './pages/Usuarios';
import ReporteVentas from './pages/ReporteVentas';
import ReporteInventario from './pages/ReporteInventario';
import Categorias from './pages/Categorias';

const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-gray-100">
    <Navbar />
    <main className="flex-1 p-8">{children}</main>
  </div>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        }/>
        <Route path="/productos" element={
          <ProtectedRoute>
            <Layout><Productos /></Layout>
          </ProtectedRoute>
        }/>
        <Route path="/inventario" element={
          <ProtectedRoute>
            <Layout><Inventario /></Layout>
          </ProtectedRoute>
        }/>
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/ventas" element={
          <ProtectedRoute>
            <Layout><Ventas /></Layout>
          </ProtectedRoute>
        }/>
        <Route path="/historial-ventas" element={
          <ProtectedRoute>
            <Layout><HistorialVentas /></Layout>
          </ProtectedRoute>
        }/>
        <Route path="/clientes" element={
          <ProtectedRoute>
            <Layout><Clientes /></Layout>
          </ProtectedRoute>
        }/>
        <Route path="/pedidos" element={
          <ProtectedRoute>
            <Layout><Pedidos /></Layout>
          </ProtectedRoute>
        }/>
        <Route path="/usuarios" element={
          <ProtectedRoute>
            <Layout><Usuarios /></Layout>
          </ProtectedRoute>
        }/>
        <Route path="/reporte-ventas" element={
          <ProtectedRoute>
            <Layout><ReporteVentas /></Layout>
          </ProtectedRoute>
        }/>
        <Route path="/reporte-inventario" element={
          <ProtectedRoute>
            <Layout><ReporteInventario /></Layout>
          </ProtectedRoute>
        }/>
        <Route path="/categorias" element={
          <ProtectedRoute>
            <Layout><Categorias /></Layout>
          </ProtectedRoute>
        }/>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
