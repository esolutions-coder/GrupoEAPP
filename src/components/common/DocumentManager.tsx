import React, { useState, useEffect } from 'react';
import {
  Upload, File, FileText, Image, Download, Trash2, Eye, X,
  Plus, Search, Filter, Calendar, User
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Document, ModuleType } from '../../types/permissions';

interface DocumentManagerProps {
  module: ModuleType;
  entityId?: string;
  entityName?: string;
  allowUpload?: boolean;
  allowDelete?: boolean;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({
  module,
  entityId,
  entityName,
  allowUpload = true,
  allowDelete = true
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    document_type: 'contract',
    description: '',
    file: null as File | null
  });

  const documentTypes = [
    { id: 'contract', label: 'Contrato' },
    { id: 'certificate', label: 'Certificado' },
    { id: 'invoice', label: 'Factura' },
    { id: 'receipt', label: 'Recibo' },
    { id: 'report', label: 'Informe' },
    { id: 'photo', label: 'Fotografía' },
    { id: 'plan', label: 'Plano' },
    { id: 'other', label: 'Otro' }
  ];

  useEffect(() => {
    loadDocuments();
  }, [module, entityId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('documents')
        .select('*')
        .eq('module', module)
        .order('uploaded_at', { ascending: false });

      if (entityId) {
        query = query.eq('entity_id', entityId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadForm({ ...uploadForm, file: e.target.files[0] });
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file) {
      alert('Por favor selecciona un archivo');
      return;
    }

    try {
      setUploading(true);

      const fileExt = uploadForm.file.name.split('.').pop();
      const fileName = `${module}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const formData = new FormData();
      formData.append('file', uploadForm.file);

      const { error: insertError } = await supabase
        .from('documents')
        .insert([{
          module,
          entity_id: entityId || null,
          document_type: uploadForm.document_type,
          file_name: uploadForm.file.name,
          file_url: fileName,
          file_size: uploadForm.file.size,
          mime_type: uploadForm.file.type,
          description: uploadForm.description,
          uploaded_by: 'admin'
        }]);

      if (insertError) throw insertError;

      alert('Documento subido exitosamente');
      setShowUploadModal(false);
      resetUploadForm();
      loadDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Error al subir el documento');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('¿Estás seguro de eliminar este documento?')) return;

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      alert('Documento eliminado');
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error al eliminar el documento');
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      document_type: 'contract',
      description: '',
      file: null
    });
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <File className="h-8 w-8 text-gray-400" />;

    if (mimeType.includes('image')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    } else if (mimeType.includes('pdf')) {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return <FileText className="h-8 w-8 text-blue-600" />;
    } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      return <FileText className="h-8 w-8 text-green-600" />;
    }

    return <File className="h-8 w-8 text-gray-400" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchTerm ||
      doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || doc.document_type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Documentos</h3>
          {entityName && (
            <p className="text-sm text-gray-600">{entityName}</p>
          )}
        </div>
        {allowUpload && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
          >
            <Upload className="h-4 w-4" />
            <span>Subir Documento</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent text-sm"
        >
          <option value="all">Todos los tipos</option>
          {documentTypes.map(type => (
            <option key={type.id} value={type.id}>{type.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-corporate-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">Cargando documentos...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <File className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No hay documentos</p>
          {allowUpload && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-4 text-corporate-blue-600 hover:text-corporate-blue-700 text-sm font-medium"
            >
              Subir primer documento
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
              <div className="flex items-start justify-between mb-3">
                {getFileIcon(doc.mime_type)}
                <div className="flex space-x-1">
                  <button
                    onClick={() => window.open(doc.file_url, '_blank')}
                    className="text-gray-400 hover:text-corporate-blue-600"
                    title="Ver documento"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => window.open(doc.file_url, '_blank')}
                    className="text-gray-400 hover:text-green-600"
                    title="Descargar"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  {allowDelete && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-gray-400 hover:text-red-600"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <h4 className="font-medium text-gray-900 text-sm mb-1 truncate" title={doc.file_name}>
                {doc.file_name}
              </h4>

              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 mb-2">
                {documentTypes.find(t => t.id === doc.document_type)?.label || doc.document_type}
              </span>

              {doc.description && (
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {doc.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                <span>{formatFileSize(doc.file_size)}</span>
                <span>{new Date(doc.uploaded_at).toLocaleDateString('es-ES')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Subir Documento</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  resetUploadForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de documento *
                </label>
                <select
                  value={uploadForm.document_type}
                  onChange={(e) => setUploadForm({ ...uploadForm, document_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                >
                  {documentTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivo *
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                />
                {uploadForm.file && (
                  <p className="text-xs text-gray-600 mt-1">
                    {uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                  placeholder="Descripción del documento..."
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  resetUploadForm();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={uploading}
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !uploadForm.file}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  uploading || !uploadForm.file
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white'
                }`}
              >
                <Upload className="h-4 w-4" />
                <span>{uploading ? 'Subiendo...' : 'Subir Documento'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
