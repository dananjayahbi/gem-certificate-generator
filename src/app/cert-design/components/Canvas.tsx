import { RefObject } from 'react';
import { ImageIcon, Upload } from 'lucide-react';
import type { TemplateField } from '@/services/certificateTemplateService';
import { mmToPx } from '../utils/conversions';
import { getFontFamilyWithFallback } from '../utils/fontUtils';

interface CanvasProps {
  backgroundImage: string;
  templateWidth: number;
  templateHeight: number;
  scale: number;
  fields: TemplateField[];
  selectedFieldId: string | null;
  isDragging: boolean;
  isResizing: boolean;
  isPanning: boolean;
  canvasContainerRef: RefObject<HTMLDivElement>;
  canvasRef: RefObject<HTMLDivElement>;
  fileInputRef: RefObject<HTMLInputElement>;
  onScaleChange: (scale: number) => void;
  onUploadClick: () => void;
  onFieldClick: (fieldId: string) => void;
  onFieldMouseDown: (e: React.MouseEvent, fieldId: string) => void;
  onResizeMouseDown: (e: React.MouseEvent, fieldId: string, corner: string) => void;
  onCanvasMouseMove: (e: React.MouseEvent) => void;
  onCanvasMouseUp: (e: React.MouseEvent) => void;
  onCanvasPanStart: (e: React.MouseEvent) => void;
  onCanvasPanMove: (e: React.MouseEvent) => void;
  onCanvasPanEnd: () => void;
  className?: string;
}

export default function Canvas({
  backgroundImage,
  templateWidth,
  templateHeight,
  scale,
  fields,
  selectedFieldId,
  isDragging,
  isResizing,
  isPanning,
  canvasContainerRef,
  canvasRef,
  fileInputRef,
  onScaleChange,
  onUploadClick,
  onFieldClick,
  onFieldMouseDown,
  onResizeMouseDown,
  onCanvasMouseMove,
  onCanvasMouseUp,
  onCanvasPanStart,
  onCanvasPanMove,
  onCanvasPanEnd,
  className = "col-span-9",
}: CanvasProps) {
  const convertMmToPx = (mm: number) => mmToPx(mm, scale);

  return (
    <div className={className}>
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
              onChange={(e) => onScaleChange(parseFloat(e.target.value))}
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
              <kbd className="px-2 py-0.5 bg-white border border-blue-300 rounded text-xs ml-1">Left-Click & Drag</kbd> to pan
            </span>
            <span className="mx-2">•</span>
            <span>
              <kbd className="px-2 py-0.5 bg-white border border-blue-300 rounded text-xs">Arrow Keys</kbd> to move field (0.5mm)
            </span>
            <span className="mx-2">•</span>
            <span>
              <kbd className="px-2 py-0.5 bg-white border border-blue-300 rounded text-xs">Shift</kbd> + 
              <kbd className="px-2 py-0.5 bg-white border border-blue-300 rounded text-xs ml-1">Arrow</kbd> for 1mm steps
            </span>
          </p>
        </div>
        
        {!backgroundImage ? (
          <div className="flex flex-col items-center py-20 border-2 border-dashed border-gray-300 rounded">
            <ImageIcon size={48} className="text-gray-400 mb-4" />
            <button
              onClick={onUploadClick}
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
            className="overflow-auto"
            onMouseDown={onCanvasPanStart}
            onMouseMove={onCanvasPanMove}
            onMouseUp={onCanvasPanEnd}
            onMouseLeave={onCanvasPanEnd}
            style={{ cursor: isPanning ? 'grabbing' : 'default' }}
          >
            <div
              ref={canvasRef}
              className="relative bg-white shadow-lg mx-auto"
              style={{
                width: convertMmToPx(templateWidth),
                height: convertMmToPx(templateHeight),
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
              }}
              onMouseMove={onCanvasMouseMove}
              onMouseUp={onCanvasMouseUp}
              onMouseLeave={onCanvasMouseUp}
            >
              {fields.map((field) => {
                const isSelected = selectedFieldId === field.id;
                return (
                  <div
                    key={field.id}
                    onClick={() => onFieldClick(field.id)}
                    onMouseDown={(e) => onFieldMouseDown(e, field.id)}
                    className={`absolute group ${
                      isSelected ? 'ring-2 ring-amber-500 z-10' : 'border border-blue-300'
                    } ${!isResizing && !isDragging ? 'cursor-move' : ''}`}
                    style={{
                      left: convertMmToPx(field.x),
                      top: convertMmToPx(field.y),
                      width: convertMmToPx(field.width || 50),
                      height: convertMmToPx(field.height || 25),
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
                          fontFamily: getFontFamilyWithFallback(field.fontFamily || 'TimesRoman'),
                        }}
                      >
                        {field.placeholder || field.name}
                      </div>
                    )}
                    
                    {isSelected && (
                      <>
                        <div
                          className="absolute w-2 h-2 bg-amber-500 rounded-full cursor-nw-resize -top-1 -left-1"
                          onMouseDown={(e) => onResizeMouseDown(e, field.id, 'nw')}
                        />
                        <div
                          className="absolute w-2 h-2 bg-amber-500 rounded-full cursor-ne-resize -top-1 -right-1"
                          onMouseDown={(e) => onResizeMouseDown(e, field.id, 'ne')}
                        />
                        <div
                          className="absolute w-2 h-2 bg-amber-500 rounded-full cursor-sw-resize -bottom-1 -left-1"
                          onMouseDown={(e) => onResizeMouseDown(e, field.id, 'sw')}
                        />
                        <div
                          className="absolute w-2 h-2 bg-amber-500 rounded-full cursor-se-resize -bottom-1 -right-1"
                          onMouseDown={(e) => onResizeMouseDown(e, field.id, 'se')}
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
  );
}
