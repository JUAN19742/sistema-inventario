import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

const ReporteInventario = () => {
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarReporte = async () => {
      try {
        const { data } = await api.get('/reportes/inventario');
        setReporte(data);
      } catch {
        toast.error('Error al cargar reporte de inventario');
      } finally {
        setCargando(false);
      }
    };
    cargarReporte();
  }, []);

  const exportarPDF = () => {
    if (!reporte) return;
    const doc = new jsPDF();
    let y = 20;
    const margen = 20;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Inventario', margen, y);

    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, margen, y);

    y += 10;
    doc.setDrawColor(200);
    doc.line(margen, y, 190, y);

    y += 10;
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total de productos: ${reporte.totalProductos}`, margen, y);
    y += 8;
    doc.text(`Valor total del inventario: $${reporte.valorTotalInventario.toFixed(2)}`, margen, y);
    y += 8;
    doc.text(`Productos con stock bajo: ${reporte.productosStockBajo}`, margen, y);
    y += 8;
    doc.text(`Productos en oferta: ${reporte.productosEnOferta}`, margen, y);

    y += 10;
    doc.setDrawColor(200);
    doc.line(margen, y, 190, y);

    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Producto', margen, y);
    doc.text('Categoría', 75, y);
    doc.text('Stock', 115, y);
    doc.text('P. Compra', 135, y);
    doc.text('P. Venta', 160, y);
    doc.text('Valor', 182, y);

    y += 4;
    doc.line(margen, y, 190, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60);

    reporte.productos.forEach((p) => {
      y += 8;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const nombre = p.nombre.length > 22 ? p.nombre.substring(0, 22) + '...' : p.nombre;
      doc.text(nombre, margen, y);
      doc.text(p.categoria, 75, y);
      doc.text(String(p.stock), 115, y);
      doc.text(`$${p.precioCompra.toFixed(2)}`, 135, y);
      doc.text(`$${p.precioVenta.toFixed(2)}`, 160, y);
      doc.text(`$${p.valorStock.toFixed(2)}`, 182, y);
    });

    y += 10;
    doc.setDrawColor(200);
    doc.line(margen, y, 190, y);
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(`Valor total: $${reporte.valorTotalInventario.toFixed(2)}`, 135, y);

    doc.save(`reporte-inventario-${new Date().toLocaleDateString()}.pdf`);
  };

  if (cargando) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400">Cargando reporte...</p>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reporte de inventario</h2>
        <button
          onClick={exportarPDF}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
        >
          Exportar PDF
        </button>
      </div>

      {reporte && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow p-5">
              <p className="text-sm text-gray-500">Total productos</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{reporte.totalProductos}</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-5">
              <p className="text-sm text-gray-500">Valor del inventario</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ${reporte.valorTotalInventario.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow p-5">
              <p className="text-sm text-gray-500">Stock bajo</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{reporte.productosStockBajo}</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-5">
              <p className="text-sm text-gray-500">En oferta</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{reporte.productosEnOferta}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Producto</th>
                  <th className="px-4 py-3 text-left">Categoría</th>
                  <th className="px-4 py-3 text-left">Stock</th>
                  <th className="px-4 py-3 text-left">P. Compra</th>
                  <th className="px-4 py-3 text-left">P. Venta</th>
                  <th className="px-4 py-3 text-left">Valor stock</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reporte.productos.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.nombre}</td>
                    <td className="px-4 py-3 text-gray-500">{p.categoria}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.stockBajo
                          ? 'bg-red-100 text-red-600'
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {p.stock} uds
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">${p.precioCompra.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-500">${p.precioVenta.toFixed(2)}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      ${p.valorStock.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {p.stockBajo && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 w-fit">
                            Stock bajo
                          </span>
                        )}
                        {p.enOferta && p.descuento > 0 && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 w-fit">
                            -{p.descuento}% oferta
                          </span>
                        )}
                        {!p.stockBajo && (!p.enOferta || p.descuento === 0) && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 w-fit">
                            Normal
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ReporteInventario;