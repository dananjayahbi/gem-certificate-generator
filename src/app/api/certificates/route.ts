import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/certificates
 * Fetch all certificates (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');

    // Check if user is admin
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can access certificates.' },
        { status: 403 }
      );
    }

    // Fetch all certificates
    const certificates = await prisma.certificate.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Parse JSON fields
    const parsedCertificates = certificates.map((cert) => ({
      ...cert,
      fieldValues: JSON.parse(cert.fieldValues),
      generatedAt: cert.createdAt.toISOString(),
    }));

    return NextResponse.json({ certificates: parsedCertificates });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/certificates
 * Create and save a new certificate
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const body = await request.json();
    const { templateId, recipientName, fieldValues } = body;

    // Validate required fields
    if (!templateId || !recipientName || !fieldValues) {
      return NextResponse.json(
        { error: 'Missing required fields: templateId, recipientName, fieldValues' },
        { status: 400 }
      );
    }

    // Verify template exists
    const template = await prisma.certificateTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Create certificate record
    const certificate = await prisma.certificate.create({
      data: {
        templateId,
        recipientName,
        fieldValues: JSON.stringify(fieldValues),
        createdBy: userId || null,
      },
    });

    // Parse JSON fields for response
    const parsedCertificate = {
      ...certificate,
      fieldValues: JSON.parse(certificate.fieldValues),
      generatedAt: certificate.createdAt.toISOString(),
    };

    return NextResponse.json(
      { certificate: parsedCertificate, message: 'Certificate created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating certificate:', error);
    return NextResponse.json(
      { error: 'Failed to create certificate' },
      { status: 500 }
    );
  }
}
