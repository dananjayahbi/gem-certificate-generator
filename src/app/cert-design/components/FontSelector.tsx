import { useRef, useState, useEffect } from 'react';
import { Upload, X, ChevronDown } from 'lucide-react';
import { FontInfo } from '@/hooks/useFonts';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface FontSelectorProps {
  value: string;
  fonts: FontInfo[];
  loading: boolean;
  onChange: (fontName: string) => void;
  onUpload: (file: File) => Promise<{ success: boolean; error?: string }>;
  onDelete: (fontName: string) => Promise<{ success: boolean; error?: string }>;
  onToast: (options: { title: string; description: string; variant: 'success' | 'error' | 'info' }) => void;
}

export default function FontSelector({
  value,
  fonts,
  loading,
  onChange,
  onUpload,
  onDelete,
  onToast,
}: FontSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; fontName: string }>({
    isOpen: false,
    fontName: '',
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.ttf')) {
      onToast({
        title: 'Invalid File',
        description: 'Please upload a .ttf font file',
        variant: 'error',
      });
      return;
    }

    const result = await onUpload(file);
    if (result.success) {
      onToast({
        title: 'Font Uploaded',
        description: 'Font uploaded successfully',
        variant: 'success',
      });
    } else {
      onToast({
        title: 'Upload Failed',
        description: result.error || 'Failed to upload font',
        variant: 'error',
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteFont = async () => {
    const result = await onDelete(deleteModal.fontName);
    if (result.success) {
      onToast({
        title: 'Font Deleted',
        description: 'Font deleted successfully',
        variant: 'success',
      });
      // If the deleted font was selected, change to default
      if (value === deleteModal.fontName) {
        onChange('TimesRoman');
      }
    } else {
      onToast({
        title: 'Delete Failed',
        description: result.error || 'Failed to delete font',
        variant: 'error',
      });
    }
    setDeleteModal({ isOpen: false, fontName: '' });
  };

  const selectedFont = fonts.find(f => f.name === value);

  return (
    <>
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, fontName: '' })}
        onConfirm={handleDeleteFont}
        title="Delete Font"
        message={`Are you sure you want to delete the font "${deleteModal.fontName}"? This action cannot be undone.`}
        confirmText="confirm"
        requireTyping={true}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".ttf"
        onChange={handleFontUpload}
        className="hidden"
      />

      <div className="space-y-1">
        <label className="block text-xs font-medium">Font Family</label>
        
        {/* Custom Dropdown */}
        <div ref={dropdownRef} className="relative">
          {/* Dropdown Trigger */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-2 py-1 border rounded text-sm text-left flex items-center justify-between bg-white hover:bg-gray-50"
          >
            <span>
              {value} {selectedFont?.isCustom ? '(Custom)' : ''}
            </span>
            <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
              {/* Upload Font Option - First Item */}
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                  setIsOpen(false);
                }}
                disabled={loading}
                className="w-full px-3 py-2 text-left hover:bg-purple-50 text-purple-700 disabled:opacity-50 flex items-center gap-2 text-sm border-b border-purple-200 bg-purple-50/50"
              >
                <Upload size={14} />
                Upload Custom Font (.ttf)
              </button>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Font List */}
              {fonts.map((font) => (
                <div
                  key={font.name}
                  className={`flex items-center justify-between w-full px-3 py-2 text-sm ${
                    value === font.name ? 'bg-amber-50 text-amber-900 font-medium' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onChange(font.name);
                      setIsOpen(false);
                    }}
                    className="flex-1 text-left hover:underline"
                  >
                    {font.name} {font.isCustom ? '(Custom)' : ''}
                  </button>
                  {font.isCustom && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteModal({ isOpen: true, fontName: font.name });
                        setIsOpen(false);
                      }}
                      className="ml-2 p-1 text-red-600 hover:bg-red-100 rounded cursor-pointer"
                      title="Delete this font"
                    >
                      <X size={12} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
