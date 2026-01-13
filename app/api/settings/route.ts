import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

// GET /api/settings - Get all settings or specific setting by key
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      // Get specific setting
      const setting = await prisma.settings.findUnique({
        where: { key },
      });

      if (!setting) {
        return NextResponse.json({ data: null, error: 'Setting not found' }, { status: 404 });
      }

      return NextResponse.json({ data: setting, error: null });
    }

    // Get all settings
    const settings = await prisma.settings.findMany({
      orderBy: { key: 'asc' },
    });

    return NextResponse.json({ data: settings, error: null });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ data: null, error: 'Failed to fetch settings' }, { status: 500 });
  }
});

// PATCH /api/settings - Update a setting (Admin only)
export const PATCH = withAuth(async (request: AuthenticatedRequest) => {
  try {
    // Only admins can update settings
    if (request.user?.role !== 'ADMIN') {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ data: null, error: 'Key and value are required' }, { status: 400 });
    }

    // Update or create setting
    const setting = await prisma.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json({ data: setting, error: null });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json({ data: null, error: 'Failed to update setting' }, { status: 500 });
  }
});
