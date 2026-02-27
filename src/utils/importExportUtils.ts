import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import { showSuccessNotification, showErrorNotification } from './modalUtils';

interface ImportConfig {
  tableName: string;
  columnMapping: Record<string, string>;
  requiredFields?: string[];
  transformData?: (row: any) => any;
  onSuccess?: () => void;
}

export const handleImportFromExcel = async (
  file: File,
  config: ImportConfig
): Promise<void> => {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      showErrorNotification('El archivo Excel está vacío');
      return;
    }

    const itemsToImport = jsonData.map((row: any) => {
      const mappedRow: any = {};

      Object.entries(config.columnMapping).forEach(([excelColumn, dbColumn]) => {
        const value = row[excelColumn];
        if (value !== undefined && value !== null && value !== '') {
          mappedRow[dbColumn] = value;
        }
      });

      if (config.transformData) {
        return config.transformData(mappedRow);
      }

      return mappedRow;
    });

    if (config.requiredFields) {
      const missingFields = itemsToImport.some(item =>
        config.requiredFields!.some(field => !item[field])
      );

      if (missingFields) {
        showErrorNotification('Algunos registros tienen campos obligatorios vacíos');
        return;
      }
    }

    const { error } = await supabase
      .from(config.tableName)
      .insert(itemsToImport);

    if (error) throw error;

    showSuccessNotification(`${itemsToImport.length} registros importados correctamente`);

    if (config.onSuccess) {
      config.onSuccess();
    }
  } catch (error: any) {
    console.error(`Error importing to ${config.tableName}:`, error);
    showErrorNotification(error.message || 'Error al importar datos');
  }
};

interface ExportConfig {
  data: any[];
  columns: { header: string; key: string; format?: (value: any) => any }[];
  filename: string;
}

export const handleExportToExcel = (config: ExportConfig): void => {
  try {
    const exportData = config.data.map(item => {
      const row: any = {};
      config.columns.forEach(col => {
        const value = item[col.key];
        row[col.header] = col.format ? col.format(value) : value;
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    XLSX.writeFile(wb, `${config.filename}_${new Date().toISOString().split('T')[0]}.xlsx`);

    showSuccessNotification('Datos exportados correctamente');
  } catch (error: any) {
    console.error('Error exporting to Excel:', error);
    showErrorNotification(error.message || 'Error al exportar datos');
  }
};
