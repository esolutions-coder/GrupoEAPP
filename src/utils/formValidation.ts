// Utilidades para validación de formularios y protección anti-spam

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FormData {
  [key: string]: string | File | null;
}

// Validación de email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validación de teléfono español
export const validateSpanishPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+34|0034|34)?[6789]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Validación de código postal español
export const validateSpanishPostalCode = (postalCode: string): boolean => {
  const postalCodeRegex = /^[0-5]\d{4}$/;
  return postalCodeRegex.test(postalCode);
};

// Validación de archivos
export const validateFile = (file: File, allowedTypes: string[], maxSizeMB: number): ValidationResult => {
  const errors: string[] = [];
  
  // Verificar tipo de archivo
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!allowedTypes.includes(fileExtension)) {
    errors.push(`Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(', ')}`);
  }
  
  // Verificar tamaño
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    errors.push(`El archivo es demasiado grande. Máximo: ${maxSizeMB}MB`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Detección de spam básica
export const detectSpam = (text: string): boolean => {
  const spamKeywords = [
    'viagra', 'casino', 'lottery', 'winner', 'congratulations',
    'click here', 'free money', 'make money fast', 'work from home',
    'bitcoin', 'cryptocurrency', 'investment opportunity'
  ];
  
  const lowerText = text.toLowerCase();
  return spamKeywords.some(keyword => lowerText.includes(keyword));
};

// Validación de honeypot (campo oculto para detectar bots)
export const validateHoneypot = (honeypotValue: string): boolean => {
  return honeypotValue === '';
};

// Validación completa de formulario de contacto
export const validateContactForm = (formData: FormData): ValidationResult => {
  const errors: string[] = [];
  
  // Campos obligatorios
  if (!formData.name || (formData.name as string).trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }
  
  if (!formData.email || !validateEmail(formData.email as string)) {
    errors.push('Email inválido');
  }
  
  if (!formData.phone || !validateSpanishPhone(formData.phone as string)) {
    errors.push('Teléfono inválido (formato español)');
  }
  
  if (!formData.message || (formData.message as string).trim().length < 10) {
    errors.push('El mensaje debe tener al menos 10 caracteres');
  }
  
  // Detección de spam
  const messageText = (formData.message as string) || '';
  if (detectSpam(messageText)) {
    errors.push('Mensaje detectado como spam');
  }
  
  // Honeypot
  if (formData.honeypot && !validateHoneypot(formData.honeypot as string)) {
    errors.push('Formulario inválido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validación completa de formulario de empleo
export const validateJobApplicationForm = (formData: FormData, files: {[key: string]: File | null}): ValidationResult => {
  const errors: string[] = [];
  
  // Campos obligatorios
  if (!formData.firstName || (formData.firstName as string).trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }
  
  if (!formData.lastName || (formData.lastName as string).trim().length < 2) {
    errors.push('Los apellidos deben tener al menos 2 caracteres');
  }
  
  if (!formData.email || !validateEmail(formData.email as string)) {
    errors.push('Email inválido');
  }
  
  if (!formData.phone || !validateSpanishPhone(formData.phone as string)) {
    errors.push('Teléfono inválido (formato español)');
  }
  
  if (!formData.address || (formData.address as string).trim().length < 5) {
    errors.push('La dirección debe tener al menos 5 caracteres');
  }
  
  if (!formData.city || (formData.city as string).trim().length < 2) {
    errors.push('La ciudad es obligatoria');
  }
  
  if (!formData.postalCode || !validateSpanishPostalCode(formData.postalCode as string)) {
    errors.push('Código postal inválido (formato español)');
  }
  
  if (!formData.position) {
    errors.push('Debe seleccionar un puesto');
  }
  
  if (!formData.experience) {
    errors.push('Debe seleccionar años de experiencia');
  }
  
  if (!formData.availability) {
    errors.push('Debe seleccionar disponibilidad');
  }
  
  if (!formData.hasLicense) {
    errors.push('Debe indicar si tiene carnet de conducir');
  }
  
  if (!formData.hasVehicle) {
    errors.push('Debe indicar si tiene vehículo propio');
  }
  
  // Validación de archivos obligatorios
  if (!files.cv) {
    errors.push('El CV es obligatorio');
  } else {
    const cvValidation = validateFile(files.cv, ['.pdf', '.doc', '.docx'], 10);
    if (!cvValidation.isValid) {
      errors.push(...cvValidation.errors.map(err => `CV: ${err}`));
    }
  }
  
  if (!files.dni) {
    errors.push('El DNI/NIE es obligatorio');
  } else {
    const dniValidation = validateFile(files.dni, ['.pdf', '.jpg', '.jpeg', '.png'], 5);
    if (!dniValidation.isValid) {
      errors.push(...dniValidation.errors.map(err => `DNI/NIE: ${err}`));
    }
  }
  
  // Validación de archivos opcionales
  if (files.license) {
    const licenseValidation = validateFile(files.license, ['.pdf', '.jpg', '.jpeg', '.png'], 5);
    if (!licenseValidation.isValid) {
      errors.push(...licenseValidation.errors.map(err => `Carnet: ${err}`));
    }
  }
  
  if (files.certificates) {
    const certValidation = validateFile(files.certificates, ['.pdf', '.jpg', '.jpeg', '.png'], 10);
    if (!certValidation.isValid) {
      errors.push(...certValidation.errors.map(err => `Certificados: ${err}`));
    }
  }
  
  // Detección de spam en mensaje
  if (formData.message && detectSpam(formData.message as string)) {
    errors.push('Mensaje detectado como spam');
  }
  
  // Honeypot
  if (formData.honeypot && !validateHoneypot(formData.honeypot as string)) {
    errors.push('Formulario inválido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitización de texto para prevenir XSS
export const sanitizeText = (text: string): string => {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Rate limiting simple (lado cliente)
export const checkRateLimit = (key: string, maxAttempts: number, windowMs: number): boolean => {
  const now = Date.now();
  const attempts = JSON.parse(localStorage.getItem(`rateLimit_${key}`) || '[]');
  
  // Filtrar intentos dentro de la ventana de tiempo
  const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs);
  
  if (recentAttempts.length >= maxAttempts) {
    return false; // Rate limit excedido
  }
  
  // Agregar intento actual
  recentAttempts.push(now);
  localStorage.setItem(`rateLimit_${key}`, JSON.stringify(recentAttempts));
  
  return true; // Permitir envío
};