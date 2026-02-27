// Tipos para el sistema de autenticación y roles

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'worker';
  workerId?: string; // Para vincular con el operario
  isActive: boolean;
  createdDate: string;
  lastLogin?: string;
  temporaryPassword?: boolean;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface WorkerUser extends User {
  role: 'worker';
  workerId: string;
  workerData: {
    firstName: string;
    lastName: string;
    dni: string;
    phone: string;
    crew: string;
    category: string;
  };
}