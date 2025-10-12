import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/templates
 * Fetch all certificate templates (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');

    // Check if user is admin
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can access templates.' },
        { status: 403 }
      );
    }

    // Fetch all templates
    const templates = await prisma.certificateTemplate.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Parse JSON fields
    const parsedTemplates = templates.map((template) => ({
      ...template,
      fields: JSON.parse(template.fields),
    }));

    return NextResponse.json({ templates: parsedTemplates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates
 * Create a new certificate template (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');

    // Check if user is admin
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can create templates.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, backgroundImageUrl, width, height, fields, isActive } = body;

    // Validate required fields
    if (!name || !backgroundImageUrl || !width || !height) {
      return NextResponse.json(
        { error: 'Missing required fields: name, backgroundImageUrl, width, height' },
        { status: 400 }
      );
    }

    // Create template
    const template = await prisma.certificateTemplate.create({
      data: {
        name,
        description: description || null,
        backgroundImageUrl,
        width: parseFloat(width),
        height: parseFloat(height),
        fields: JSON.stringify(fields || []),
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    // Parse JSON fields for response
    const parsedTemplate = {
      ...template,
      fields: JSON.parse(template.fields),
    };

    return NextResponse.json(
      { template: parsedTemplate, message: 'Template created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
