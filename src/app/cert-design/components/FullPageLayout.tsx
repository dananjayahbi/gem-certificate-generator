import { ReactNode } from 'react';

interface FullPageLayoutProps {
  header: ReactNode;
  canvas: ReactNode;
  preview: ReactNode;
  properties: ReactNode;
}

export default function FullPageLayout({ header, canvas, preview, properties }: FullPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Template Selector */}
      <div className="bg-white border-b border-gray-200 shadow-sm p-4">
        {header}
      </div>
      
      {/* Horizontal Properties Panel */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        {properties}
      </div>
      
      {/* Split View: Canvas (Left) | Preview (Right) */}
      <div className="grid grid-cols-2 gap-0">
        {/* Canvas Section */}
        <div className="border-r border-gray-300 bg-gray-100 flex justify-center py-8">
          {canvas}
        </div>
        
        {/* Preview Section */}
        <div className="bg-gray-50 flex justify-center py-8">
          {preview}
        </div>
      </div>
    </div>
  );
}
