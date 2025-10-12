import { ReactNode } from 'react';

interface FullPageLayoutProps {
  header: ReactNode;
  canvas: ReactNode;
  preview: ReactNode;
  properties: ReactNode;
}

export default function FullPageLayout({ header, canvas, preview, properties }: FullPageLayoutProps) {
  return (
    <div className="min-h-screen bg-transparent">
      {/* Header with Template Selector */}
      <div className="bg-transparent border-gray-200">
        {header}
      </div>
      
      {/* Horizontal Properties Panel */}
      <div className="bg-white py-4 shadow-sm rounded-lg border-gray-200 ">
        {properties}
      </div>
      
      {/* Split View: Canvas (Left) | Preview (Right) */}
      <div className="grid grid-cols-2 gap-1">
        {/* Canvas Section */}
        <div className="bg-transparent flex justify-center items-stretch py-6">
          {canvas}
        </div>
        
        {/* Preview Section */}
        <div className="bg-transparent flex justify-center items-stretch py-6">
          {preview}
        </div>
      </div>
    </div>
  );
}
