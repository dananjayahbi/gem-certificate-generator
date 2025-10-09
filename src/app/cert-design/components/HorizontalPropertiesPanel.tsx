import { RefObject } from 'react';
import { Type, Calendar, Move, ImageIcon, Upload, Trash2, Save, X } from 'lucide-react';
import type { TemplateField } from '@/services/certificateTemplateService';
import FontSelector from './FontSelector';
import { FontInfo } from '@/hooks/useFonts';

interface HorizontalPropertiesPanelProps {
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

export default function HorizontalPropertiesPanel({
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
}: HorizontalPropertiesPanelProps) {
  const selectedField = fields.find(f => f.id === selectedFieldId);

  return (
    <div className="p-4 space-y-3">
      {/* Row 1: Template Properties - Flex Grid */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium mb-1">Template Name</label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => onTemplateNameChange(e.target.value)}
            className="w-full px-2 py-1.5 border rounded text-sm"
            placeholder="e.g., GIA Certificate"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium mb-1">Description</label>
          <input
            type="text"
            value={templateDescription}
            onChange={(e) => onTemplateDescriptionChange(e.target.value)}
            className="w-full px-2 py-1.5 border rounded text-sm"
            placeholder="Template description..."
          />
        </div>
        <div className="min-w-[100px]">
          <label className="block text-xs font-medium mb-1">Width (mm)</label>
          <input
            type="number"
            value={templateWidth}
            onChange={(e) => onTemplateWidthChange(Number(e.target.value))}
            className="w-full px-2 py-1.5 border rounded text-sm"
          />
        </div>
        <div className="min-w-[100px]">
          <label className="block text-xs font-medium mb-1">Height (mm)</label>
          <input
            type="number"
            value={templateHeight}
            onChange={(e) => onTemplateHeightChange(Number(e.target.value))}
            className="w-full px-2 py-1.5 border rounded text-sm"
          />
        </div>
      </div>

      {/* Row 2: Field Controls - Flex Grid */}
      <div className="flex flex-wrap items-end gap-3 border-t pt-3">
        {/* Add Field Buttons */}
        <div className="flex-1 min-w-[400px]">
          <label className="block text-xs font-medium mb-1.5">Add Field</label>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => onAddField('text')} 
              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 flex items-center gap-1.5 text-sm"
            >
              <Type size={14} />
              Text
            </button>
            <button 
              onClick={() => onAddField('date')} 
              className="px-3 py-1.5 bg-green-50 text-green-700 rounded hover:bg-green-100 flex items-center gap-1.5 text-sm"
            >
              <Calendar size={14} />
              Date
            </button>
            <button 
              onClick={() => onAddField('signature')} 
              className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 flex items-center gap-1.5 text-sm"
            >
              <Move size={14} />
              Signature
            </button>
            <button 
              onClick={() => onAddField('image')} 
              className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 flex items-center gap-1.5 text-sm"
            >
              <ImageIcon size={14} />
              Image
            </button>
          </div>
        </div>

        {/* Save/Cancel Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onSave}
            disabled={loading || !templateName.trim()}
            className="px-4 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm whitespace-nowrap"
          >
            <Save size={14} />
            {loading ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center gap-2 text-sm whitespace-nowrap"
          >
            <X size={14} />
            Cancel
          </button>
        </div>
      </div>

      {/* Row 3: Selected Field Properties - Flex Grid (Conditional) */}
      {selectedField && (
        <div className="flex flex-wrap gap-2 border-t pt-3">
          <div className="min-w-[140px] flex-1">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium">Field Name</label>
              <button
                onClick={() => onFieldDelete(selectedFieldId!)}
                className="text-red-600 hover:text-red-700"
                title="Delete field"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <input
              type="text"
              value={selectedField.name}
              onChange={(e) => onFieldUpdate(selectedFieldId!, { name: e.target.value })}
              onBlur={() => onHistoryAdd(fields)}
              className="w-full px-2 py-1 border rounded text-xs"
            />
          </div>
          
          <div className="min-w-[70px]">
            <label className="block text-xs font-medium mb-1">X (mm)</label>
            <input
              type="number"
              value={Math.round(selectedField.x * 10) / 10}
              onChange={(e) => onFieldUpdateWithHistory(selectedFieldId!, { x: Number(e.target.value) })}
              className="w-full px-2 py-1 border rounded text-xs"
              step="0.1"
            />
          </div>
          
          <div className="min-w-[70px]">
            <label className="block text-xs font-medium mb-1">Y (mm)</label>
            <input
              type="number"
              value={Math.round(selectedField.y * 10) / 10}
              onChange={(e) => onFieldUpdateWithHistory(selectedFieldId!, { y: Number(e.target.value) })}
              className="w-full px-2 py-1 border rounded text-xs"
              step="0.1"
            />
          </div>
          
          <div className="min-w-[70px]">
            <label className="block text-xs font-medium mb-1">W (mm)</label>
            <input
              type="number"
              value={Math.round((selectedField.width || 50) * 10) / 10}
              onChange={(e) => onFieldUpdateWithHistory(selectedFieldId!, { width: Number(e.target.value) })}
              className="w-full px-2 py-1 border rounded text-xs"
              step="0.1"
            />
          </div>
          
          <div className="min-w-[70px]">
            <label className="block text-xs font-medium mb-1">H (mm)</label>
            <input
              type="number"
              value={Math.round((selectedField.height || 25) * 10) / 10}
              onChange={(e) => onFieldUpdateWithHistory(selectedFieldId!, { height: Number(e.target.value) })}
              className="w-full px-2 py-1 border rounded text-xs"
              step="0.1"
            />
          </div>

          {selectedField.type !== 'signature' && selectedField.type !== 'image' && (
            <>
              <div className="min-w-[140px]">
                <FontSelector
                  value={selectedField.fontFamily || 'TimesRoman'}
                  fonts={fonts}
                  loading={fontsLoading}
                  onChange={(fontName) => onFieldUpdateWithHistory(selectedFieldId!, { fontFamily: fontName })}
                  onUpload={onFontUpload}
                  onDelete={onFontDelete}
                  onToast={onToast}
                />
              </div>
              
              <div className="min-w-[80px]">
                <label className="block text-xs font-medium mb-1">Font Size</label>
                <input
                  type="number"
                  value={selectedField.fontSize || 16}
                  onChange={(e) => onFieldUpdateWithHistory(selectedFieldId!, { fontSize: Number(e.target.value) })}
                  className="w-full px-2 py-1 border rounded text-xs"
                />
              </div>
              
              <div className="min-w-[80px]">
                <label className="block text-xs font-medium mb-1">Weight</label>
                <select
                  value={selectedField.fontWeight || 'normal'}
                  onChange={(e) => onFieldUpdateWithHistory(selectedFieldId!, { fontWeight: e.target.value as any })}
                  className="w-full px-2 py-1 border rounded text-xs"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
              
              <div className="min-w-[70px]">
                <label className="block text-xs font-medium mb-1">Color</label>
                <input
                  type="color"
                  value={selectedField.color || '#000000'}
                  onChange={(e) => onFieldUpdateWithHistory(selectedFieldId!, { color: e.target.value })}
                  className="w-full h-7 border rounded cursor-pointer"
                />
              </div>
              
              <div className="min-w-[80px]">
                <label className="block text-xs font-medium mb-1">Align</label>
                <select
                  value={selectedField.align || 'left'}
                  onChange={(e) => onFieldUpdateWithHistory(selectedFieldId!, { align: e.target.value as any })}
                  className="w-full px-2 py-1 border rounded text-xs"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </>
          )}

          {(selectedField.type === 'signature' || selectedField.type === 'image') && (
            <div className="min-w-[140px]">
              <label className="block text-xs font-medium mb-1">Upload Image</label>
              <button
                onClick={onSignatureUploadClick}
                className="w-full px-3 py-1 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 flex items-center justify-center gap-1.5 text-xs"
              >
                <Upload size={12} />
                {selectedField.signatureImageUrl ? 'Change' : 'Upload'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
