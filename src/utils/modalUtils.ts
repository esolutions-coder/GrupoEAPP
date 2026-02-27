// Utilidades para modales y vistas previas

import React from 'react';

// Tipos para modales
export interface ModalConfig {
  title: string;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton: boolean;
  closeOnOverlayClick: boolean;
}

export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: 'danger' | 'warning' | 'info' | 'success';
}

// Configuraciones predefinidas para modales
export const modalConfigs = {
  view: {
    title: 'Ver Detalles',
    size: 'lg' as const,
    showCloseButton: true,
    closeOnOverlayClick: true
  },
  edit: {
    title: 'Editar',
    size: 'lg' as const,
    showCloseButton: true,
    closeOnOverlayClick: false
  },
  create: {
    title: 'Crear Nuevo',
    size: 'lg' as const,
    showCloseButton: true,
    closeOnOverlayClick: false
  },
  preview: {
    title: 'Vista Previa',
    size: 'xl' as const,
    showCloseButton: true,
    closeOnOverlayClick: true
  }
};

// Configuraciones para confirmaciones
export const confirmationConfigs = {
  delete: {
    title: 'Confirmar Eliminación',
    message: '¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    type: 'danger' as const
  },
  save: {
    title: 'Guardar Cambios',
    message: '¿Quieres guardar los cambios realizados?',
    confirmText: 'Guardar',
    cancelText: 'Cancelar',
    type: 'info' as const
  },
  cancel: {
    title: 'Cancelar Operación',
    message: 'Se perderán los cambios no guardados. ¿Continuar?',
    confirmText: 'Sí, cancelar',
    cancelText: 'Continuar editando',
    type: 'warning' as const
  }
};

// Función para mostrar confirmación
export const showConfirmation = (config: ConfirmationConfig): Promise<boolean> => {
  return new Promise((resolve) => {
    const confirmed = window.confirm(`${config.title}\n\n${config.message}`);
    resolve(confirmed);
  });
};

// Función para mostrar notificación de éxito
export const showSuccessNotification = (message: string) => {
  console.log('✅ Éxito:', message);
  
  // Crear notificación visual
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-2';
  notification.innerHTML = `
    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
};

// Función para mostrar notificación de error
export const showErrorNotification = (message: string) => {
  console.error('❌ Error:', message);
  
  // Crear notificación visual
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-2';
  notification.innerHTML = `
    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
};

// Función para mostrar notificación de información
export const showInfoNotification = (message: string) => {
  console.log('ℹ️ Info:', message);
  
  // Crear notificación visual
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-2';
  notification.innerHTML = `
    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 4000);
};

// Función para generar vista previa de datos
export const generateDataPreview = (data: any[], title: string) => {
  const preview = {
    title,
    totalRecords: data.length,
    sampleData: data.slice(0, 10),
    fields: Object.keys(data[0] || {}),
    generatedAt: new Date().toISOString(),
    summary: {
      firstRecord: data[0],
      lastRecord: data[data.length - 1]
    }
  };
  
  return preview;
};

// Función para validar formularios
export const validateForm = (formData: any, requiredFields: string[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  requiredFields.forEach(field => {
    if (!formData[field] || formData[field].toString().trim() === '') {
      errors.push(`El campo ${field} es obligatorio`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Función para formatear datos para vista previa
export const formatPreviewData = (data: any, type: string) => {
  switch (type) {
    case 'worker':
      return {
        'Código': data.workerCode || data.id,
        'Nombre': `${data.personalData?.firstName || data.firstName || ''} ${data.personalData?.lastName || data.lastName || ''}`,
        'Categoría': data.professionalData?.category || data.category,
        'Teléfono': data.personalData?.phone || data.phone,
        'Email': data.personalData?.email || data.email,
        'Estado': data.status === 'active' ? 'Activo' : 'Inactivo'
      };
    
    case 'client':
      return {
        'Nombre': data.nombreComercial || data.name,
        'CIF': data.cifNif || data.cif,
        'Contacto': data.personaContacto || data.contact,
        'Teléfono': data.telefonoContacto || data.phone,
        'Email': data.emailContacto || data.email,
        'Estado': data.estadoCliente === 'activo' || data.status === 'active' ? 'Activo' : 'Inactivo'
      };
    
    case 'project':
      return {
        'Nombre': data.name || data.title,
        'Cliente': data.clientName || data.client,
        'Responsable': data.responsible || data.projectManager,
        'Presupuesto': `€${(data.budget?.totalAmount || data.totalBudget || 0).toLocaleString()}`,
        'Estado': data.status === 'active' ? 'Activo' : 'Completado'
      };
    
    default:
      return data;
  }
};

// Función para sincronizar datos después de operaciones
export const syncData = async (operation: string, entityType: string, entityId: string, data?: any) => {
  try {
    console.log(`🔄 Sincronizando ${operation} en ${entityType}:`, entityId);
    
    // Simular llamada a API con delay realista
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // En una implementación real, aquí iría la llamada al backend
    const result = {
      success: true,
      operation,
      entityType,
      entityId,
      timestamp: new Date().toISOString(),
      data
    };
    
    console.log('✅ Sincronización completada:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
    throw error;
  }
};

// Función para manejar operaciones CRUD
export const handleCRUDOperation = async (
  operation: 'create' | 'read' | 'update' | 'delete',
  entityType: string,
  data?: any,
  entityId?: string
) => {
  try {
    console.log(`🔄 Ejecutando ${operation} en ${entityType}`);
    
    switch (operation) {
      case 'create':
        await syncData('create', entityType, 'new', data);
        showSuccessNotification(`${entityType} creado correctamente`);
        break;
      
      case 'update':
        await syncData('update', entityType, entityId || '', data);
        showSuccessNotification(`${entityType} actualizado correctamente`);
        break;
      
      case 'delete':
        const confirmed = await showConfirmation(confirmationConfigs.delete);
        if (confirmed) {
          await syncData('delete', entityType, entityId || '');
          showSuccessNotification(`${entityType} eliminado correctamente`);
          return true;
        }
        return false;
      
      case 'read':
        const preview = generateDataPreview([data], `Vista previa de ${entityType}`);
        console.log('👁️ Vista previa:', preview);
        showInfoNotification(`Visualizando ${entityType}`);
        return preview;
    }
    
    return true;
  } catch (error) {
    showErrorNotification(`Error en operación ${operation}: ${error}`);
    return false;
  }
};

// Función para mostrar loading state
export const showLoadingState = (message: string = 'Procesando...') => {
  const loader = document.createElement('div');
  loader.id = 'global-loader';
  loader.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
  loader.innerHTML = `
    <div class="bg-white rounded-lg p-6 flex items-center space-x-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="text-gray-900 font-medium">${message}</span>
    </div>
  `;
  
  document.body.appendChild(loader);
  
  return () => {
    const existingLoader = document.getElementById('global-loader');
    if (existingLoader) {
      existingLoader.remove();
    }
  };
};

// Función para ocultar loading state
export const hideLoadingState = () => {
  const loader = document.getElementById('global-loader');
  if (loader) {
    loader.remove();
  }
};

// Función para procesar operaciones con loading
export const processWithLoading = async (
  operation: () => Promise<any>,
  loadingMessage: string = 'Procesando...'
) => {
  const hideLoader = showLoadingState(loadingMessage);
  
  try {
    const result = await operation();
    hideLoader();
    return result;
  } catch (error) {
    hideLoader();
    showErrorNotification(`Error: ${error}`);
    throw error;
  }
};

// Función para manejar archivos
export const handleFileUpload = (file: File, allowedTypes: string[], maxSizeMB: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validar tipo
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      reject(`Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(', ')}`);
      return;
    }
    
    // Validar tamaño
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      reject(`El archivo es demasiado grande. Máximo: ${maxSizeMB}MB`);
      return;
    }
    
    // Simular upload
    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(() => {
        resolve(reader.result as string);
        showSuccessNotification('Archivo subido correctamente');
      }, 1000);
    };
    reader.onerror = () => reject('Error al leer el archivo');
    reader.readAsDataURL(file);
  });
};

// Función para descargar archivo
export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
  showSuccessNotification(`Archivo ${filename} descargado`);
};

// Función para copiar al portapapeles
export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    showSuccessNotification('Copiado al portapapeles');
  } catch (error) {
    // Fallback para navegadores sin soporte
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showSuccessNotification('Copiado al portapapeles');
  }
};

// Función para validar email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Función para validar teléfono español
export const validateSpanishPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+34|0034|34)?[6789]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Función para formatear fecha
export const formatDate = (date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('es-ES');
    case 'long':
      return dateObj.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    case 'time':
      return dateObj.toLocaleString('es-ES');
    default:
      return dateObj.toLocaleDateString('es-ES');
  }
};

// Función para formatear moneda
export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Función para calcular días entre fechas
export const calculateDaysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Función para generar ID único
export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Función para debounce
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Función para throttle
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};