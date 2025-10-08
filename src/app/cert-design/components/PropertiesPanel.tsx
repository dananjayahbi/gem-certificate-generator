import { RefObject } from 'react';
import { Type, Calendar, Move, ImageIcon, Upload, Trash2, Save } from 'lucide-react';
import type { TemplateField } from '@/services/certificateTemplateService';
import FontSelector from './FontSelector';
import { FontInfo } from '@/hooks/useFonts';

interface PropertiesPanelProps {
  templateName: string;
  templateDescription: string;
  templateWidth: number;
  templateHeight: number;
  fields: TemplateField[];
  selectedFieldId: string | null;
  loading: boolean;
  isEditing: boolean;
  signatureInputRef: RefObject<HTMLInputElement>;
  fonts: FontInfo[];
  fontsLoading: boolean;
  onTemplateNameChange: (name: string) => void;
  onTemplateDescriptionChange: (description: string) => void;
  onTemplateWidthChange: (width: number) => void;
  onTemplateHeightChange: (height: number) => void;
  onAddField: (type: TemplateField['type']) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<TemplateField>) => void;
  onFieldUpdateWithHistory: (fieldId: string, updates: Partial<TemplateField>) => void;
  onFieldDelete: (fieldId: string) => void;
  onHistoryAdd: (fields: TemplateField[]) => void;
  onSignatureUploadClick: () => void;
  onFontUpload: (file: File) => Promise<{ success: boolean; error?: string }>;
  onFontDelete: (fontName: string) => Promise<{ success: boolean; error?: string }>;
  onToast: (options: { title: string; description: string; variant: 'success' | 'error' | 'info' }) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function PropertiesPanel({
  templateName,
  templateDescription,
  templateWidth,
  templateHeight,
  fields,
  selectedFieldId,
  loading,
  isEditing,
  signatureInputRef,
  fonts,
  fontsLoading,
  onTemplateNameChange,
  onTemplateDescriptionChange,
  onTemplateWidthChange,
  onTemplateHeightChange,
  onAddField,
  onFieldUpdate,
  onFieldUpdateWithHistory,
  onFieldDelete,
  onHistoryAdd,
  onSignatureUploadClick,
  onFontUpload,
  onFontDelete,
  onToast,
  onSave,
  onCancel,
}: PropertiesPanelProps) {
  const selectedField = fields.find(f => f.id === selectedFieldId);

  return (
    <div className="col-span-3">
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <h2 className="font-semibold">Properties</h2>
        
        <div>
          <label className="block text-sm font-medium mb-1">Template Name</label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => onTemplateNameChange(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="e.g., GIA Certificate"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={templateDescription}
            onChange={(e) => onTemplateDescriptionChange(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            rows={2}
            placeholder="Template description..."
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium mb-1">Width (mm)</label>
            <input
              type="number"
              value={templateWidth}
              onChange={(e) => onTemplateWidthChange(Number(e.target.value))}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Height (mm)</label>
            <input
              type="number"
              value={templateHeight}
              onChange={(e) => onTemplateHeightChange(Number(e.target.value))}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold mb-2">Add Field</h3>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => onAddField('text')} 
              className="px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 flex items-center gap-2"
            >
              <Type size={16} />
              Text
            </button>
            <button 
              onClick={() => onAddField('date')} 
              className="px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 flex items-center gap-2"
            >
              <Calendar size={16} />
              Date
            </button>
            <button 
              onClick={() => onAddField('signature')} 
              className="px-3 py-2 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 flex items-center gap-2"
            >
              <Move size={16} />
              Signature
            </button>
            <button 
              onClick={() => onAddField('image')} 
              className="px-3 py-2 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 flex items-center gap-2"
            >
              <ImageIcon size={16} />
              Image
            </button>
          </div>
        </div>

        {selectedField && (
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Selected Field</h3>
              <button
                onClick={() => onFieldDelete(selectedFieldId!)}
                className="text-red-600 hover:text-red-700"
                title="Delete (or press Delete key)"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Field Name</label>
              <input
                type="text"
                value={selectedField.name}
                onChange={(e) => onFieldUpdate(selectedFieldId!, { name: e.target.value })}
                onBlur={() => onHistoryAdd(fields)}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-1">X (mm)</label>
                <input
                  type="number"
                  value={Math.round(selectedField.x * 10) / 10}
                  onChange={(e) => onFieldUpdateWithHistory(selectedFieldId!, { x: Number(e.target.value) })}
                  className="w-full px-2 py-1 border rounded text-sm"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Y (mm)</label>
                <input
                  type="number"
                  value={Math.round(selectedField.y * 10) / 10}
                  onChange={(e) => onFieldUpdateWithHistory(selectedFieldId!, { y: Number(e.target.value) })}
                  className="w-full px-2 py-1 border rounded text-sm"
                  step="0.1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-1">Width (mm)</label>
                <input
                  type="number"
                  value={Math.round((selectedField.width || 50) * 10) / 10}
                  onChange={(e) => onFieldUpdateWithHistory(selectedFieldId!, { width: Number(e.target.value) })}
                  className="w-full px-2 py-1 border rounded text-sm"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Height (mm)</label>
                <input
                  type="number"
                  value={Math.round((selectedField.height || 25) * 10) / 10}
                  onChange={(e) => onFieldUpdateWithHistory(selectedFieldId!, { height: Number(e.target.value) })}
                  className="w-full px-2 py-1 border rounded text-sm"
                  step="0.1"
                />
              </div>
            </div>

            {selectedField.type === 'text' && (
              <>
                <FontSelector
                  value={selectedField.fontFamily || 'TimesRoman'}
                  fonts={fonts}
                  loading={fontsLoading}
                  onChange={(fontName) => onFieldUpdateWithHistory(selectedFieldId!, { fontFamily: fontName })}
                  onUpload={onFontUpload}
                  onDelete={onFontDelete}
                  onToast={onToast}
                />

                <div>
                  <label className="block text-xs font-medium mb-1">Font Size</label>
                  <input
                    type="number"
                    value={selectedField.fontSize}
                    onChange={(e) => onFieldUpdateWithHistory(selectedFieldId!, { fontSize: Number(e.target.value) })}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Color</label>
                  <input
                    type="color"
                    value={selectedField.color}
                    onChange={(e) => onFieldUpdateWithHistory(selectedFieldId!, { color: e.target.value })}
                    className="w-full h-8 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Alignment</label>
                  <select
                    value={selectedField.align}
                    onChange={(e) => onFieldUpdateWithHistory(selectedFieldId!, { align: e.target.value as any })}
                    className="w-full px-2 py-1 border rounded text-sm"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </>
            )}

            {(selectedField.type === 'signature' || selectedField.type === 'image') && (
              <div>
                <label className="block text-xs font-medium mb-1">Upload Image</label>
                {selectedField.signatureImageUrl ? (
                  <div className="space-y-2">
                    <img 
                      src={selectedField.signatureImageUrl} 
                      alt="Preview" 
                      className="w-full h-20 object-contain border rounded"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={onSignatureUploadClick}
                        className="flex-1 px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm hover:bg-blue-100"
                      >
                        Change
                      </button>
                      <button
                        onClick={() => onFieldUpdateWithHistory(selectedFieldId!, { signatureImageUrl: '' })}
                        className="flex-1 px-3 py-1 bg-red-50 text-red-700 rounded text-sm hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={onSignatureUploadClick}
                    className="w-full px-3 py-2 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 flex items-center justify-center gap-2"
                  >
                    <Upload size={16} />
                    Upload Image
                  </button>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium mb-1">Placeholder</label>
              <input
                type="text"
                value={selectedField.placeholder}
                onChange={(e) => onFieldUpdate(selectedFieldId!, { placeholder: e.target.value })}
                onBlur={() => onHistoryAdd(fields)}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>
        )}

        <div className="border-t pt-4 flex gap-2">
          <button
            onClick={onSave}
            disabled={loading || !templateName}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {loading ? 'Saving...' : isEditing ? 'Update' : 'Save'}
          </button>
          {isEditing && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
