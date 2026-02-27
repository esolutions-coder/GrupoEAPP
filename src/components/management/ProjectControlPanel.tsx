import React from 'react';
import { TrendingUp, DollarSign, Wallet, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatUtils';

interface ProjectControlPanelProps {
  projectId: string;
  projectData: {
    // BLOQUE 1 - PRODUCCIÓN
    presupuestoAdjudicado: number;
    produccionEjecutada: number;
    porcentajeEjecucion: number;

    // BLOQUE 2 - FACTURACIÓN
    facturadoAcumulado: number;
    pendienteFacturar: number;
    retenciones: number;

    // BLOQUE 3 - COSTES
    costesReales: number;
    provisionCostes: number;
    costeEstimadoFinal: number;

    // BLOQUE 4 - MARGEN
    margenReal: number;
    margenPrevisto: number;
    porcentajeMargen: number;
  };
}

const ProjectControlPanel: React.FC<ProjectControlPanelProps> = ({ projectData }) => {
  const getMarginColor = (percentage: number) => {
    if (percentage > 15) return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-500' };
    if (percentage >= 5) return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: 'text-yellow-500' };
    return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-500' };
  };

  const getMarginIcon = (percentage: number) => {
    if (percentage > 15) return <CheckCircle className="w-8 h-8" />;
    if (percentage >= 5) return <AlertTriangle className="w-8 h-8" />;
    return <AlertTriangle className="w-8 h-8" />;
  };

  const marginColors = getMarginColor(projectData.porcentajeMargen);

  return (
    <div className="space-y-6">
      {/* BLOQUE 1 - PRODUCCIÓN */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Producción</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Presupuesto Adjudicado</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(projectData.presupuestoAdjudicado)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Producción Ejecutada</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(projectData.produccionEjecutada)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">% Ejecución</p>
            <p className="text-2xl font-bold text-blue-600">{projectData.porcentajeEjecucion.toFixed(1)}%</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(projectData.porcentajeEjecucion, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE 2 - FACTURACIÓN */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Facturación</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Facturado Acumulado</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(projectData.facturadoAcumulado)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Pendiente Facturar</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(projectData.pendienteFacturar)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Retenciones</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(projectData.retenciones)}</p>
          </div>
        </div>
      </div>

      {/* BLOQUE 3 - COSTES */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Wallet className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Costes</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Costes Reales Registrados</p>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(projectData.costesReales)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Provisiones de Costes</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(projectData.provisionCostes)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Coste Estimado Final</p>
            <p className="text-2xl font-bold text-purple-700">{formatCurrency(projectData.costeEstimadoFinal)}</p>
          </div>
        </div>
      </div>

      {/* BLOQUE 4 - MARGEN */}
      <div className={`rounded-lg shadow-sm border-2 p-6 ${marginColors.bg} ${marginColors.border}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg ${marginColors.icon}`}>
            {getMarginIcon(projectData.porcentajeMargen)}
          </div>
          <h3 className={`text-lg font-semibold ${marginColors.text}`}>Análisis de Margen</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className={`text-sm mb-1 ${marginColors.text}`}>Margen Real</p>
            <p className={`text-sm text-gray-600 mb-2`}>Facturado - Costes Reales</p>
            <p className={`text-2xl font-bold ${marginColors.text}`}>{formatCurrency(projectData.margenReal)}</p>
          </div>
          <div>
            <p className={`text-sm mb-1 ${marginColors.text}`}>Margen Previsto</p>
            <p className={`text-sm text-gray-600 mb-2`}>Producción Est. - Coste Est. Final</p>
            <p className={`text-2xl font-bold ${marginColors.text}`}>{formatCurrency(projectData.margenPrevisto)}</p>
          </div>
          <div>
            <p className={`text-sm mb-1 ${marginColors.text}`}>% Margen sobre Presupuesto</p>
            <p className={`text-sm text-gray-600 mb-2`}>
              {projectData.porcentajeMargen > 15 ? 'Óptimo' : projectData.porcentajeMargen >= 5 ? 'Aceptable' : 'Crítico'}
            </p>
            <p className={`text-3xl font-bold ${marginColors.text}`}>{projectData.porcentajeMargen.toFixed(2)}%</p>
          </div>
        </div>

        {/* Semáforo visual */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Óptimo (&gt; 15%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Aceptable (5-15%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Crítico (&lt; 5%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen Ejecutivo */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Ejecutivo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Ratio Facturación / Producción</p>
            <p className="text-xl font-bold text-gray-900">
              {projectData.produccionEjecutada > 0
                ? ((projectData.facturadoAcumulado / projectData.produccionEjecutada) * 100).toFixed(1)
                : '0.0'}%
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Ratio Costes / Presupuesto</p>
            <p className="text-xl font-bold text-gray-900">
              {projectData.presupuestoAdjudicado > 0
                ? ((projectData.costesReales / projectData.presupuestoAdjudicado) * 100).toFixed(1)
                : '0.0'}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectControlPanel;
