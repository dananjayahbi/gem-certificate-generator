import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { createCanvas, loadImage, registerFont } from 'canvas';

/**
 * GET /api/certificates/[id]/image
 * Generate and return certificate as JPG image
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Convert mm to pixels (assuming 300 DPI: 1mm = 11.811 pixels)
    const mmToPixels = (mm: number) => Math.round(mm * 11.811);

    const canvasWidth = mmToPixels(template.width);
    const canvasHeight = mmToPixels(template.height);

    // Create canvas
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Load and draw background image
    let backgroundImageData;
    if (template.backgroundImageUrl.startsWith('data:image')) {
      // Base64 image
      backgroundImageData = template.backgroundImageUrl;
    } else {
      // File path - read from assets folder
      const imagePath = join(process.cwd(), 'src', 'assets', template.backgroundImageUrl.replace('/api/assets/', ''));
      const imageBuffer = await readFile(imagePath);
      const base64 = imageBuffer.toString('base64');
      const mimeType = template.backgroundImageUrl.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
      backgroundImageData = `data:image/${mimeType};base64,${base64}`;
    }

    const backgroundImage = await loadImage(backgroundImageData);
    ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);

    // Draw fields
    for (const field of template.fields) {
      if (field.type === 'text' || field.type === 'date') {
        const value = fieldValues[field.id] || field.defaultValue || '';
        const fontSize = mmToPixels(field.fontSize / 2.834645669); // Convert points to mm then to pixels
        const xPos = mmToPixels(field.x);
        const yPos = mmToPixels(field.y);

        // Set font
        ctx.font = `${fontSize}px "${field.fontFamily || 'Arial'}"`;
        ctx.fillStyle = field.color || '#000000';
        ctx.textAlign = (field.textAlign || 'left') as CanvasTextAlign;

        ctx.fillText(value, xPos, yPos);
      } else if (field.type === 'signature' && field.signatureImageUrl) {
        const xPos = mmToPixels(field.x);
        const yPos = mmToPixels(field.y);
        const width = mmToPixels(field.width || 40);
        const height = mmToPixels(field.height || 20);

        let signatureImageData;
        if (field.signatureImageUrl.startsWith('data:image')) {
          signatureImageData = field.signatureImageUrl;
        } else {
          const sigImagePath = join(process.cwd(), 'src', 'assets', field.signatureImageUrl.replace('/api/assets/', ''));
          const sigImageBuffer = await readFile(sigImagePath);
          const base64 = sigImageBuffer.toString('base64');
          const mimeType = field.signatureImageUrl.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
          signatureImageData = `data:image/${mimeType};base64,${base64}`;
        }

        const signatureImage = await loadImage(signatureImageData);
        ctx.drawImage(signatureImage, xPos, yPos, width, height);
      }
    }

    // Save as JPG buffer and return directly
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
    
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `inline; filename="certificate-${certificate.certificateNumber || id}.jpg"`,
      },
    });
  } catch (error) {
    console.error('Error generating certificate image:', error);
    return NextResponse.json(
      { error: 'Failed to generate certificate image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
