import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import puppeteer from 'puppeteer';

/**
 * GET /api/certificates/[id]/generate?format=pdf
 * Generate certificate PDF using Puppeteer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let browser = null;
  
  try {
    const { id } = await params;
    console.log('=== PDF GENERATION (Puppeteer) ===');
    console.log('Certificate ID:', id);

    // Fetch certificate
    const certificate = await prisma.certificate.findUnique({
      where: { id },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Fetch template
    const templateData = await prisma.certificateTemplate.findUnique({
      where: { id: certificate.templateId },
    });

    if (!templateData) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const fieldValues = JSON.parse(certificate.fieldValues);
    const template = {
      ...templateData,
      fields: JSON.parse(templateData.fields),
    };

    console.log('Template:', template.name);

    // Build HTML for certificate
    const html = await buildCertificateHTML(template, fieldValues);

    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Convert mm to pixels at 96 DPI
    const mmToPx = (mm: number) => Math.round(mm * 3.7795275591);
    
    // Set viewport to match certificate dimensions
    await page.setViewport({
      width: mmToPx(template.width),
      height: mmToPx(template.height),
      deviceScaleFactor: 2,
    });

    // Set content
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdf = await page.pdf({
      width: `${template.width}mm`,
      height: `${template.height}mm`,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();
    browser = null;

    console.log('✓ PDF generated successfully');

    // Get disposition from query params
    const url = new URL(request.url);
    const disposition = url.searchParams.get('disposition') || 'attachment';

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disposition}; filename="certificate-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    if (browser) {
      await browser.close();
    }
    
    return NextResponse.json(
      { error: 'Failed to generate certificate PDF' },
      { status: 500 }
    );
  }
}

/**
 * Build HTML for certificate rendering
 */
async function buildCertificateHTML(
  template: any,
  fieldValues: Record<string, string>
): Promise<string> {
  // Convert background image to data URI
  let backgroundImageData = template.backgroundImageUrl;
  
  if (!backgroundImageData.startsWith('data:image')) {
    const imagePath = join(process.cwd(), 'src', 'assets', template.backgroundImageUrl.replace('/api/assets/', ''));
    const imageBuffer = await readFile(imagePath);
    const base64 = imageBuffer.toString('base64');
    const mimeType = template.backgroundImageUrl.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
    backgroundImageData = `data:image/${mimeType};base64,${base64}`;
  }

  // Load custom fonts and build @font-face CSS
  const fontFaces: string[] = [];
  const customFontsDir = join(process.cwd(), 'src', 'assets', 'fonts', 'user-fonts');
  const processedFonts = new Set<string>();

  for (const field of template.fields) {
    if ((field.type === 'text' || field.type === 'date') && field.fontFamily) {
      if (!['TimesRoman', 'Helvetica', 'Courier', 'Arial'].includes(field.fontFamily) && !processedFonts.has(field.fontFamily)) {
        const fontPath = join(customFontsDir, `${field.fontFamily}.ttf`);
        
        if (existsSync(fontPath)) {
          const fontBuffer = await readFile(fontPath);
          const base64Font = fontBuffer.toString('base64');
          
          fontFaces.push(`
            @font-face {
              font-family: '${field.fontFamily}';
              src: url(data:font/ttf;base64,${base64Font}) format('truetype');
              font-weight: normal;
              font-style: normal;
            }
          `);
          
          processedFonts.add(field.fontFamily);
        }
      }
    }
  }

  // Map standard font names to web-safe fonts
  const fontFamilyMap: Record<string, string> = {
    'TimesRoman': '"Times New Roman", Times, serif',
    'Helvetica': 'Helvetica, Arial, sans-serif',
    'Courier': '"Courier New", Courier, monospace',
    'Arial': 'Arial, sans-serif',
  };

  // Build field HTML
  const fieldHtml = template.fields.map((field: any) => {
    if (field.type === 'text' || field.type === 'date') {
      const value = fieldValues[field.id] || field.defaultValue || '';
      const fontFamily = fontFamilyMap[field.fontFamily] || `'${field.fontFamily}', Arial, sans-serif`;
      
      return `
        <div style="
          position: absolute;
          left: ${field.x}mm;
          top: ${field.y}mm;
          width: ${field.width || 100}mm;
          height: ${field.height || 25}mm;
          font-size: ${field.fontSize}pt;
          color: ${field.color || '#000000'};
          font-family: ${fontFamily};
          font-weight: ${field.fontWeight || 'normal'};
          text-align: ${field.align || 'left'};
          display: flex;
          align-items: flex-start;
          justify-content: ${field.align === 'center' ? 'center' : field.align === 'right' ? 'flex-end' : 'flex-start'};
        ">
          ${value}
        </div>
      `;
    } else if ((field.type === 'signature' || field.type === 'image') && field.signatureImageUrl) {
      // Convert signature image to data URI
      let signatureImageData = field.signatureImageUrl;
      if (!signatureImageData.startsWith('data:image')) {
        try {
          const imagePath = join(process.cwd(), 'src', 'assets', field.signatureImageUrl.replace('/api/assets/', ''));
          const imageBuffer = readFileSync(imagePath);
          const base64 = imageBuffer.toString('base64');
          const mimeType = field.signatureImageUrl.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
          signatureImageData = `data:image/${mimeType};base64,${base64}`;
        } catch (err) {
          console.error('Failed to load signature image:', field.signatureImageUrl, err);
          return ''; // Skip this field if image can't be loaded
        }
      }
      
      return `
        <div style="
          position: absolute;
          left: ${field.x}mm;
          top: ${field.y}mm;
          width: ${field.width || 50}mm;
          height: ${field.height || 25}mm;
        ">
          <img src="${signatureImageData}" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>
      `;
    }
    return '';
  }).join('\n');

  // Build complete HTML
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        ${fontFaces.join('\n')}
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 0;
          width: ${template.width}mm;
          height: ${template.height}mm;
        }
        
        .certificate {
          position: relative;
          width: ${template.width}mm;
          height: ${template.height}mm;
          background-image: url('${backgroundImageData}');
          background-size: cover;
          background-position: center;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        ${fieldHtml}
      </div>
    </body>
    </html>
  `;
}
