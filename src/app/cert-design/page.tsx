'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Save, X, Move, Type, Calendar, ImageIcon, Upload, Trash2, Undo, Redo } from 'lucide-react';
import {
  type CertificateTemplate,
  type TemplateField,
  createTemplate,
  updateTemplate,
  fetchTemplates,
  uploadBackgroundImage,
  generateFieldId,
} from '@/services/certificateTemplateService';
import { useToast } from '@/hooks/useToast';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

export default function CertificateDesignerPage() {
  const { toast } = useToast();
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
  const [templateUuid, setTemplateUuid] = useState<string>(''); // UUID for the template folder
  
  const [scale, setScale] = useState(1);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, fieldX: 0, fieldY: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, fieldX: 0, fieldY: 0, corner: '' });
  
  // Canvas panning state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  // Undo/Redo history
  const [history, setHistory] = useState<TemplateField[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    templateId: string;
    templateName: string;
  }>({
    isOpen: false,
    templateId: '',
    templateName: '',
  });
  
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

  // Zoom with Ctrl+Wheel
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey && canvasContainerRef.current?.contains(e.target as Node)) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setScale(prevScale => Math.max(0.5, Math.min(3, prevScale + delta)));
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Canvas panning handlers
  const handleCanvasPanStart = (e: React.MouseEvent) => {
    if (e.ctrlKey && e.button === 2 && canvasContainerRef.current) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({
        x: e.clientX,
        y: e.clientY,
        scrollLeft: canvasContainerRef.current.scrollLeft,
        scrollTop: canvasContainerRef.current.scrollTop,
      });
    }
  };

  const handleCanvasPanMove = (e: React.MouseEvent) => {
    if (isPanning && canvasContainerRef.current) {
      e.preventDefault();
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      canvasContainerRef.current.scrollLeft = panStart.scrollLeft - dx;
      canvasContainerRef.current.scrollTop = panStart.scrollTop - dy;
    }
  };

  const handleCanvasPanEnd = () => {
    setIsPanning(false);
  };

  // Prevent context menu when Ctrl+Right-click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (e.ctrlKey && canvasContainerRef.current?.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const addToHistory = (newFields: TemplateField[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newFields)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setFields(JSON.parse(JSON.stringify(history[historyIndex - 1])));
      setSelectedFieldId(null);
      toast({ title: 'Undo', description: 'Action undone', variant: 'info', duration: 2000 });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setFields(JSON.parse(JSON.stringify(history[historyIndex + 1])));
      setSelectedFieldId(null);
      toast({ title: 'Redo', description: 'Action redone', variant: 'info', duration: 2000 });
    }
  };

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({ title: 'Error', description: 'Failed to load templates', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadBackgroundImage(file, templateUuid, 'background', backgroundImage || undefined);
      setBackgroundImage(result.filePath);
      setTemplateUuid(result.templateId); // Store the UUID for future uploads
      setTemplateWidth(297);
      setTemplateHeight(210);
      toast({ title: 'Success', description: 'Background image uploaded', variant: 'success' });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: 'Error', description: 'Failed to upload image', variant: 'error' });
    }
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedFieldId) return;
    try {
      const field = fields.find(f => f.id === selectedFieldId);
      const result = await uploadBackgroundImage(
        file, 
        templateUuid, 
        'signature', 
        field?.signatureImageUrl || undefined
      );
      const newFields = fields.map(f => 
        f.id === selectedFieldId ? { ...f, signatureImageUrl: result.filePath } : f
      );
      setFields(newFields);
      addToHistory(newFields);
      setTemplateUuid(result.templateId); // Store the UUID for future uploads
      toast({ title: 'Success', description: 'Image uploaded', variant: 'success' });
    } catch (error) {
      console.error('Error uploading signature:', error);
      toast({ title: 'Error', description: 'Failed to upload image', variant: 'error' });
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
    const newFields = [...fields, newField];
    setFields(newFields);
    addToHistory(newFields);
    setSelectedFieldId(newField.id);
  };

  const updateField = (fieldId: string, updates: Partial<TemplateField>) => {
    const newFields = fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    );
    setFields(newFields);
  };

  const updateFieldWithHistory = (fieldId: string, updates: Partial<TemplateField>) => {
    const newFields = fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    );
    setFields(newFields);
    addToHistory(newFields);
  };

  const deleteField = (fieldId: string) => {
    const newFields = fields.filter(field => field.id !== fieldId);
    setFields(newFields);
    addToHistory(newFields);
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
    toast({ title: 'Field deleted', description: 'Field removed from template', variant: 'info', duration: 2000 });
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
      fieldX: field.x,
      fieldY: field.y,
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
      const deltaX = pxToMm(e.clientX - resizeStart.x);
      const deltaY = pxToMm(e.clientY - resizeStart.y);
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = resizeStart.fieldX;
      let newY = resizeStart.fieldY;

      // Handle horizontal resizing
      if (resizeStart.corner.includes('e')) {
        // East side - expand right
        newWidth = Math.max(10, resizeStart.width + deltaX);
      } else if (resizeStart.corner.includes('w')) {
        // West side - expand left, need to move x position
        const widthChange = deltaX;
        newWidth = Math.max(10, resizeStart.width - widthChange);
        // Only move x if we're actually changing width
        if (newWidth > 10) {
          newX = resizeStart.fieldX + (resizeStart.width - newWidth);
        }
      }

      // Handle vertical resizing
      if (resizeStart.corner.includes('s')) {
        // South side - expand down
        newHeight = Math.max(5, resizeStart.height + deltaY);
      } else if (resizeStart.corner.includes('n')) {
        // North side - expand up, need to move y position
        const heightChange = deltaY;
        newHeight = Math.max(5, resizeStart.height - heightChange);
        // Only move y if we're actually changing height
        if (newHeight > 5) {
          newY = resizeStart.fieldY + (resizeStart.height - newHeight);
        }
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
    if ((isDragging || isResizing) && selectedFieldId) {
      addToHistory(fields);
    }
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleSaveTemplate = async () => {
    if (!templateName || !backgroundImage) {
      toast({ title: 'Missing information', description: 'Please provide template name and background image', variant: 'warning' });
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
        toast({ title: 'Template updated', description: `${templateName} has been updated successfully`, variant: 'success' });
      } else {
        await createTemplate(templateData);
        toast({ title: 'Template created', description: `${templateName} has been created successfully`, variant: 'success' });
      }
      
      await loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({ title: 'Error', description: 'Failed to save template', variant: 'error' });
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
    setHistory([template.fields]);
    setHistoryIndex(0);
    
    // Extract UUID from backgroundImageUrl (e.g., /certificate-templates/[uuid]/...)
    if (template.backgroundImageUrl) {
      const match = template.backgroundImageUrl.match(/\/certificate-templates\/([^\/]+)\//);
      if (match) {
        setTemplateUuid(match[1]);
      }
    }
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
    setHistory([]);
    setHistoryIndex(-1);
    setTemplateUuid(''); // Reset UUID for new template
  };

  const confirmDeleteTemplate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/templates/${deleteModal.templateId}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': 'admin',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      await loadTemplates();
      
      // If the deleted template was currently selected, reset the form
      if (selectedTemplate?.id === deleteModal.templateId) {
        resetForm();
      }
      
      toast({ 
        title: 'Template deleted', 
        description: `${deleteModal.templateName} has been deleted successfully`, 
        variant: 'success' 
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({ title: 'Error', description: 'Failed to delete template', variant: 'error' });
    } finally {
      setLoading(false);
      setDeleteModal({ isOpen: false, templateId: '', templateName: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, templateId: '', templateName: '' })}
        onConfirm={confirmDeleteTemplate}
        title="Delete Template"
        message={`Are you sure you want to delete "${deleteModal.templateName}"? This action cannot be undone.`}
        confirmText="confirm"
        requireTyping={true}
      />
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Certificate Template Designer</h1>
            <p className="text-gray-600 mt-2">Create and customize certificate templates</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="Undo (Ctrl+Z)"
            >
              <Undo size={16} />
              Undo
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
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
                  if (template) loadTemplate(template);
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
                onClick={resetForm}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={16} />
                New Template
              </button>
              {selectedTemplate && (
                <button
                  onClick={() => {
                    setDeleteModal({
                      isOpen: true,
                      templateId: selectedTemplate.id,
                      templateName: selectedTemplate.name,
                    });
                  }}
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

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-9">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
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
            
            {/* Canvas Controls Help */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>💡 Canvas Controls:</strong> 
                <span className="ml-2">
                  <kbd className="px-2 py-0.5 bg-white border border-blue-300 rounded text-xs">Ctrl</kbd> + 
                  <kbd className="px-2 py-0.5 bg-white border border-blue-300 rounded text-xs ml-1">Scroll</kbd> to zoom
                </span>
                <span className="mx-2">•</span>
                <span>
                  <kbd className="px-2 py-0.5 bg-white border border-blue-300 rounded text-xs">Ctrl</kbd> + 
                  <kbd className="px-2 py-0.5 bg-white border border-blue-300 rounded text-xs ml-1">Right-Click & Drag</kbd> to pan
                </span>
              </p>
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
              <div 
                ref={canvasContainerRef}
                className="overflow-auto max-h-[600px]"
                onMouseDown={handleCanvasPanStart}
                onMouseMove={handleCanvasPanMove}
                onMouseUp={handleCanvasPanEnd}
                onMouseLeave={handleCanvasPanEnd}
                style={{ cursor: isPanning ? 'grabbing' : 'default' }}
              >
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
                      onBlur={() => addToHistory(fields)}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">X (mm)</label>
                      <input
                        type="number"
                        value={Math.round(field.x * 10) / 10}
                        onChange={(e) => updateFieldWithHistory(selectedFieldId, { x: Number(e.target.value) })}
                        className="w-full px-2 py-1 border rounded text-sm"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Y (mm)</label>
                      <input
                        type="number"
                        value={Math.round(field.y * 10) / 10}
                        onChange={(e) => updateFieldWithHistory(selectedFieldId, { y: Number(e.target.value) })}
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
                        onChange={(e) => updateFieldWithHistory(selectedFieldId, { width: Number(e.target.value) })}
                        className="w-full px-2 py-1 border rounded text-sm"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Height (mm)</label>
                      <input
                        type="number"
                        value={Math.round((field.height || 25) * 10) / 10}
                        onChange={(e) => updateFieldWithHistory(selectedFieldId, { height: Number(e.target.value) })}
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
                          onChange={(e) => updateFieldWithHistory(selectedFieldId, { fontSize: Number(e.target.value) })}
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">Color</label>
                        <input
                          type="color"
                          value={field.color}
                          onChange={(e) => updateFieldWithHistory(selectedFieldId, { color: e.target.value })}
                          className="w-full h-8 border rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">Alignment</label>
                        <select
                          value={field.align}
                          onChange={(e) => updateFieldWithHistory(selectedFieldId, { align: e.target.value as any })}
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
                              onClick={() => updateFieldWithHistory(selectedFieldId, { signatureImageUrl: '' })}
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
                      onBlur={() => addToHistory(fields)}
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
