import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const templateId = formData.get('templateId') as string;
    const fileType = formData.get('fileType') as string; // 'background', 'signature', 'image'
    const oldFilePath = formData.get('oldFilePath') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Generate UUID for new template if not provided
    const folderUuid = templateId || uuidv4();
    
    // Create directory path: src/assets/certificate-templates/[uuid]
    const uploadsDir = path.join(process.cwd(), 'src', 'assets', 'certificate-templates', folderUuid);
    
    // Create directory if it doesn't exist
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Delete old file if it exists
    if (oldFilePath) {
      const oldFileFullPath = path.join(process.cwd(), 'src', 'assets', oldFilePath.replace('/api/assets/', ''));
      if (existsSync(oldFileFullPath)) {
        try {
          await unlink(oldFileFullPath);
          console.log('Deleted old file:', oldFilePath);
        } catch (error) {
          console.error('Error deleting old file:', error);
        }
      }
    }

    // Get file extension
    const fileName = file.name;
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    
    // Generate filename based on type and timestamp to ensure uniqueness
    const timestamp = Date.now();
    const newFileName = `${fileType}_${timestamp}${fileExtension}`;
    const filePath = path.join(uploadsDir, newFileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return API-accessible URL path
    const webPath = `/api/assets/certificate-templates/${folderUuid}/${newFileName}`;

    return NextResponse.json({
      success: true,
      filePath: webPath,
      templateId: folderUuid,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json(
        { error: 'No file path provided' },
        { status: 400 }
      );
    }

    const fullPath = path.join(process.cwd(), 'src', 'assets', filePath.replace('/api/assets/', ''));
    
    if (existsSync(fullPath)) {
      await unlink(fullPath);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
