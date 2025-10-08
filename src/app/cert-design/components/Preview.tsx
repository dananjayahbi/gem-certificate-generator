import type { TemplateField } from '@/services/certificateTemplateService';
import { mmToPx } from '../utils/conversions';

interface PreviewProps {
  backgroundImage: string;
  templateWidth: number;
  templateHeight: number;
  scale: number;
  fields: TemplateField[];
}

export default function Preview({
  backgroundImage,
  templateWidth,
  templateHeight,
  scale,
  fields,
}: PreviewProps) {
  const convertMmToPx = (mm: number) => mmToPx(mm, scale);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-white rounded-lg shadow p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Preview</h2>
          <div className="text-sm text-gray-600">
            Real-time preview • Field names as values
          </div>
        </div>
        
        {/* Spacer to match Canvas help box height */}
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-800">
            <strong>👁️ Live Preview:</strong> 
            <span className="ml-2">
              This shows how your certificate will look with field names as sample values
            </span>
          </p>
        </div>
      
      {!backgroundImage ? (
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded bg-gray-50">
          <div className="text-center text-gray-400">
            <p className="text-lg font-medium mb-2">No Template Loaded</p>
            <p className="text-sm">Upload a background image to see preview</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto flex items-start justify-center">
          <div
            className="relative bg-white shadow-2xl"
            style={{
              width: convertMmToPx(templateWidth),
              height: convertMmToPx(templateHeight),
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
            }}
          >
            {fields.map((field) => (
              <div
                key={field.id}
                className="absolute"
                style={{
                  left: convertMmToPx(field.x),
                  top: convertMmToPx(field.y),
                  width: convertMmToPx(field.width || 50),
                  height: convertMmToPx(field.height || 25),
                }}
              >
                {field.type === 'signature' && field.signatureImageUrl ? (
                  <img 
                    src={field.signatureImageUrl} 
                    className="w-full h-full object-contain" 
                    alt="Signature" 
                  />
                ) : field.type === 'image' && field.signatureImageUrl ? (
                  <img 
                    src={field.signatureImageUrl} 
                    className="w-full h-full object-contain" 
                    alt="Image" 
                  />
                ) : (
                  <div 
                    className="h-full w-full p-1"
                    style={{
                      fontSize: `${field.fontSize * scale}px`,
                      color: field.color,
                      fontWeight: field.fontWeight,
                      fontFamily: field.fontFamily,
                      textAlign: field.align as any,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: field.align === 'center' ? 'center' : field.align === 'right' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {field.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
