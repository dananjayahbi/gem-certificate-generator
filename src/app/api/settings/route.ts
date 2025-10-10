import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/settings
 * Fetch application settings
 */
export async function GET(request: NextRequest) {
  try {
    // Get the first (and only) settings record
    let settings = await prisma.settings.findFirst();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          normalMoveAmount: 0.5,
          shiftMoveAmount: 1.0,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings
 * Update application settings
 */
export async function PUT(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');

    // Check if user is admin
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can update settings.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { normalMoveAmount, shiftMoveAmount } = body;

    // Validate input
    if (normalMoveAmount !== undefined && (normalMoveAmount <= 0 || normalMoveAmount > 10)) {
      return NextResponse.json(
        { error: 'Normal move amount must be between 0 and 10 mm' },
        { status: 400 }
      );
    }

    if (shiftMoveAmount !== undefined && (shiftMoveAmount <= 0 || shiftMoveAmount > 10)) {
      return NextResponse.json(
        { error: 'Shift move amount must be between 0 and 10 mm' },
        { status: 400 }
      );
    }

    // Get existing settings or create if none exist
    let settings = await prisma.settings.findFirst();

    if (!settings) {
      // Create new settings
      settings = await prisma.settings.create({
        data: {
          normalMoveAmount: normalMoveAmount ?? 0.5,
          shiftMoveAmount: shiftMoveAmount ?? 1.0,
        },
      });
    } else {
      // Update existing settings
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          ...(normalMoveAmount !== undefined && { normalMoveAmount }),
          ...(shiftMoveAmount !== undefined && { shiftMoveAmount }),
        },
      });
    }

    return NextResponse.json({
      settings,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
