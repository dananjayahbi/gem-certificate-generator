'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Save, X, Move, Type, Calendar, ImageIcon, Upload, Trash2 } from 'lucide-react';
import {
  type CertificateTemplate,
  type TemplateField,
  createTemplate,
  updateTemplate,
  fetchTemplates,
  uploadBackgroundImage,
  generateFieldId,
} from '@/services/certificateTemplateService';

export default function CertificateDesignerPage() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [templateWidth, setTemplateWidth] = useState(297);
  const [templateHeight, setTemplateHeight] = useState(210);
  const [fields, setFields] = useState<TemplateField[]>([]);
  
  const [scale, setScale] = useState(1);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, fieldX: 0, fieldY: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, corner: '' });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedFieldId) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          deleteField(selectedFieldId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFieldId]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await uploadBackgroundImage(file);
      setBackgroundImage(dataUrl);
      setTemplateWidth(297);
      setTemplateHeight(210);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedFieldId) return;
    try {
      const dataUrl = await uploadBackgroundImage(file);
      updateField(selectedFieldId, { signatureImageUrl: dataUrl });
    } catch (error) {
      console.error('Error uploading signature:', error);
    }
  };

  const addField = (type: TemplateField['type']) => {
    const newField: TemplateField = {
      id: generateFieldId(),
      name: `${type}_field_${fields.length + 1}`,
      type,
      x: 50,
      y: 50,
      width: type === 'signature' || type === 'image' ? 50 : 100,
      height: type === 'signature' || type === 'image' ? 25 : 20,
      fontSize: 16,
      fontFamily: 'TimesRoman',
      fontWeight: 'normal',
      color: '#000000',
      align: 'left',
      placeholder: `Enter ${type}`,
    };
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const updateField = (fieldId: string, updates: Partial<TemplateField>) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const deleteField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  };

  const mmToPx = (mm: number) => mm * 3.7795275591 * scale;
  const pxToMm = (px: number) => px * 0.264583 / scale;

  const handleFieldMouseDown = (e: React.MouseEvent, fieldId: string) => {
    if (isResizing) return;
    e.stopPropagation();
    setSelectedFieldId(fieldId);
    setIsDragging(true);
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      fieldX: field.x,
      fieldY: field.y,
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, fieldId: string, corner: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setSelectedFieldId(fieldId);
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: field.width || 50,
      height: field.height || 25,
      corner,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedFieldId && !isResizing) {
      const deltaX = pxToMm(e.clientX - dragStart.x);
      const deltaY = pxToMm(e.clientY - dragStart.y);
      updateField(selectedFieldId, {
        x: Math.max(0, Math.min(templateWidth, dragStart.fieldX + deltaX)),
        y: Math.max(0, Math.min(templateHeight, dragStart.fieldY + deltaY)),
      });
    } else if (isResizing && selectedFieldId) {
      const field = fields.find(f => f.id === selectedFieldId);
      if (!field) return;
      
      const deltaX = pxToMm(e.clientX - resizeStart.x);
      const deltaY = pxToMm(e.clientY - resizeStart.y);
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = field.x;
      let newY = field.y;

      if (resizeStart.corner.includes('e')) {
        newWidth = Math.max(10, resizeStart.width + deltaX);
      }
      if (resizeStart.corner.includes('w')) {
        newWidth = Math.max(10, resizeStart.width - deltaX);
        newX = field.x + (resizeStart.width - newWidth);
      }
      if (resizeStart.corner.includes('s')) {
        newHeight = Math.max(5, resizeStart.height + deltaY);
      }
      if (resizeStart.corner.includes('n')) {
        newHeight = Math.max(5, resizeStart.height - deltaY);
        newY = field.y + (resizeStart.height - newHeight);
      }

      updateField(selectedFieldId, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleSaveTemplate = async () => {
    if (!templateName || !backgroundImage) {
      alert('Please provide template name and background image');
      return;
    }
    
    setLoading(true);
    try {
      const templateData = {
        name: templateName,
        description: templateDescription,
        backgroundImageUrl: backgroundImage,
        width: templateWidth,
        height: templateHeight,
        fields,
      };

      if (isEditing && selectedTemplate) {
        await updateTemplate(selectedTemplate.id, templateData);
      } else {
        await createTemplate(templateData);
      }
      
      await loadTemplates();
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = (template: CertificateTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
    setTemplateName(template.name);
    setTemplateDescription(template.description || '');
    setBackgroundImage(template.backgroundImageUrl);
    setTemplateWidth(template.width);
    setTemplateHeight(template.height);
    setFields(template.fields);
    setSelectedFieldId(null);
  };

  const resetForm = () => {
    setSelectedTemplate(null);
    setIsEditing(false);
    setTemplateName('');
    setTemplateDescription('');
    setBackgroundImage('');
    setTemplateWidth(297);
    setTemplateHeight(210);
    setFields([]);
    setSelectedFieldId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Certificate Template Designer</h1>
        <p className="text-gray-600 mt-2">Create and customize certificate templates</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Templates</h2>
              <button
                onClick={resetForm}
                className="px-3 py-1 bg-amber-500 text-white rounded text-sm hover:bg-amber-600"
              >
                New
              </button>
            </div>
            <div className="space-y-2">
              {loading && <div className="text-sm text-gray-500">Loading...</div>}
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => loadTemplate(template)}
                  className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                    selectedTemplate?.id === template.id ? 'bg-amber-50 border border-amber-500' : ''
                  }`}
                >
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-gray-500">{template.fields.length} fields</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Canvas</h2>
              <div className="flex items-center gap-2">
                <label className="text-sm">Scale:</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm">{Math.round(scale * 100)}%</span>
              </div>
            </div>
            
            {!backgroundImage ? (
              <div className="flex flex-col items-center py-20 border-2 border-dashed border-gray-300 rounded">
                <ImageIcon size={48} className="text-gray-400 mb-4" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 flex items-center gap-2"
                >
                  <Upload size={20} />
                  Upload Background
                </button>
                <p className="text-xs text-gray-500 mt-2">Recommended: A4 size (297mm x 210mm)</p>
              </div>
            ) : (
              <div className="overflow-auto max-h-[600px]">
                <div
                  ref={canvasRef}
                  className="relative bg-white shadow-lg mx-auto"
                  style={{
                    width: mmToPx(templateWidth),
                    height: mmToPx(templateHeight),
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {fields.map((field) => {
                    const isSelected = selectedFieldId === field.id;
                    return (
                      <div
                        key={field.id}
                        onClick={() => setSelectedFieldId(field.id)}
                        onMouseDown={(e) => handleFieldMouseDown(e, field.id)}
                        className={`absolute group ${
                          isSelected ? 'ring-2 ring-amber-500 z-10' : 'border border-blue-300'
                        } ${!isResizing && !isDragging ? 'cursor-move' : ''}`}
                        style={{
                          left: mmToPx(field.x),
                          top: mmToPx(field.y),
                          width: mmToPx(field.width || 50),
                          height: mmToPx(field.height || 25),
                          backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        }}
                      >
                        {field.type === 'signature' && field.signatureImageUrl ? (
                          <img 
                            src={field.signatureImageUrl} 
                            className="w-full h-full object-contain pointer-events-none" 
                            alt="Signature" 
                          />
                        ) : field.type === 'image' && field.signatureImageUrl ? (
                          <img 
                            src={field.signatureImageUrl} 
                            className="w-full h-full object-contain pointer-events-none" 
                            alt="Image" 
                          />
                        ) : (
                          <div 
                            className="text-xs p-1 pointer-events-none flex items-center justify-center h-full"
                            style={{
                              fontSize: `${field.fontSize * scale}px`,
                              color: field.color,
                              fontWeight: field.fontWeight,
                            }}
                          >
                            {field.placeholder || field.name}
                          </div>
                        )}
                        
                        {isSelected && (
                          <>
                            <div
                              className="absolute w-2 h-2 bg-amber-500 rounded-full cursor-nw-resize -top-1 -left-1"
                              onMouseDown={(e) => handleResizeMouseDown(e, field.id, 'nw')}
                            />
                            <div
                              className="absolute w-2 h-2 bg-amber-500 rounded-full cursor-ne-resize -top-1 -right-1"
                              onMouseDown={(e) => handleResizeMouseDown(e, field.id, 'ne')}
                            />
                            <div
                              className="absolute w-2 h-2 bg-amber-500 rounded-full cursor-sw-resize -bottom-1 -left-1"
                              onMouseDown={(e) => handleResizeMouseDown(e, field.id, 'sw')}
                            />
                            <div
                              className="absolute w-2 h-2 bg-amber-500 rounded-full cursor-se-resize -bottom-1 -right-1"
                              onMouseDown={(e) => handleResizeMouseDown(e, field.id, 'se')}
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-3">
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <h2 className="font-semibold">Properties</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">Template Name</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="e.g., GIA Certificate"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
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
                  onChange={(e) => setTemplateWidth(Number(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Height (mm)</label>
                <input
                  type="number"
                  value={templateHeight}
                  onChange={(e) => setTemplateHeight(Number(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-2">Add Field</h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => addField('text')} 
                  className="px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 flex items-center gap-2"
                >
                  <Type size={16} />
                  Text
                </button>
                <button 
                  onClick={() => addField('date')} 
                  className="px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 flex items-center gap-2"
                >
                  <Calendar size={16} />
                  Date
                </button>
                <button 
                  onClick={() => addField('signature')} 
                  className="px-3 py-2 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 flex items-center gap-2"
                >
                  <Move size={16} />
                  Signature
                </button>
                <button 
                  onClick={() => addField('image')} 
                  className="px-3 py-2 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 flex items-center gap-2"
                >
                  <ImageIcon size={16} />
                  Image
                </button>
              </div>
            </div>

            {selectedFieldId && (() => {
              const field = fields.find(f => f.id === selectedFieldId);
              if (!field) return null;
              
              return (
                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Selected Field</h3>
                    <button
                      onClick={() => deleteField(selectedFieldId)}
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
                      value={field.name}
                      onChange={(e) => updateField(selectedFieldId, { name: e.target.value })}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">X (mm)</label>
                      <input
                        type="number"
                        value={Math.round(field.x * 10) / 10}
                        onChange={(e) => updateField(selectedFieldId, { x: Number(e.target.value) })}
                        className="w-full px-2 py-1 border rounded text-sm"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Y (mm)</label>
                      <input
                        type="number"
                        value={Math.round(field.y * 10) / 10}
                        onChange={(e) => updateField(selectedFieldId, { y: Number(e.target.value) })}
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
                        value={Math.round((field.width || 50) * 10) / 10}
                        onChange={(e) => updateField(selectedFieldId, { width: Number(e.target.value) })}
                        className="w-full px-2 py-1 border rounded text-sm"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Height (mm)</label>
                      <input
                        type="number"
                        value={Math.round((field.height || 25) * 10) / 10}
                        onChange={(e) => updateField(selectedFieldId, { height: Number(e.target.value) })}
                        className="w-full px-2 py-1 border rounded text-sm"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {field.type === 'text' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium mb-1">Font Size</label>
                        <input
                          type="number"
                          value={field.fontSize}
                          onChange={(e) => updateField(selectedFieldId, { fontSize: Number(e.target.value) })}
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">Color</label>
                        <input
                          type="color"
                          value={field.color}
                          onChange={(e) => updateField(selectedFieldId, { color: e.target.value })}
                          className="w-full h-8 border rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">Alignment</label>
                        <select
                          value={field.align}
                          onChange={(e) => updateField(selectedFieldId, { align: e.target.value as any })}
                          className="w-full px-2 py-1 border rounded text-sm"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </>
                  )}

                  {(field.type === 'signature' || field.type === 'image') && (
                    <div>
                      <label className="block text-xs font-medium mb-1">Upload Image</label>
                      {field.signatureImageUrl ? (
                        <div className="space-y-2">
                          <img 
                            src={field.signatureImageUrl} 
                            alt="Preview" 
                            className="w-full h-20 object-contain border rounded"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => signatureInputRef.current?.click()}
                              className="flex-1 px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm hover:bg-blue-100"
                            >
                              Change
                            </button>
                            <button
                              onClick={() => updateField(selectedFieldId, { signatureImageUrl: '' })}
                              className="flex-1 px-3 py-1 bg-red-50 text-red-700 rounded text-sm hover:bg-red-100"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => signatureInputRef.current?.click()}
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
                      value={field.placeholder}
                      onChange={(e) => updateField(selectedFieldId, { placeholder: e.target.value })}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>
                </div>
              );
            })()}

            <div className="border-t pt-4 flex gap-2">
              <button
                onClick={handleSaveTemplate}
                disabled={loading || !templateName || !backgroundImage}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {loading ? 'Saving...' : isEditing ? 'Update' : 'Save'}
              </button>
              {isEditing && (
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      <input ref={signatureInputRef} type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
    </div>
  );
}
