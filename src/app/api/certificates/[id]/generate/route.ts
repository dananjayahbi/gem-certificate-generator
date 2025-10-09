import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * GET /api/certificates/[id]/generate?format=pdf
 * Generate certificate PDF
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Generating certificate PDF for ID:', id);

    // Fetch certificate
    const certificate = await prisma.certificate.findUnique({
      where: { id },
    });

    if (!certificate) {
      console.error('Certificate not found:', id);
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
      console.error('Template not found:', certificate.templateId);
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

    console.log('=== PDF GENERATION DEBUG ===');
    console.log('Certificate ID:', certificate.id);
    console.log('Field Values:', fieldValues);
    console.log('Template Fields:', template.fields.map((f: any) => ({ id: f.id, name: f.name, type: f.type })));
    console.log('===========================');
    
    console.log('Template loaded:', { id: template.id, name: template.name });

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    
    // Register fontkit to enable custom font embedding
    pdfDoc.registerFontkit(fontkit);
    
    const mmToPoints = (mm: number) => mm * 2.834645669;

    const page = pdfDoc.addPage([
      mmToPoints(template.width),
      mmToPoints(template.height),
    ]);

    console.log('Page created');

    // Load background image
    let backgroundImage;
    try {
      if (template.backgroundImageUrl.startsWith('data:image/png')) {
        backgroundImage = await pdfDoc.embedPng(template.backgroundImageUrl);
      } else if (template.backgroundImageUrl.startsWith('data:image/jpeg') || 
                template.backgroundImageUrl.startsWith('data:image/jpg')) {
        backgroundImage = await pdfDoc.embedJpg(template.backgroundImageUrl);
      } else {
        const imageUrl = new URL(template.backgroundImageUrl, request.url).toString();
        console.log('Fetching background image from:', imageUrl);
        const imageBytes = await fetch(imageUrl).then((res) => res.arrayBuffer());
        console.log('Image bytes loaded:', imageBytes.byteLength);
        const imageType = template.backgroundImageUrl.toLowerCase();
        if (imageType.endsWith('.png')) {
          backgroundImage = await pdfDoc.embedPng(imageBytes);
        } else {
          backgroundImage = await pdfDoc.embedJpg(imageBytes);
        }
      }
      console.log('Background image embedded');
    } catch (bgError) {
      console.error('Error loading background image:', bgError);
      throw new Error(`Failed to load background image: ${bgError instanceof Error ? bgError.message : 'Unknown'}`);
    }

    page.drawImage(backgroundImage, {
      x: 0,
      y: 0,
      width: page.getWidth(),
      height: page.getHeight(),
    });

    console.log('Background image drawn');

    // Embed fonts - standard fonts
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);

    // Map of standard fonts
    const fontMap: Record<string, any> = {
      'TimesRoman': timesRomanFont,
      'Helvetica': helveticaFont,
      'Courier': courierFont,
    };

    // Load custom fonts from user-fonts directory
    const customFontsDir = join(process.cwd(), 'src', 'assets', 'fonts', 'user-fonts');
    for (const field of template.fields) {
      if ((field.type === 'text' || field.type === 'date') && field.fontFamily) {
        // Check if it's a custom font (not in standard fonts)
        if (!fontMap[field.fontFamily]) {
          const fontPath = join(customFontsDir, `${field.fontFamily}.ttf`);
          if (existsSync(fontPath)) {
            try {
              const fontBytes = await readFile(fontPath);
              const customFont = await pdfDoc.embedFont(fontBytes);
              fontMap[field.fontFamily] = customFont;
              console.log(`Loaded custom font: ${field.fontFamily}`);
            } catch (fontError) {
              console.error(`Error loading custom font ${field.fontFamily}:`, fontError);
              // Fallback to Helvetica if custom font fails
              fontMap[field.fontFamily] = helveticaFont;
            }
          } else {
            console.warn(`Custom font file not found: ${fontPath}, using Helvetica`);
            fontMap[field.fontFamily] = helveticaFont;
          }
        }
      }
    }

    // Draw fields
    for (const field of template.fields) {
      if (field.type === 'text' || field.type === 'date') {
        const value = fieldValues[field.id] || field.defaultValue || '';
        const font = fontMap[field.fontFamily as keyof typeof fontMap] || helveticaFont;
        const fontSize = field.fontSize || 14; // fontSize is already in points
        
        // Convert field position from mm to points
        const xPos = mmToPoints(field.x);
        // PDF uses bottom-left origin, so convert from top-left: 
        // pageHeight - (field.y in points) - (field.height in points)
        const fieldHeightPoints = mmToPoints(field.height || (field.fontSize * 0.3527777778 / 2.834645669)); 
        const yPos = page.getHeight() - mmToPoints(field.y) - fieldHeightPoints;

        const textWidth = font.widthOfTextAtSize(value, fontSize);
        let finalX = xPos;

        if (field.textAlign === 'center') {
          const fieldWidthPoints = mmToPoints(field.width || 50);
          finalX = xPos + (fieldWidthPoints / 2) - (textWidth / 2);
        } else if (field.textAlign === 'right') {
          const fieldWidthPoints = mmToPoints(field.width || 50);
          finalX = xPos + fieldWidthPoints - textWidth;
        }

        page.drawText(value, {
          x: finalX,
          y: yPos,
          size: fontSize,
          font,
          color: rgb(
            parseInt(field.color.slice(1, 3), 16) / 255,
            parseInt(field.color.slice(3, 5), 16) / 255,
            parseInt(field.color.slice(5, 7), 16) / 255
          ),
        });
      } else if (field.type === 'signature' && field.signatureImageUrl) {
        let signatureImage;
        if (field.signatureImageUrl.startsWith('data:image')) {
          if (field.signatureImageUrl.includes('png')) {
            signatureImage = await pdfDoc.embedPng(field.signatureImageUrl);
          } else {
            signatureImage = await pdfDoc.embedJpg(field.signatureImageUrl);
          }
        } else {
          const imgBytes = await fetch(
            new URL(field.signatureImageUrl, request.url).toString()
          ).then((res) => res.arrayBuffer());
          if (field.signatureImageUrl.toLowerCase().endsWith('.png')) {
            signatureImage = await pdfDoc.embedPng(imgBytes);
          } else {
            signatureImage = await pdfDoc.embedJpg(imgBytes);
          }
        }

        const xPos = mmToPoints(field.x);
        const yPos = page.getHeight() - mmToPoints(field.y) - mmToPoints(field.height || 20);

        page.drawImage(signatureImage, {
          x: xPos,
          y: yPos,
          width: mmToPoints(field.width || 40),
          height: mmToPoints(field.height || 20),
        });
      }
    }

    console.log('Fields drawn, saving PDF...');
    const pdfBytes = await pdfDoc.save();
    console.log('PDF bytes generated:', pdfBytes.byteLength);
    
    // Check if this is for printing (inline) or downloading (attachment)
    const { searchParams } = new URL(request.url);
    const disposition = searchParams.get('disposition') || 'attachment';
    
    // Return PDF directly as binary response
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disposition}; filename="certificate-${certificate.certificateNumber || id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { 
        error: 'Failed to generate certificate',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
