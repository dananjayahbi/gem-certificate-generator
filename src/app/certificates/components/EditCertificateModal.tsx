'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'date' | 'signature' | 'image';
}

interface Certificate {
  id: string;
  certificateNumber: string | null;
  recipientName: string;
  issuedTo: string | null;
  templateId: string;
  fieldValues: string;
}

interface EditCertificateModalProps {
  certificate: Certificate;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onToast: (options: { title: string; description: string; variant: 'success' | 'error' | 'info' }) => void;
}

export default function EditCertificateModal({
  certificate,
  isOpen,
  onClose,
  onSave,
  onToast,
}: EditCertificateModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [issuedTo, setIssuedTo] = useState<string>(certificate.issuedTo || '');

  useEffect(() => {
    if (isOpen) {
      loadTemplateAndValues();
    }
  }, [isOpen, certificate.id]);

  const loadTemplateAndValues = async () => {
    try {
      setLoading(true);

      // Fetch template structure
      const templateResponse = await fetch(`/api/templates/${certificate.templateId}`);
      if (!templateResponse.ok) throw new Error('Failed to load template');
      const templateData = await templateResponse.json();

      // Parse template fields
      const fields = typeof templateData.template.fields === 'string'
        ? JSON.parse(templateData.template.fields)
        : templateData.template.fields;

      setTemplateFields(fields);

      // Parse existing certificate field values
      const existingValues = typeof certificate.fieldValues === 'string'
        ? JSON.parse(certificate.fieldValues)
        : certificate.fieldValues;

      // Initialize field values (existing values + empty values for new fields)
      const initialValues: Record<string, string> = {};
      fields.forEach((field: TemplateField) => {
        initialValues[field.id] = existingValues[field.id] || '';
      });

      setFieldValues(initialValues);
    } catch (error) {
      console.error('Error loading template:', error);
      onToast({
        title: 'Error',
        description: 'Failed to load template structure',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch(`/api/certificates/${certificate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
        },
        body: JSON.stringify({
          issuedTo,
          fieldValues,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update certificate');
      }

      onToast({
        title: 'Success',
        description: 'Certificate updated successfully',
        variant: 'success',
      });

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error updating certificate:', error);
      onToast({
        title: 'Error',
        description: error.message || 'Failed to update certificate',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      style={{ backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Edit Certificate</h3>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading certificate data...</div>
        ) : (
          <>
            {/* Certificate Metadata */}
            <div className="space-y-4 mb-6 pb-6 border-b">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate ID
                </label>
                <input
                  type="text"
                  value={certificate.id}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issued To
                </label>
                <input
                  type="text"
                  value={issuedTo}
                  onChange={(e) => setIssuedTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Person or organization name"
                />
              </div>
            </div>

            {/* Template Fields */}
            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Certificate Fields
              </h4>

              {templateFields
                .filter((field) => field.type !== 'signature' && field.type !== 'image')
                .map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.name}
                      {field.type === 'date' && (
                        <span className="text-xs text-gray-500 ml-2">(Date field)</span>
                      )}
                    </label>
                    {field.type === 'date' ? (
                      <input
                        type="date"
                        value={fieldValues[field.id] || ''}
                        onChange={(e) =>
                          setFieldValues({ ...fieldValues, [field.id]: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={fieldValues[field.id] || ''}
                        onChange={(e) =>
                          setFieldValues({ ...fieldValues, [field.id]: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter ${field.name.toLowerCase()}`}
                      />
                    )}
                  </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
