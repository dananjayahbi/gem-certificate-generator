/**
 * Certificate Generation Service
 * Handles certificate generation, PDF creation, and field data population
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import type { CertificateTemplate, TemplateField } from './certificateTemplateService';

export interface CertificateData {
  templateId: string;
  recipientName: string;
  fieldValues: Record<string, string>; // fieldId -> value mapping
}

export interface GeneratedCertificate {
  id: string;
  templateId: string;
  recipientName: string;
  fieldValues: Record<string, string>;
  generatedAt: string;
  pdfUrl?: string;
}

/**
 * Generate a certificate PDF from template and field data
 */
export async function generateCertificatePDF(
  template: CertificateTemplate,
  fieldValues: Record<string, string>
): Promise<Uint8Array> {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Convert mm to points (1 mm = 2.834645669 points)
    const mmToPoints = (mm: number) => mm * 2.834645669;

    // Add a page with the template dimensions
    const page = pdfDoc.addPage([
      mmToPoints(template.width),
      mmToPoints(template.height),
    ]);

    // Load and embed the background image
    let backgroundImage;
    if (template.backgroundImageUrl.startsWith('data:image/png')) {
      backgroundImage = await pdfDoc.embedPng(template.backgroundImageUrl);
    } else if (template.backgroundImageUrl.startsWith('data:image/jpeg') || 
               template.backgroundImageUrl.startsWith('data:image/jpg')) {
      backgroundImage = await pdfDoc.embedJpg(template.backgroundImageUrl);
    } else {
      // Fetch the image if it's a URL
      const imageBytes = await fetch(template.backgroundImageUrl).then((res) =>
        res.arrayBuffer()
      );
      const imageType = template.backgroundImageUrl.toLowerCase();
      if (imageType.endsWith('.png')) {
        backgroundImage = await pdfDoc.embedPng(imageBytes);
      } else {
        backgroundImage = await pdfDoc.embedJpg(imageBytes);
      }
    }

    // Draw the background image
    page.drawImage(backgroundImage, {
      x: 0,
      y: 0,
      width: page.getWidth(),
      height: page.getHeight(),
    });

    // Embed fonts
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Process each field
    for (const field of template.fields) {
      const value = fieldValues[field.id] || field.placeholder || '';

      if (field.type === 'text' || field.type === 'date') {
        // Select font based on field configuration
        let font = timesRomanFont;
        if (field.fontFamily === 'Helvetica') {
          font = field.fontWeight === 'bold' ? helveticaBoldFont : helveticaFont;
        } else {
          font = field.fontWeight === 'bold' ? timesRomanBoldFont : timesRomanFont;
        }

        const fontSize = field.fontSize || 16;
        const color = field.color ? hexToRgb(field.color) : rgb(0, 0, 0);

        // Calculate text width for alignment
        const textWidth = font.widthOfTextAtSize(value, fontSize);
        let xPosition = mmToPoints(field.x);

        if (field.align === 'center') {
          xPosition = mmToPoints(field.x) - textWidth / 2;
        } else if (field.align === 'right') {
          xPosition = mmToPoints(field.x) - textWidth;
        }

        // PDF coordinates start from bottom-left, so we need to flip Y
        const yPosition = page.getHeight() - mmToPoints(field.y);

        page.drawText(value, {
          x: xPosition,
          y: yPosition,
          size: fontSize,
          font: font,
          color: color,
        });
      } else if (field.type === 'image' || field.type === 'signature') {
        // Handle image fields (signatures)
        if (value && value.startsWith('data:image')) {
          let image;
          if (value.startsWith('data:image/png')) {
            image = await pdfDoc.embedPng(value);
          } else {
            image = await pdfDoc.embedJpg(value);
          }

          const width = field.width ? mmToPoints(field.width) : 50;
          const height = field.height ? mmToPoints(field.height) : 25;
          const yPosition = page.getHeight() - mmToPoints(field.y) - height;

          page.drawImage(image, {
            x: mmToPoints(field.x),
            y: yPosition,
            width: width,
            height: height,
          });
        }
      }
    }

    // Save the PDF as bytes
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    throw new Error('Failed to generate certificate PDF');
  }
}

/**
 * Generate and download a certificate
 */
export async function generateAndDownloadCertificate(
  template: CertificateTemplate,
  fieldValues: Record<string, string>,
  filename?: string
): Promise<void> {
  try {
    const pdfBytes = await generateCertificatePDF(template, fieldValues);
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const recipientName = fieldValues['recipientName'] || 'certificate';
    const sanitizedName = recipientName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const finalFilename = filename || `certificate_${sanitizedName}_${Date.now()}.pdf`;
    saveAs(blob, finalFilename);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    throw error;
  }
}

/**
 * Save certificate data to database
 */
export async function saveCertificate(
  certificateData: CertificateData
): Promise<GeneratedCertificate> {
  try {
    const response = await fetch('/api/certificates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(certificateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save certificate');
    }

    const data = await response.json();
    return data.certificate;
  } catch (error) {
    console.error('Error saving certificate:', error);
    throw error;
  }
}

/**
 * Fetch all certificates
 */
export async function fetchCertificates(): Promise<GeneratedCertificate[]> {
  try {
    const response = await fetch('/api/certificates', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch certificates');
    }

    const data = await response.json();
    return data.certificates;
  } catch (error) {
    console.error('Error fetching certificates:', error);
    throw error;
  }
}

/**
 * Fetch a single certificate by ID
 */
export async function fetchCertificateById(id: string): Promise<GeneratedCertificate> {
  try {
    const response = await fetch(`/api/certificates/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch certificate');
    }

    const data = await response.json();
    return data.certificate;
  } catch (error) {
    console.error('Error fetching certificate:', error);
    throw error;
  }
}

/**
 * Delete a certificate
 */
export async function deleteCertificate(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/certificates/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete certificate');
    }
  } catch (error) {
    console.error('Error deleting certificate:', error);
    throw error;
  }
}

/**
 * Regenerate PDF for an existing certificate
 */
export async function regenerateCertificatePDF(
  certificateId: string
): Promise<Uint8Array> {
  try {
    const response = await fetch(`/api/certificates/${certificateId}/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to regenerate certificate');
    }

    const blob = await response.blob();
    return new Uint8Array(await blob.arrayBuffer());
  } catch (error) {
    console.error('Error regenerating certificate:', error);
    throw error;
  }
}

/**
 * Helper function to convert hex color to RGB
 */
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return rgb(
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    );
  }
  return rgb(0, 0, 0); // Default to black
}

/**
 * Preview certificate in a new window
 */
export async function previewCertificate(
  template: CertificateTemplate,
  fieldValues: Record<string, string>
): Promise<void> {
  try {
    const pdfBytes = await generateCertificatePDF(template, fieldValues);
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (error) {
    console.error('Error previewing certificate:', error);
    throw error;
  }
}
