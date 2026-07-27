import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

const ReporteVentas = () => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);

  const generarReporte = async () => {
    if (!fechaInicio || !fechaFin) {
      toast.error('Selecciona fecha inicio y fecha fin');
      return;
    }
    setCargando(true);
    try {
      const { data } = await api.get('/reportes/ventas', {
        params: { fechaInicio, fechaFin }
      });
      setReporte(data);
    } catch {
      toast.error('Error al generar reporte');
    } finally {
      setCargando(false);
    }
  };

  const exportarPDF = () => {
    if (!reporte) return;
    const doc = new jsPDF();
    let y = 20;
    const margen = 20;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Ventas', margen, y);

    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Período: ${fechaInicio} al ${fechaFin}`, margen, y);

    y += 10;
    doc.setDrawColor(200);
    doc.line(margen, y, 190, y);

    y += 10;
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total de ventas: ${reporte.totalVentas}`, margen, y);

    y += 8;
    doc.text(`Ingresos totales: $${reporte.ingresosTotales.toFixed(2)}`, margen, y);

    if (reporte.productoMasVendido) {
      y += 8;
      doc.text(`Producto más vendido: ${reporte.productoMasVendido.nombre} (${reporte.productoMasVendido.cantidad} uds)`, margen, y);
    }

    y += 10;
    doc.setDrawColor(200);
    doc.line(margen, y, 190, y);

    y += 10;
    doc.setFontSize(10);
    doc.text('Folio', margen, y);
    doc.text('Fecha', 60, y);
    doc.text('Cliente', 100, y);
    doc.text('Total', 165, y);

    y += 4;
    doc.line(margen, y, 190, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60);

    reporte.ventas.forEach((v) => {
      y += 8;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(v.folio, margen, y);
      doc.text(new Date(v.createdAt).toLocaleDateString(), 60, y);
      doc.text(v.cliente?.nombre || '—', 100, y);
      doc.text(`$${v.total.toFixed(2)}`, 165, y);
    });

    y += 10;
    doc.setDrawColor(200);
    doc.line(margen, y, 190, y);

    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(`Total: $${reporte.ingresosTotales.toFixed(2)}`, 135, y);

    doc.save(`reporte-ventas-${fechaInicio}-${fechaFin}.pdf`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reporte de ventas</h2>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h3 className="text-sm font-medium text-gray-600 mb-4">Selecciona el período</h3>
        <div className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Fecha inicio</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Fecha fin</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
          <button
            onClick={generarReporte}
            disabled={cargando}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
          >
            {cargando ? 'Generando...' : 'Generar reporte'}
          </button>
          {reporte && (
            <button
              onClick={exportarPDF}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
            >
              Exportar PDF
            </button>
          )}
        </div>
      </div>

      {reporte && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow p-5">
              <p className="text-sm text-gray-500">Total de ventas</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{reporte.totalVentas}</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-5">
              <p className="text-sm text-gray-500">Ingresos totales</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                ${reporte.ingresosTotales.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow p-5">
              <p className="text-sm text-gray-500">Producto más vendido</p>
              <p className="text-lg font-bold text-gray-800 mt-1">
                {reporte.productoMasVendido
                  ? `${reporte.productoMasVendido.nombre} (${reporte.productoMasVendido.cantidad} uds)`
                  : '—'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Folio</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left">Productos</th>
                  <th className="px-4 py-3 text-left">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reporte.ventas.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{v.folio}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {v.cliente?.nombre || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {v.detalle.map((d) => `${d.cantidad}x ${d.nombre}`).join(', ')}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      ${v.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {reporte.ventas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      No hay ventas en este período
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ReporteVentas;