import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportData {
  title: string;
  headers: string[];
  data: any[][];
  filename: string;
}

export const exportToPDF = (exportData: ExportData) => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFontSize(16);
    doc.text(exportData.title, 14, 15);

    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, 14, 22);

    autoTable(doc, {
      head: [exportData.headers],
      body: exportData.data,
      startY: 28,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 28, right: 10, bottom: 10, left: 10 },
    });

    doc.save(`${exportData.filename}.pdf`);

    return { success: true, message: 'PDF generado correctamente' };
  } catch (error) {
    console.error('Error generando PDF:', error);
    return { success: false, message: 'Error al generar PDF' };
  }
};

export const exportToExcel = (exportData: ExportData) => {
  try {
    let csvContent = '\uFEFF';

    csvContent += exportData.headers.join(';') + '\n';

    exportData.data.forEach(row => {
      const formattedRow = row.map(cell => {
        const cellStr = String(cell ?? '');
        if (cellStr.includes(';') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      });
      csvContent += formattedRow.join(';') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${exportData.filename}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    return { success: true, message: 'Excel generado correctamente' };
  } catch (error) {
    console.error('Error generando Excel:', error);
    return { success: false, message: 'Error al generar Excel' };
  }
};

export const printTable = (exportData: ExportData) => {
  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('No se pudo abrir ventana de impresión');
    }

    const tableRows = exportData.data.map(row => `
      <tr>
        ${row.map(cell => `<td>${cell}</td>`).join('')}
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${exportData.title}</title>
          <style>
            @media print {
              @page { margin: 1cm; }
              body { margin: 0; }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              font-size: 10pt;
            }
            h1 {
              color: #1e40af;
              margin-bottom: 10px;
              font-size: 16pt;
            }
            .print-date {
              font-size: 9pt;
              color: #666;
              margin-bottom: 15px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 8pt;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 4px 6px;
              text-align: left;
              word-wrap: break-word;
            }
            th {
              background-color: #1e40af;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
          </style>
        </head>
        <body>
          <h1>${exportData.title}</h1>
          <div class="print-date">Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}</div>
          <table>
            <thead>
              <tr>
                ${exportData.headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);

    return { success: true, message: 'Impresión iniciada' };
  } catch (error) {
    console.error('Error imprimiendo:', error);
    return { success: false, message: 'Error al imprimir' };
  }
};

export interface ImportResult {
  success: boolean;
  data?: any[];
  errors?: string[];
  message: string;
}

export const parseExcelFile = (file: File): Promise<ImportResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
          resolve({
            success: false,
            message: 'El archivo debe contener al menos una fila de encabezados y una de datos',
            errors: ['Archivo vacío o incompleto']
          });
          return;
        }

        const headers = lines[0].split(/[;,\t]/).map(h => h.trim().replace(/^"|"$/g, ''));
        const data: any[] = [];
        const errors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = line.split(/[;,\t]/).map(v => v.trim().replace(/^"|"$/g, ''));

          if (values.length !== headers.length) {
            errors.push(`Línea ${i + 1}: Número incorrecto de columnas (esperadas ${headers.length}, encontradas ${values.length})`);
            continue;
          }

          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          data.push(row);
        }

        resolve({
          success: data.length > 0,
          data,
          errors: errors.length > 0 ? errors : undefined,
          message: data.length > 0
            ? `${data.length} registros importados correctamente${errors.length > 0 ? ` (${errors.length} errores)` : ''}`
            : 'No se pudieron importar registros'
        });
      } catch (error) {
        resolve({
          success: false,
          message: 'Error al procesar el archivo',
          errors: [error instanceof Error ? error.message : 'Error desconocido']
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        message: 'Error al leer el archivo',
        errors: ['No se pudo leer el archivo']
      });
    };

    reader.readAsText(file, 'UTF-8');
  });
};

export const formatDataForExport = (data: any[], type: string) => {
  switch (type) {
    case 'workers':
      return data.map(worker => [
        worker.workerCode || worker.id,
        `${worker.personalData?.firstName || worker.firstName || ''} ${worker.personalData?.lastName || worker.lastName || ''}`,
        worker.professionalData?.category || worker.category || worker.position,
        worker.personalData?.phone || worker.phone,
        worker.personalData?.email || worker.email,
        worker.contract?.hourlyRate || 'N/A',
        worker.status === 'active' ? 'Activo' : 'Inactivo',
        worker.contract?.hireDate ? new Date(worker.contract.hireDate).toLocaleDateString('es-ES') : 'N/A'
      ]);
    
    case 'clients':
      return data.map(client => [
        client.nombreComercial || client.name,
        client.cifNif || client.cif,
        client.personaContacto || client.contact,
        client.telefonoContacto || client.phone,
        client.emailContacto || client.email,
        client.proyectosActivos || client.activeProjects || 0,
        `€${(client.valorTotal || client.totalRevenue || 0).toLocaleString()}`,
        client.estadoCliente === 'activo' || client.status === 'active' ? 'Activo' : 'Inactivo'
      ]);
    
    case 'projects':
      return data.map(project => [
        project.name || project.title,
        project.clientName || project.client,
        project.responsible || project.projectManager,
        project.startDate ? new Date(project.startDate).toLocaleDateString('es-ES') : 'N/A',
        project.endDate ? new Date(project.endDate).toLocaleDateString('es-ES') : 'N/A',
        `€${(project.budget?.totalAmount || project.totalBudget || project.budget || 0).toLocaleString()}`,
        `${(project.analysis?.profitability || project.profitability || 0).toFixed(1)}%`,
        project.status === 'active' ? 'Activo' : project.status === 'completed' ? 'Completado' : 'Planificación'
      ]);
    
    case 'epis':
      return data.map(epi => [
        epi.workerName,
        epi.type?.name || epi.type,
        epi.brand,
        epi.model,
        epi.size,
        epi.deliveryDate ? new Date(epi.deliveryDate).toLocaleDateString('es-ES') : 'N/A',
        epi.expiryDate ? new Date(epi.expiryDate).toLocaleDateString('es-ES') : 'N/A',
        epi.status === 'active' ? 'Activo' : 'Inactivo',
        epi.condition === 'new' ? 'Nuevo' : epi.condition === 'good' ? 'Bueno' : 'Desgastado'
      ]);
    
    case 'crews':
      return data.map(crew => [
        crew.nombreCuadrilla || crew.name,
        crew.obraAsociada || crew.project,
        crew.responsable || crew.responsible,
        crew.miembros?.length || crew.members?.length || 0,
        `${crew.porcentajeDescuento || crew.discount || 0}%`,
        `€${(crew.totalValorGenerado || crew.totalValue || 0).toLocaleString()}`,
        `${crew.totalHorasProducidas || crew.totalHours || 0}h`,
        crew.activo || crew.active ? 'Activa' : 'Inactiva'
      ]);
    
    default:
      return data.map(item => Object.values(item));
  }
};

// Headers para cada tipo de exportación
export const getExportHeaders = (type: string) => {
  switch (type) {
    case 'workers':
      return ['Código', 'Nombre Completo', 'Categoría', 'Teléfono', 'Email', 'Tarifa/Hora', 'Estado', 'Fecha Alta'];
    
    case 'clients':
      return ['Nombre Comercial', 'CIF/NIF', 'Contacto', 'Teléfono', 'Email', 'Proyectos Activos', 'Valor Total', 'Estado'];
    
    case 'projects':
      return ['Nombre Proyecto', 'Cliente', 'Responsable', 'Fecha Inicio', 'Fecha Fin', 'Presupuesto', 'Rentabilidad', 'Estado'];
    
    case 'epis':
      return ['Operario', 'Tipo EPI', 'Marca', 'Modelo', 'Talla', 'Fecha Entrega', 'Fecha Caducidad', 'Estado', 'Condición'];
    
    case 'crews':
      return ['Cuadrilla', 'Obra', 'Responsable', 'Miembros', 'Descuento', 'Valor Generado', 'Horas Producidas', 'Estado'];
    
    default:
      return ['Datos'];
  }
};