import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Building2, Shield, AlertCircle } from 'lucide-react';

interface WorkerLoginPageProps {
  onNavigate: (page: string) => void;
  onWorkerLogin: (workerId: string) => void;
}

const WorkerLoginPage: React.FC<WorkerLoginPageProps> = ({ onNavigate, onWorkerLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simular autenticación de operario
    setTimeout(() => {
      // Usuarios de prueba para operarios
      const workerUsers = [
        { username: 'juan.garcia', password: 'temp123', workerId: '1' },
        { username: 'maria.lopez', password: 'temp456', workerId: '2' }
      ];

      const user = workerUsers.find(u => 
        u.username === formData.username && u.password === formData.password
      );

      if (user) {
        onWorkerLogin(user.workerId);
      } else {
        setError('Usuario o contraseña incorrectos');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-corporate-blue-100 rounded-full flex items-center justify-center">
            <Building2 className="h-8 w-8 text-corporate-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-corporate-gray-900">
            Acceso Operarios
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Panel personal para operarios de Grupo EA
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-corporate-blue-500 focus:border-corporate-blue-500 focus:z-10"
                  placeholder="Tu usuario"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-corporate-blue-500 focus:border-corporate-blue-500 focus:z-10"
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-corporate-blue-500 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-corporate-blue-600 hover:bg-corporate-blue-700'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verificando...
                </div>
              ) : (
                'Acceder a Mi Panel'
              )}
            </button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">
              ¿Primera vez? Usa las credenciales enviadas a tu email
            </p>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="text-corporate-blue-600 hover:text-corporate-blue-700 text-sm font-medium"
            >
              ← Volver al sitio web
            </button>
          </div>
        </form>

        <div className="mt-8 bg-corporate-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-corporate-gray-900 mb-2 flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Usuarios de Prueba</span>
          </h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div>• Usuario: <strong>juan.garcia</strong> | Contraseña: <strong>temp123</strong></div>
            <div>• Usuario: <strong>maria.lopez</strong> | Contraseña: <strong>temp456</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerLoginPage;