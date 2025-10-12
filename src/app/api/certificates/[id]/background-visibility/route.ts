import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * PUT /api/certificates/[id]/background-visibility
 * Update background visibility for a certificate
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { backgroundVisible } = body;

    if (typeof backgroundVisible !== 'boolean') {
      return NextResponse.json(
        { error: 'backgroundVisible must be a boolean' },
        { status: 400 }
      );
    }

    // Update the certificate
    const certificate = await prisma.certificate.update({
      where: { id },
      data: { backgroundVisible },
    });

    return NextResponse.json({
      success: true,
      certificate,
    });
  } catch (error) {
    console.error('Error updating background visibility:', error);
    return NextResponse.json(
      { error: 'Failed to update background visibility' },
      { status: 500 }
    );
  }
}
