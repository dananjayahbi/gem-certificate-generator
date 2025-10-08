'use client';

import { useState, useEffect } from 'react';
import { Save, Printer } from 'lucide-react';
import { fetchTemplates, type CertificateTemplate, type TemplateField } from '@/services/certificateTemplateService';
import { useToast } from '@/hooks/useToast';

export default function Page() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [formFields, setFormFields] = useState<TemplateField[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [recipientName, setRecipientName] = useState('');
  const [issuedTo, setIssuedTo] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await fetchTemplates();
      setTemplates(data.filter(t => t.isActive));
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({ title: 'Error', description: 'Failed to load templates', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setSelectedTemplate(template);
    
    // Filter fields to only include text and date fields (exclude signature and image)
    const inputFields = template.fields.filter(
      field => field.type === 'text' || field.type === 'date'
    );
    setFormFields(inputFields);
    
    // Initialize field values
    const initialValues: Record<string, string> = {};
    inputFields.forEach(field => {
      initialValues[field.id] = '';
    });
    setFieldValues(initialValues);
    setRecipientName('');
    setIssuedTo('');
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFieldValues({
      ...fieldValues,
      [fieldId]: value,
    });
  };

  const saveCertificate = async (shouldPrint: boolean = false) => {
    if (!selectedTemplate) {
      toast({ title: 'Error', description: 'Please select a template', variant: 'warning' });
      return;
    }

    if (!recipientName.trim()) {
      toast({ title: 'Error', description: 'Please enter recipient name', variant: 'warning' });
      return;
    }

    // Check if all required fields are filled
    const emptyFields = formFields.filter(field => !fieldValues[field.id]?.trim());
    if (emptyFields.length > 0) {
      toast({ 
        title: 'Missing fields', 
        description: `Please fill in: ${emptyFields.map(f => f.name).join(', ')}`, 
        variant: 'warning' 
      });
      return;
    }

    setLoading(true);
    try {
      // Save certificate to database
      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
        },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          recipientName: recipientName.trim(),
          issuedTo: issuedTo.trim() || null,
          fieldValues,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save certificate');
      }

      const data = await response.json();
      const certificateId = data.certificate.id;
      
      toast({ 
        title: 'Success', 
        description: 'Certificate saved successfully', 
        variant: 'success' 
      });

      // If shouldPrint is true, generate and download the PDF
      if (shouldPrint) {
        const pdfResponse = await fetch(`/api/certificates/${certificateId}/generate?format=pdf`);
        if (!pdfResponse.ok) {
          throw new Error('Failed to generate PDF');
        }
        
        const blob = await pdfResponse.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${data.certificate.certificateNumber || certificateId}.pdf`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
        
        toast({ 
          title: 'PDF Generated', 
          description: 'Certificate PDF downloaded', 
          variant: 'success' 
        });
      }

      // Reset form
      setRecipientName('');
      setIssuedTo('');
      const resetValues: Record<string, string> = {};
      formFields.forEach(field => {
        resetValues[field.id] = '';
      });
      setFieldValues(resetValues);
    } catch (error) {
      console.error('Error saving certificate:', error);
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to save certificate', 
        variant: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Issue Certificate</h1>
        <p className="text-gray-600 mt-2">Create and issue a new certificate</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Template <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTemplate?.id || ''}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">-- Select a template --</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTemplate && (
            <>
              {/* Recipient Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Enter recipient's full name"
                />
              </div>

              {/* Issued To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issued To
                </label>
                <input
                  type="text"
                  value={issuedTo}
                  onChange={(e) => setIssuedTo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Enter organization or person name (optional)"
                />
              </div>

              {/* Dynamic Form Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Certificate Fields
                </h3>
                {formFields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.name} <span className="text-red-500">*</span>
                    </label>
                    {field.type === 'date' ? (
                      <input
                        type="date"
                        value={fieldValues[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    ) : (
                      <input
                        type="text"
                        value={fieldValues[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder || `Enter ${field.name}`}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  onClick={() => saveCertificate(false)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  {loading ? 'Saving...' : 'Save Certificate'}
                </button>
                <button
                  onClick={() => saveCertificate(true)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Printer size={20} />
                  {loading ? 'Processing...' : 'Save & Print'}
                </button>
              </div>
            </>
          )}

          {!selectedTemplate && !loading && (
            <div className="text-center py-12 text-gray-500">
              <p>Please select a template to begin issuing a certificate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
