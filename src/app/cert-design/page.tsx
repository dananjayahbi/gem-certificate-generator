'use client';

import { useState, useRef, useEffect } from 'react';
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
import TemplateSelector from './components/TemplateSelector';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import { mmToPx, pxToMm } from './utils/conversions';

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

  const convertMmToPx = (mm: number) => mmToPx(mm, scale);
  const convertPxToMm = (px: number) => pxToMm(px, scale);

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
      const deltaX = convertPxToMm(e.clientX - dragStart.x);
      const deltaY = convertPxToMm(e.clientY - dragStart.y);
      updateField(selectedFieldId, {
        x: Math.max(0, Math.min(templateWidth, dragStart.fieldX + deltaX)),
        y: Math.max(0, Math.min(templateHeight, dragStart.fieldY + deltaY)),
      });
    } else if (isResizing && selectedFieldId) {
      const deltaX = convertPxToMm(e.clientX - resizeStart.x);
      const deltaY = convertPxToMm(e.clientY - resizeStart.y);
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
      
      <TemplateSelector
        templates={templates}
        selectedTemplate={selectedTemplate}
        onTemplateSelect={loadTemplate}
        onNewTemplate={resetForm}
        onDeleteTemplate={(id, name) => setDeleteModal({ isOpen: true, templateId: id, templateName: name })}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />

      <div className="grid grid-cols-12 gap-6">
        <Canvas
          backgroundImage={backgroundImage}
          templateWidth={templateWidth}
          templateHeight={templateHeight}
          scale={scale}
          fields={fields}
          selectedFieldId={selectedFieldId}
          isDragging={isDragging}
          isResizing={isResizing}
          isPanning={isPanning}
          canvasContainerRef={canvasContainerRef}
          canvasRef={canvasRef}
          fileInputRef={fileInputRef}
          onScaleChange={setScale}
          onUploadClick={() => fileInputRef.current?.click()}
          onFieldClick={setSelectedFieldId}
          onFieldMouseDown={handleFieldMouseDown}
          onResizeMouseDown={handleResizeMouseDown}
          onCanvasMouseMove={handleMouseMove}
          onCanvasMouseUp={handleMouseUp}
          onCanvasPanStart={handleCanvasPanStart}
          onCanvasPanMove={handleCanvasPanMove}
          onCanvasPanEnd={handleCanvasPanEnd}
        />

        <PropertiesPanel
          templateName={templateName}
          templateDescription={templateDescription}
          templateWidth={templateWidth}
          templateHeight={templateHeight}
          fields={fields}
          selectedFieldId={selectedFieldId}
          loading={loading}
          isEditing={isEditing}
          signatureInputRef={signatureInputRef}
          onTemplateNameChange={setTemplateName}
          onTemplateDescriptionChange={setTemplateDescription}
          onTemplateWidthChange={setTemplateWidth}
          onTemplateHeightChange={setTemplateHeight}
          onAddField={addField}
          onFieldUpdate={updateField}
          onFieldUpdateWithHistory={updateFieldWithHistory}
          onFieldDelete={deleteField}
          onHistoryAdd={addToHistory}
          onSignatureUploadClick={() => signatureInputRef.current?.click()}
          onSave={handleSaveTemplate}
          onCancel={resetForm}
        />
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      <input ref={signatureInputRef} type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
    </div>
  );
}
