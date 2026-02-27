import * as XLSX from 'xlsx';

export interface ExcelExportOptions {
  fileName: string;
  sheetName?: string;
  data: any[];
  columns?: { header: string; key: string; width?: number }[];
}

export interface ExcelImportResult<T> {
  success: boolean;
  data: T[];
  errors: string[];
  totalRows: number;
}

export const exportToExcel = (options: ExcelExportOptions): void => {
  try {
    const { fileName, sheetName = 'Datos', data, columns } = options;

    let exportData = data;

    if (columns && columns.length > 0) {
      exportData = data.map(row => {
        const formattedRow: any = {};
        columns.forEach(col => {
          formattedRow[col.header] = row[col.key] ?? '';
        });
        return formattedRow;
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    if (columns) {
      const colWidths = columns.map(col => ({
        wch: col.width || 15
      }));
      worksheet['!cols'] = colWidths;
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const fullFileName = `${fileName}_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, fullFileName);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Error al exportar a Excel');
  }
};

export const importFromExcel = async <T = any>(
  file: File,
  validateRow?: (row: any, rowNumber: number) => { valid: boolean; error?: string }
): Promise<ExcelImportResult<T>> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: ''
        });

        const errors: string[] = [];
        const validData: T[] = [];

        jsonData.forEach((row: any, index: number) => {
          if (validateRow) {
            const validation = validateRow(row, index + 2);
            if (validation.valid) {
              validData.push(row as T);
            } else {
              errors.push(`Fila ${index + 2}: ${validation.error}`);
            }
          } else {
            validData.push(row as T);
          }
        });

        resolve({
          success: errors.length === 0,
          data: validData,
          errors,
          totalRows: jsonData.length
        });
      } catch (error) {
        console.error('Error importing from Excel:', error);
        resolve({
          success: false,
          data: [],
          errors: ['Error al procesar el archivo Excel'],
          totalRows: 0
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: ['Error al leer el archivo'],
        totalRows: 0
      });
    };

    reader.readAsBinaryString(file);
  });
};

export const exportWorkerTemplate = (): void => {
  const templateData = [
    {
      'DNI': '12345678A',
      'Nombre Completo': 'Juan Pérez García',
      'Email': 'juan.perez@example.com',
      'Teléfono': '600123456',
      'Puesto': 'Oficial de Albañilería',
      'Fecha Contratación': '2024-01-15',
      'Salario Base': '1800',
      'Número SS': '123456789012',
      'Banco': 'Banco Santander',
      'IBAN': 'ES1234567890123456789012'
    }
  ];

  exportToExcel({
    fileName: 'plantilla_trabajadores',
    sheetName: 'Trabajadores',
    data: templateData
  });
};

export const exportProjectTemplate = (): void => {
  const templateData = [
    {
      'Código': 'PRJ-2024-001',
      'Nombre': 'Autopista A-7 Valencia',
      'Cliente': 'Ministerio de Fomento',
      'Fecha Inicio': '2024-01-01',
      'Fecha Fin': '2024-12-31',
      'Presupuesto': '500000',
      'Ubicación': 'Valencia',
      'Estado': 'En Progreso',
      'Descripción': 'Construcción tramo autopista'
    }
  ];

  exportToExcel({
    fileName: 'plantilla_proyectos',
    sheetName: 'Proyectos',
    data: templateData
  });
};

export const exportClientTemplate = (): void => {
  const templateData = [
    {
      'CIF/NIF': 'B12345678',
      'Nombre': 'Constructora ABC S.L.',
      'Email': 'contacto@constructora.com',
      'Teléfono': '912345678',
      'Dirección': 'Calle Principal 123',
      'Ciudad': 'Madrid',
      'Código Postal': '28001',
      'Tipo': 'Empresa',
      'Persona Contacto': 'María García',
      'Teléfono Contacto': '600987654'
    }
  ];

  exportToExcel({
    fileName: 'plantilla_clientes',
    sheetName: 'Clientes',
    data: templateData
  });
};

export const exportSupplierTemplate = (): void => {
  const templateData = [
    {
      'CIF': 'B87654321',
      'Nombre': 'Suministros Construcción S.L.',
      'Email': 'ventas@suministros.com',
      'Teléfono': '913456789',
      'Dirección': 'Polígono Industrial 45',
      'Ciudad': 'Madrid',
      'Código Postal': '28050',
      'Tipo': 'Materiales',
      'Días Pago': '30',
      'Banco': 'BBVA',
      'IBAN': 'ES9876543210987654321098'
    }
  ];

  exportToExcel({
    fileName: 'plantilla_proveedores',
    sheetName: 'Proveedores',
    data: templateData
  });
};

export const validateWorkerRow = (row: any, rowNumber: number): { valid: boolean; error?: string } => {
  if (!row['DNI']) {
    return { valid: false, error: 'DNI es obligatorio' };
  }
  if (!row['Nombre Completo']) {
    return { valid: false, error: 'Nombre completo es obligatorio' };
  }
  if (!row['Puesto']) {
    return { valid: false, error: 'Puesto es obligatorio' };
  }
  if (row['Email'] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row['Email'])) {
    return { valid: false, error: 'Email inválido' };
  }
  return { valid: true };
};

export const validateProjectRow = (row: any, rowNumber: number): { valid: boolean; error?: string } => {
  if (!row['Código']) {
    return { valid: false, error: 'Código es obligatorio' };
  }
  if (!row['Nombre']) {
    return { valid: false, error: 'Nombre es obligatorio' };
  }
  if (!row['Cliente']) {
    return { valid: false, error: 'Cliente es obligatorio' };
  }
  return { valid: true };
};

export const validateClientRow = (row: any, rowNumber: number): { valid: boolean; error?: string } => {
  if (!row['CIF/NIF']) {
    return { valid: false, error: 'CIF/NIF es obligatorio' };
  }
  if (!row['Nombre']) {
    return { valid: false, error: 'Nombre es obligatorio' };
  }
  if (row['Email'] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row['Email'])) {
    return { valid: false, error: 'Email inválido' };
  }
  return { valid: true };
};

export const validateSupplierRow = (row: any, rowNumber: number): { valid: boolean; error?: string } => {
  if (!row['CIF']) {
    return { valid: false, error: 'CIF es obligatorio' };
  }
  if (!row['Nombre']) {
    return { valid: false, error: 'Nombre es obligatorio' };
  }
  if (row['Email'] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row['Email'])) {
    return { valid: false, error: 'Email inválido' };
  }
  return { valid: true };
};

export const downloadExcelTemplate = (templateType: 'workers' | 'projects' | 'clients' | 'suppliers'): void => {
  switch (templateType) {
    case 'workers':
      exportWorkerTemplate();
      break;
    case 'projects':
      exportProjectTemplate();
      break;
    case 'clients':
      exportClientTemplate();
      break;
    case 'suppliers':
      exportSupplierTemplate();
      break;
    default:
      console.error('Tipo de plantilla no válido');
  }
};
