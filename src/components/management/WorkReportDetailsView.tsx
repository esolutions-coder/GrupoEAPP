import React, { useState, useEffect, useRef } from 'react';
import { X, Edit, Download, PenTool, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { WorkReport, WorkReportDetail, WorkReportSignature } from '../../types/workReports';
import { Project } from '../../types/projects';
import { Worker } from '../../types/construction';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface WorkReportDetailsViewProps {
  report: WorkReport;
  project?: Project;
  workers: Worker[];
  onClose: () => void;
  onEdit: () => void;
  onRefresh: () => void;
}

const WorkReportDetailsView: React.FC<WorkReportDetailsViewProps> = ({
  report,
  project,
  workers,
  onClose,
  onEdit,
  onRefresh
}) => {
  const [details, setDetails] = useState<WorkReportDetail[]>([]);
  const [signatures, setSignatures] = useState<WorkReportSignature[]>([]);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [signerRole, setSignerRole] = useState<'manager' | 'supervisor' | 'worker'>('manager');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadDetails();
    loadSignatures();
  }, [report.id]);

  const loadDetails = async () => {
    const { data, error } = await supabase
      .from('work_report_details')
      .select('*')
      .eq('work_report_id', report.id);

    if (!error && data) {
      setDetails(data);
    }
  };

  const loadSignatures = async () => {
    const { data, error } = await supabase
      .from('work_report_signatures')
      .select('*')
      .eq('work_report_id', report.id)
      .order('signed_at', { ascending: true });

    if (!error && data) {
      setSignatures(data);
    }
  };

  const getWorkerName = (workerId: string) => {
    return workers.find(w => w.id === workerId)?.name || 'N/A';
  };

  const getTotalHours = () => {
    return details.reduce((sum, d) => sum + parseFloat(d.hours_worked.toString()), 0);
  };

  const getHoursByType = (type: string) => {
    return details
      .filter(d => d.hour_type === type)
      .reduce((sum, d) => sum + parseFloat(d.hours_worked.toString()), 0);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = async () => {
    if (!signerName) {
      alert('Por favor, ingrese el nombre del firmante');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL('image/png');

    try {
      const { error } = await supabase
        .from('work_report_signatures')
        .insert({
          work_report_id: report.id,
          signer_name: signerName,
          signer_role: signerRole,
          signature_data: signatureData,
          ip_address: 'N/A',
          user_agent: navigator.userAgent
        });

      if (error) throw error;

      setShowSignatureModal(false);
      setSignerName('');
      clearSignature();
      loadSignatures();
      onRefresh();
    } catch (error: any) {
      alert('Error al guardar la firma: ' + error.message);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Parte de Trabajo', 105, 15, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Número: ${report.report_number}`, 20, 30);
    doc.text(`Fecha: ${new Date(report.report_date).toLocaleDateString('es-ES')}`, 20, 37);
    doc.text(`Proyecto: ${project?.name || 'N/A'}`, 20, 44);
    doc.text(`Responsable: ${report.manager}`, 20, 51);
    doc.text(`Estado: ${report.status}`, 20, 58);

    doc.text('Actividades:', 20, 68);
    const activityLines = doc.splitTextToSize(report.activities || '', 170);
    doc.text(activityLines, 20, 75);

    const tableData = details.map(detail => [
      getWorkerName(detail.worker_id),
      detail.hour_type,
      detail.hours_worked.toString(),
      detail.observations || ''
    ]);

    autoTable(doc, {
      startY: 90,
      head: [['Operario', 'Tipo Hora', 'Horas', 'Observaciones']],
      body: tableData,
      foot: [[
        'TOTAL',
        '',
        getTotalHours().toFixed(2),
        ''
      ]],
      theme: 'grid'
    });

    let yPos = (doc as any).lastAutoTable.finalY + 10;

    if (signatures.length > 0) {
      doc.text('Firmas:', 20, yPos);
      yPos += 7;

      signatures.forEach((sig, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${sig.signer_name} (${sig.signer_role})`, 20, yPos);
        doc.text(`Fecha: ${new Date(sig.signed_at).toLocaleString('es-ES')}`, 120, yPos);

        try {
          doc.addImage(sig.signature_data, 'PNG', 20, yPos + 2, 50, 20);
        } catch (e) {
          console.error('Error adding signature image', e);
        }

        yPos += 30;
      });
    }

    doc.save(`parte_trabajo_${report.report_number}.pdf`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md">
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-2xl font-bold">Detalle del Parte de Trabajo</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Información General</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Número:</span>
                  <span className="ml-2 font-semibold text-blue-600">{report.report_number}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Fecha:</span>
                  <span className="ml-2">{new Date(report.report_date).toLocaleDateString('es-ES')}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Proyecto:</span>
                  <span className="ml-2">{project?.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Responsable:</span>
                  <span className="ml-2">{report.manager}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Estado:</span>
                  <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {report.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Resumen de Horas</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Horas Admin:</span>
                  <span className="font-semibold">{getHoursByType('admin').toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Horas Destajo:</span>
                  <span className="font-semibold">{getHoursByType('destajo').toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Horas Extra:</span>
                  <span className="font-semibold">{getHoursByType('extra').toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="text-sm font-bold text-gray-900">Total Horas:</span>
                  <span className="font-bold text-blue-600">{getTotalHours().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Actividades</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{report.activities || 'Sin actividades registradas'}</p>
            </div>
          </div>

          {report.notes && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Observaciones</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{report.notes}</p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Detalle de Operarios</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Operario</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Tipo Hora</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Horas</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {details.map((detail) => (
                    <tr key={detail.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{getWorkerName(detail.worker_id)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          detail.hour_type === 'admin' ? 'bg-blue-100 text-blue-800' :
                          detail.hour_type === 'destajo' ? 'bg-green-100 text-green-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {detail.hour_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">{detail.hours_worked}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{detail.observations || '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-sm font-bold text-gray-900 text-right">Total:</td>
                    <td className="px-4 py-3 text-sm font-bold text-blue-600 text-right">{getTotalHours().toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">Firmas Digitales</h3>
              {!report.month_closed && (
                <button
                  onClick={() => setShowSignatureModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <PenTool className="w-4 h-4" />
                  Agregar Firma
                </button>
              )}
            </div>
            {signatures.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {signatures.map((sig) => (
                  <div key={sig.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{sig.signer_name}</p>
                        <p className="text-sm text-gray-600">{sig.signer_role}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(sig.signed_at).toLocaleString('es-ES')}
                        </p>
                        <img src={sig.signature_data} alt="Firma" className="mt-2 h-16 border border-gray-300 bg-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                No hay firmas registradas
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center rounded-b-lg border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Cerrar
          </button>
          <div className="flex gap-3">
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Download className="w-5 h-5" />
              Exportar PDF
            </button>
            {!report.month_closed && (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-5 h-5" />
                Editar
              </button>
            )}
          </div>
        </div>
      </div>

      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
              <h3 className="text-xl font-bold">Agregar Firma Digital</h3>
              <button onClick={() => setShowSignatureModal(false)} className="text-white hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Firmante</label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                <select
                  value={signerRole}
                  onChange={(e) => setSignerRole(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="manager">Responsable</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="worker">Operario</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Firma</label>
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="border-2 border-gray-300 rounded-lg cursor-crosshair w-full bg-white"
                  style={{ touchAction: 'none' }}
                />
              </div>
              <div className="flex justify-between">
                <button
                  onClick={clearSignature}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Limpiar
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSignatureModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveSignature}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Guardar Firma
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkReportDetailsView;
