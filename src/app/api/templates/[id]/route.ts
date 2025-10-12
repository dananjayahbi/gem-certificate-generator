import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/templates/[id]
 * Fetch a single certificate template by ID (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userRole = request.headers.get('x-user-role');

    // Check if user is admin
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can access templates.' },
        { status: 403 }
      );
    }

    // Fetch template
    const template = await prisma.certificateTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const parsedTemplate = {
      ...template,
      fields: JSON.parse(template.fields),
    };

    return NextResponse.json({ template: parsedTemplate });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/templates/[id]
 * Update a certificate template (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userRole = request.headers.get('x-user-role');

    // Check if user is admin
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can update templates.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, backgroundImageUrl, width, height, fields, isActive } = body;

    // Check if template exists
    const existingTemplate = await prisma.certificateTemplate.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (backgroundImageUrl !== undefined) updateData.backgroundImageUrl = backgroundImageUrl;
    if (width !== undefined) updateData.width = parseFloat(width);
    if (height !== undefined) updateData.height = parseFloat(height);
    if (fields !== undefined) updateData.fields = JSON.stringify(fields);
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update template
    const template = await prisma.certificateTemplate.update({
      where: { id },
      data: updateData,
    });

    // Parse JSON fields for response
    const parsedTemplate = {
      ...template,
      fields: JSON.parse(template.fields),
    };

    return NextResponse.json({
      template: parsedTemplate,
      message: 'Template updated successfully',
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/templates/[id]
 * Delete a certificate template (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userRole = request.headers.get('x-user-role');

    // Check if user is admin
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can delete templates.' },
        { status: 403 }
      );
    }

    // Check if template exists
    const existingTemplate = await prisma.certificateTemplate.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Delete template
    await prisma.certificateTemplate.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Template deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
