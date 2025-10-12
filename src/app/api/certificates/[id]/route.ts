import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateCertificatePDF } from '@/services/certificateService';

/**
 * GET /api/certificates/[id]
 * Fetch a single certificate by ID (admin only)
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
        { error: 'Unauthorized. Only admins can access certificates.' },
        { status: 403 }
      );
    }

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

    // Parse JSON fields
    const parsedCertificate = {
      ...certificate,
      fieldValues: JSON.parse(certificate.fieldValues),
      generatedAt: certificate.createdAt.toISOString(),
    };

    return NextResponse.json({ certificate: parsedCertificate });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificate' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/certificates/[id]
 * Update a certificate (admin only)
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
        { error: 'Unauthorized. Only admins can update certificates.' },
        { status: 403 }
      );
    }

    // Check if certificate exists
    const existingCertificate = await prisma.certificate.findUnique({
      where: { id },
    });

    if (!existingCertificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { certificateNumber, issuedTo, fieldValues } = body;

    // Validate fieldValues
    if (fieldValues && typeof fieldValues !== 'object') {
      return NextResponse.json(
        { error: 'Field values must be an object' },
        { status: 400 }
      );
    }

    // Check for unique certificate number if provided
    if (certificateNumber && certificateNumber !== existingCertificate.certificateNumber) {
      const existingWithNumber = await prisma.certificate.findUnique({
        where: { certificateNumber },
      });

      if (existingWithNumber) {
        return NextResponse.json(
          { error: 'Certificate number already exists' },
          { status: 400 }
        );
      }
    }

    // Update certificate
    const updatedCertificate = await prisma.certificate.update({
      where: { id },
      data: {
        certificateNumber: certificateNumber || existingCertificate.certificateNumber,
        issuedTo: issuedTo !== undefined ? issuedTo : existingCertificate.issuedTo,
        fieldValues: fieldValues ? JSON.stringify(fieldValues) : existingCertificate.fieldValues,
      },
    });

    return NextResponse.json({
      message: 'Certificate updated successfully',
      certificate: {
        ...updatedCertificate,
        fieldValues: JSON.parse(updatedCertificate.fieldValues),
      },
    });
  } catch (error) {
    console.error('Error updating certificate:', error);
    return NextResponse.json(
      { error: 'Failed to update certificate' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/certificates/[id]
 * Delete a certificate (admin only)
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
        { error: 'Unauthorized. Only admins can delete certificates.' },
        { status: 403 }
      );
    }

    // Check if certificate exists
    const existingCertificate = await prisma.certificate.findUnique({
      where: { id },
    });

    if (!existingCertificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Delete certificate
    await prisma.certificate.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Certificate deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    return NextResponse.json(
      { error: 'Failed to delete certificate' },
      { status: 500 }
    );
  }
}

