import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { WorkReport, WorkReportDetail, Crew } from '../../types/workReports';
import { Project } from '../../types/projects';
import { Worker } from '../../types/construction';

interface WorkReportFormProps {
  report: WorkReport | null;
  projects: Project[];
  workers: Worker[];
  userName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface DetailRow {
  id: string;
  worker_id: string;
  hour_type: 'admin' | 'destajo' | 'extra';
  hours_worked: number;
  crew_id: string;
  observations: string;
}

const WorkReportForm: React.FC<WorkReportFormProps> = ({
  report,
  projects,
  workers,
  userName,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    project_id: report?.project_id || '',
    report_date: report?.report_date || new Date().toISOString().split('T')[0],
    manager: report?.manager || userName,
    activities: report?.activities || '',
    status: report?.status || 'draft',
    notes: report?.notes || ''
  });

  const [details, setDetails] = useState<DetailRow[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    loadCrews();
    if (report) {
      loadReportDetails();
    } else {
      addEmptyRow();
    }
  }, [report]);

  const loadCrews = async () => {
    const { data, error } = await supabase
      .from('crews')
      .select('*')
      .eq('status', 'active')
      .order('name');

    if (!error && data) {
      setCrews(data);
    }
  };

  const loadReportDetails = async () => {
    if (!report) return;

    const { data, error } = await supabase
      .from('work_report_details')
      .select('*')
      .eq('work_report_id', report.id);

    if (!error && data) {
      setDetails(data.map(d => ({
        id: d.id,
        worker_id: d.worker_id,
        hour_type: d.hour_type,
        hours_worked: d.hours_worked,
        crew_id: d.crew_id || '',
        observations: d.observations || ''
      })));
    }
  };

  const addEmptyRow = () => {
    setDetails([...details, {
      id: `new-${Date.now()}`,
      worker_id: '',
      hour_type: 'admin',
      hours_worked: 8,
      crew_id: '',
      observations: ''
    }]);
  };

  const removeRow = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof DetailRow, value: any) => {
    const updated = [...details];
    updated[index] = { ...updated[index], [field]: value };
    setDetails(updated);
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.project_id) newErrors.push('Debe seleccionar una obra');
    if (!formData.report_date) newErrors.push('Debe indicar la fecha');
    if (!formData.manager) newErrors.push('Debe indicar el responsable');
    if (!formData.activities) newErrors.push('Debe describir las actividades');

    const validDetails = details.filter(d => d.worker_id);
    if (validDetails.length === 0) {
      newErrors.push('Debe agregar al menos un operario');
    }

    validDetails.forEach((detail, index) => {
      if (!detail.worker_id) {
        newErrors.push(`Fila ${index + 1}: Debe seleccionar un operario`);
      }
      if (detail.hours_worked <= 0) {
        newErrors.push(`Fila ${index + 1}: Las horas deben ser mayores a 0`);
      }
    });

    const workerIds = validDetails.map(d => d.worker_id);
    const duplicates = workerIds.filter((id, index) => workerIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      newErrors.push('Hay operarios duplicados en el parte');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);

    try {
      let reportId = report?.id;

      if (report) {
        const { error: updateError } = await supabase
          .from('work_reports')
          .update({
            ...formData,
            updated_by: userName,
            updated_at: new Date().toISOString()
          })
          .eq('id', report.id);

        if (updateError) throw updateError;

        const { error: deleteError } = await supabase
          .from('work_report_details')
          .delete()
          .eq('work_report_id', report.id);

        if (deleteError) throw deleteError;
      } else {
        const { data: newReport, error: insertError } = await supabase
          .from('work_reports')
          .insert({
            ...formData,
            report_number: '',
            created_by: userName
          })
          .select()
          .single();

        if (insertError) throw insertError;
        reportId = newReport.id;
      }

      const validDetails = details.filter(d => d.worker_id);
      const detailsToInsert = validDetails.map(detail => ({
        work_report_id: reportId,
        worker_id: detail.worker_id,
        hour_type: detail.hour_type,
        hours_worked: detail.hours_worked,
        crew_id: detail.crew_id || null,
        observations: detail.observations || null
      }));

      if (detailsToInsert.length > 0) {
        const { error: detailsError } = await supabase
          .from('work_report_details')
          .insert(detailsToInsert);

        if (detailsError) throw detailsError;
      }

      onSuccess();
    } catch (error: any) {
      setErrors([error.message]);
    } finally {
      setIsSaving(false);
    }
  };

  const getWorkerName = (workerId: string) => {
    return workers.find(w => w.id === workerId)?.name || '';
  };

  const getTotalHours = () => {
    return details.reduce((sum, d) => sum + (d.hours_worked || 0), 0);
  };

  const getHoursByType = (type: string) => {
    return details
      .filter(d => d.hour_type === type)
      .reduce((sum, d) => sum + (d.hours_worked || 0), 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {report ? 'Editar Parte de Trabajo' : 'Nuevo Parte de Trabajo'}
          </h2>
          <button onClick={onCancel} className="text-white hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {errors.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-semibold text-red-800 mb-2">Errores en el formulario:</p>
              <ul className="list-disc list-inside text-red-700">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos de Cabecera</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Obra *
                </label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar obra</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={formData.report_date}
                  onChange={(e) => setFormData({ ...formData, report_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsable *
                </label>
                <input
                  type="text"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Borrador</option>
                  <option value="submitted">Enviado</option>
                  <option value="approved">Aprobado</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actividades *
                </label>
                <textarea
                  value={formData.activities}
                  onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Detalle de Operarios
              </h3>
              <button
                type="button"
                onClick={addEmptyRow}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Agregar Operario
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                      Operario *
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                      Tipo de Hora *
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                      Horas *
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                      Cuadrilla
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                      Observaciones
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {details.map((detail, index) => (
                    <tr key={detail.id}>
                      <td className="px-3 py-2">
                        <select
                          value={detail.worker_id}
                          onChange={(e) => updateRow(index, 'worker_id', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Seleccionar</option>
                          {workers.map(worker => (
                            <option key={worker.id} value={worker.id}>{worker.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={detail.hour_type}
                          onChange={(e) => updateRow(index, 'hour_type', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="admin">Admin</option>
                          <option value="destajo">Destajo</option>
                          <option value="extra">Extra</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={detail.hours_worked}
                          onChange={(e) => updateRow(index, 'hours_worked', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={detail.crew_id}
                          onChange={(e) => updateRow(index, 'crew_id', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Sin cuadrilla</option>
                          {crews.map(crew => (
                            <option key={crew.id} value={crew.id}>{crew.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={detail.observations}
                          onChange={(e) => updateRow(index, 'observations', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                          placeholder="Observaciones..."
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={2} className="px-3 py-2 text-right font-semibold text-gray-700">
                      Total Horas:
                    </td>
                    <td className="px-3 py-2 font-bold text-blue-600">
                      {getTotalHours().toFixed(2)}
                    </td>
                    <td colSpan={3} className="px-3 py-2 text-sm text-gray-600">
                      Admin: {getHoursByType('admin').toFixed(2)} |
                      Destajo: {getHoursByType('destajo').toFixed(2)} |
                      Extra: {getHoursByType('extra').toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </form>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Guardando...' : 'Guardar Parte'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkReportForm;
