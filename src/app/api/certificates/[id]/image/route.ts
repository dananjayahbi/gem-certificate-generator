import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import puppeteer from 'puppeteer';

/**
 * GET /api/certificates/[id]/image
 * Generate and return certificate as JPG image using Puppeteer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let browser = null;
  
  try {
    const { id } = await params;

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

    console.log('=== JPG GENERATION (Puppeteer) DEBUG ===');
    console.log('Certificate ID:', id);
    console.log('Template:', template.name);

    // Build HTML for certificate
    const html = await buildCertificateHTML(template, fieldValues);

    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Convert mm to pixels at 96 DPI (standard web DPI)
    // 1mm = 3.7795275591 pixels at 96 DPI
    const mmToPx = (mm: number) => Math.round(mm * 3.7795275591);
    
    // Set viewport to match certificate dimensions
    // Use deviceScaleFactor for high-quality rendering
    await page.setViewport({
      width: mmToPx(template.width),
      height: mmToPx(template.height),
      deviceScaleFactor: 2, // 2x for high quality (retina)
    });

    // Set content
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'jpeg',
      quality: 95,
      fullPage: false, // Use viewport size, not full page
    });

    await browser.close();
    browser = null;

    console.log('✓ JPG generated successfully');

    return new NextResponse(screenshot, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `inline; filename="certificate-${id}.jpg"`,
      },
    });
  } catch (error) {
    console.error('Error generating JPG:', error);
    
    if (browser) {
      await browser.close();
    }
    
    return NextResponse.json(
      { error: 'Failed to generate certificate image' },
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
    // It's a file path - read and convert to base64
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
          align-items: center;
          justify-content: ${field.align === 'center' ? 'center' : field.align === 'right' ? 'flex-end' : 'flex-start'};
        ">
          ${value}
        </div>
      `;
    } else if ((field.type === 'signature' || field.type === 'image') && field.signatureImageUrl) {
      return `
        <div style="
          position: absolute;
          left: ${field.x}mm;
          top: ${field.y}mm;
          width: ${field.width || 50}mm;
          height: ${field.height || 25}mm;
        ">
          <img src="${field.signatureImageUrl}" style="width: 100%; height: 100%; object-fit: contain;" />
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
