import jsPDF from 'jspdf';

const generarComprobante = (venta) => {
  const doc = new jsPDF();
  const margen = 20;
  let y = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Mi Tienda', margen, y);

  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Sistema de inventario y ventas', margen, y);

  // Línea separadora
  y += 8;
  doc.setDrawColor(200);
  doc.line(margen, y, 190, y);

  // Datos del comprobante
  y += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(`Comprobante de venta`, margen, y);

  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80);
  doc.text(`Folio: ${venta.folio}`, margen, y);

  y += 6;
  const fecha = new Date(venta.createdAt);
  doc.text(`Fecha: ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}`, margen, y);

  y += 6;
  doc.text(`Estado: ${venta.estado}`, margen, y);

  if (venta.cliente) {
    y += 6;
    doc.text(`Cliente: ${venta.cliente.nombre}`, margen, y);
    y += 6;
    doc.text(`WhatsApp: ${venta.cliente.whatsapp}`, margen, y);
  }

  // Línea separadora
  y += 10;
  doc.setDrawColor(200);
  doc.line(margen, y, 190, y);

  // Encabezados de tabla
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.text('Producto', margen, y);
  doc.text('Cant.', 110, y);
  doc.text('Precio', 135, y);
  doc.text('Subtotal', 165, y);

  // Línea bajo encabezados
  y += 4;
  doc.setDrawColor(200);
  doc.line(margen, y, 190, y);

  // Detalle de productos
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60);

  venta.detalle.forEach((item) => {
    y += 8;
    const nombre = item.nombre.length > 35
      ? item.nombre.substring(0, 35) + '...'
      : item.nombre;
    doc.text(nombre, margen, y);
    doc.text(String(item.cantidad), 113, y);
    doc.text(`$${item.precioUnitario.toFixed(2)}`, 135, y);
    doc.text(`$${item.subtotal.toFixed(2)}`, 165, y);
  });

  // Línea separadora final
  y += 8;
  doc.setDrawColor(200);
  doc.line(margen, y, 190, y);

  // Total
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(0);
  doc.text('Total:', 135, y);
  doc.text(`$${venta.total.toFixed(2)}`, 165, y);

  // Footer
  y += 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text('Gracias por su compra.', margen, y);
  y += 5;
  doc.text(`Generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, margen, y);

  // Descarga el PDF
  doc.save(`comprobante-${venta.folio}.pdf`);
};

export default generarComprobante;