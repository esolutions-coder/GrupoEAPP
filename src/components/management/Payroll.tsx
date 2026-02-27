import React from 'react';

const Payroll: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Gestión de Nóminas</h2>
        <p className="text-gray-600">
          Módulo de nóminas en desarrollo. Aquí podrás gestionar:
        </p>
        <ul className="mt-4 space-y-2 text-gray-600">
          <li>• Cálculo de nóminas</li>
          <li>• Gestión de horas trabajadas</li>
          <li>• Deducciones y bonificaciones</li>
          <li>• Historial salarial</li>
          <li>• Reportes fiscales</li>
        </ul>
      </div>
    </div>
  );
};

export default Payroll;