import { Plus, Trash2, Undo, Redo, Maximize2, Minimize2 } from 'lucide-react';
import type { CertificateTemplate } from '@/services/certificateTemplateService';

interface TemplateSelectorProps {
  templates: CertificateTemplate[];
  selectedTemplate: CertificateTemplate | null;
  onTemplateSelect: (template: CertificateTemplate) => void;
  onNewTemplate: () => void;
  onDeleteTemplate: (templateId: string, templateName: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isFullPageMode?: boolean;
  onToggleFullPage?: () => void;
}

export default function TemplateSelector({
  templates,
  selectedTemplate,
  onTemplateSelect,
  onNewTemplate,
  onDeleteTemplate,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isFullPageMode = false,
  onToggleFullPage,
}: TemplateSelectorProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certificate Template Designer</h1>
        </div>
        <div className="flex gap-2">
          {onToggleFullPage && (
            <button
              onClick={onToggleFullPage}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
              title={isFullPageMode ? "Exit Full Page Mode" : "Enter Full Page Mode"}
            >
              {isFullPageMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              {isFullPageMode ? 'Exit Full Page' : 'Full Page Mode'}
            </button>
          )}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Undo (Ctrl+Z)"
          >
            <Undo size={16} />
            Undo
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Redo (Ctrl+Y)"
          >
            <Redo size={16} />
            Redo
          </button>
        </div>
      </div>
      
      {/* Templates Dropdown Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Select Template</label>
            <select
              value={selectedTemplate?.id || ''}
              onChange={(e) => {
                const template = templates.find(t => t.id === e.target.value);
                if (template) onTemplateSelect(template);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">-- Select a template to edit --</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.fields.length} fields)
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 mt-6">
            <button
              onClick={onNewTemplate}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={16} />
              New Template
            </button>
            {selectedTemplate && (
              <button
                onClick={() => onDeleteTemplate(selectedTemplate.id, selectedTemplate.name)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 whitespace-nowrap"
                title="Delete selected template"
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
