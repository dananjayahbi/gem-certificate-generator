import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Get total certificate count
    const totalCertificates = await prisma.certificate.count();

    // Get certificates issued this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const certificatesThisMonth = await prisma.certificate.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Get certificates issued today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const certificatesToday = await prisma.certificate.count({
      where: {
        createdAt: {
          gte: startOfToday,
        },
      },
    });

    // Get total templates count
    const totalTemplates = await prisma.certificateTemplate.count({
      where: {
        isActive: true,
      },
    });

    // Get total users count
    const totalUsers = await prisma.user.count({
      where: {
        isActive: true,
      },
    });

    // Get latest 5 certificates
    const latestCertificates = await prisma.certificate.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        certificateNumber: true,
        recipientName: true,
        issuedTo: true,
        createdAt: true,
      },
    });

    // Get certificates per month for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const allCertificatesForChart = await prisma.certificate.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Group by month manually
    const monthlyData: { [key: string]: number } = {};
    allCertificatesForChart.forEach((cert) => {
      const date = new Date(cert.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    // Convert to array and sort
    const chartData = Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return NextResponse.json({
      stats: {
        totalCertificates,
        certificatesThisMonth,
        certificatesToday,
        totalTemplates,
        totalUsers,
      },
      latestCertificates,
      chartData,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
