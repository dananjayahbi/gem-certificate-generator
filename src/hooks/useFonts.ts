import { useState, useEffect } from 'react';

export interface FontInfo {
  name: string;
  isCustom: boolean;
}

const DEFAULT_FONTS: FontInfo[] = [
  { name: 'TimesRoman', isCustom: false },
  { name: 'Helvetica', isCustom: false },
  { name: 'Courier', isCustom: false },
];

// Function to inject @font-face CSS for custom fonts
const injectFontFaceCSS = (customFonts: FontInfo[]) => {
  // Remove existing custom font style tag if it exists
  const existingStyle = document.getElementById('custom-fonts-style');
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create CSS rules for custom fonts
  const cssRules = customFonts.map(font => {
    const fontPath = `/api/assets/fonts/user-fonts/${font.name}.ttf`;
    return `
      @font-face {
        font-family: '${font.name}';
        src: url('${fontPath}') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
    `;
  }).join('\n');

  // Inject the CSS into the page
  if (cssRules) {
    const styleTag = document.createElement('style');
    styleTag.id = 'custom-fonts-style';
    styleTag.textContent = cssRules;
    document.head.appendChild(styleTag);
  }
};

export function useFonts() {
  const [fonts, setFonts] = useState<FontInfo[]>(DEFAULT_FONTS);
  const [loading, setLoading] = useState(false);

  const loadFonts = async () => {
    try {
      const response = await fetch('/api/fonts');
      const data = await response.json();
      const customFonts: FontInfo[] = data.fonts.map((fontFile: string) => ({
        name: fontFile.replace('.ttf', ''),
        isCustom: true,
      }));
      setFonts([...DEFAULT_FONTS, ...customFonts]);
      
      // Inject @font-face CSS for custom fonts
      injectFontFaceCSS(customFonts);
    } catch (error) {
      console.error('Error loading fonts:', error);
    }
  };

  const uploadFont = async (file: File) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('font', file);

      const response = await fetch('/api/fonts', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload font');
      }

      await loadFonts();
      return { success: true };
    } catch (error) {
      console.error('Error uploading font:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  const deleteFont = async (fontName: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/fonts?fontName=${encodeURIComponent(fontName + '.ttf')}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete font');
      }

      await loadFonts();
      return { success: true };
    } catch (error) {
      console.error('Error deleting font:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFonts();
  }, []);

  return {
    fonts,
    loading,
    uploadFont,
    deleteFont,
    refreshFonts: loadFonts,
  };
}
