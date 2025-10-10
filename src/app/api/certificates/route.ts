import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const recipient = searchParams.get('recipient') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Build where clause for filtering
    const where: any = {};

    // Search functionality (searches in recipientName and issuedTo)
    if (search) {
      where.OR = [
        { recipientName: { contains: search } },
        { issuedTo: { contains: search } },
      ];
    }

    // Filter by recipient
    if (recipient) {
      where.recipientName = { contains: recipient };
    }

    // Filter by date range
    // Include both start and end dates in the range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        // Set to beginning of the start date (00:00:00)
        const startDateTime = new Date(startDate);
        startDateTime.setHours(0, 0, 0, 0);
        where.createdAt.gte = startDateTime;
      }
      if (endDate) {
        // Set to end of the end date (23:59:59.999)
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDateTime;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === 'recipientName' || sortBy === 'issuedTo' || sortBy === 'createdAt') {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    // Fetch certificates with pagination
    const [certificates, totalCount] = await Promise.all([
      prisma.certificate.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.certificate.count({ where }),
    ]);

    // Parse JSON fields
    const parsedCertificates = certificates.map((cert) => ({
      ...cert,
      fieldValues: JSON.parse(cert.fieldValues),
      generatedAt: cert.createdAt.toISOString(),
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      certificates: parsedCertificates,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    });
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
    const { templateId, recipientName, issuedTo, fieldValues } = body;

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
        issuedTo: issuedTo || null,
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
