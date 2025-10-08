/**
 * Get the CSS font-family string with appropriate fallback fonts
 * @param fontName - The primary font name
 * @returns CSS font-family string with fallbacks
 */
export function getFontFamilyWithFallback(fontName: string): string {
  // Define fallback chains based on font characteristics
  const serifFonts = ['TimesRoman', 'Times-Roman', 'Times New Roman', 'Georgia', 'Garamond'];
  const sansSerifFonts = ['Helvetica', 'Arial', 'Verdana', 'Tahoma'];
  const monospaceFonts = ['Courier', 'Courier New', 'Monaco', 'Consolas'];
  
  // Determine the fallback chain based on the font
  let fallback = 'serif'; // default fallback
  
  if (serifFonts.some(f => fontName.toLowerCase().includes(f.toLowerCase()))) {
    fallback = 'Georgia, "Times New Roman", Times, serif';
  } else if (sansSerifFonts.some(f => fontName.toLowerCase().includes(f.toLowerCase()))) {
    fallback = 'Arial, Helvetica, sans-serif';
  } else if (monospaceFonts.some(f => fontName.toLowerCase().includes(f.toLowerCase()))) {
    fallback = '"Courier New", Courier, monospace';
  } else {
    // For custom fonts, provide a generic fallback based on common web-safe fonts
    fallback = 'Georgia, "Times New Roman", Times, serif';
  }
  
  // Return the font with fallback chain
  return `'${fontName}', ${fallback}`;
}
