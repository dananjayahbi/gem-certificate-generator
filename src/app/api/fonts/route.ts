import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, readdir } from 'fs/promises';
import path from 'path';

// GET: List all user-uploaded fonts
export async function GET() {
  try {
    const fontsDir = path.join(process.cwd(), 'src', 'assets', 'fonts', 'user-fonts');
    const files = await readdir(fontsDir);
    const fontFiles = files.filter(file => file.endsWith('.ttf'));
    
    return NextResponse.json({ fonts: fontFiles });
  } catch (error) {
    console.error('Error listing fonts:', error);
    return NextResponse.json({ fonts: [] });
  }
}

// POST: Upload a new font
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('font') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No font file provided' },
        { status: 400 }
      );
    }

    // Validate file extension
    if (!file.name.endsWith('.ttf')) {
      return NextResponse.json(
        { error: 'Only .ttf font files are supported' },
        { status: 400 }
      );
    }

    // Sanitize filename
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9-_.]/g, '_');
    const fontsDir = path.join(process.cwd(), 'src', 'assets', 'fonts', 'user-fonts');
    const filePath = path.join(fontsDir, sanitizedName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      fontName: sanitizedName,
      message: 'Font uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading font:', error);
    return NextResponse.json(
      { error: 'Failed to upload font' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a user-uploaded font
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fontName = searchParams.get('fontName');

    if (!fontName) {
      return NextResponse.json(
        { error: 'Font name not provided' },
        { status: 400 }
      );
    }

    // Validate filename to prevent directory traversal
    if (fontName.includes('..') || fontName.includes('/') || fontName.includes('\\')) {
      return NextResponse.json(
        { error: 'Invalid font name' },
        { status: 400 }
      );
    }

    const fontsDir = path.join(process.cwd(), 'src', 'assets', 'fonts', 'user-fonts');
    const filePath = path.join(fontsDir, fontName);

    await unlink(filePath);

    return NextResponse.json({
      success: true,
      message: 'Font deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting font:', error);
    return NextResponse.json(
      { error: 'Failed to delete font' },
      { status: 500 }
    );
  }
}
