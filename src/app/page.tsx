'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, FileText, Users, Calendar, TrendingUp, Plus, Eye } from 'lucide-react';
import PageLoader from '@/components/ui/PageLoader';

interface DashboardStats {
  totalCertificates: number;
  certificatesThisMonth: number;
  certificatesToday: number;
  totalTemplates: number;
  totalUsers: number;
}

interface LatestCertificate {
  id: string;
  certificateNumber: string | null;
  recipientName: string;
  issuedTo: string | null;
  createdAt: string;
}

interface ChartDataPoint {
  month: string;
  count: number;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [latestCertificates, setLatestCertificates] = useState<LatestCertificate[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      
      const data = await response.json();
      setStats(data.stats);
      setLatestCertificates(data.latestCertificates);
      setChartData(data.chartData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoader text="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-8 px-6 rounded-lg shadow-lg mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-amber-100 text-lg">Welcome to Certificate Generator</p>
          </div>
          <Link
            href="/certificates/create"
            className="bg-white text-amber-600 px-6 py-3 rounded-lg font-semibold hover:bg-amber-50 transition-colors flex items-center gap-2 shadow-lg"
          >
            <Plus size={20} />
            Issue Certificate
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Certificates */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Certificates</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalCertificates || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Award className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        {/* This Month */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">This Month</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.certificatesThisMonth || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Calendar className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {/* Today */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Issued Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.certificatesToday || 0}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        {/* Active Templates */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Templates</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalTemplates || 0}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <FileText className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Certificate Trends (Last 6 Months)</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp size={16} className="text-green-500" />
              <span>Monthly Certificates</span>
            </div>
          </div>
          
          <div className="relative" style={{ height: '300px' }}>
            <svg width="100%" height="100%" viewBox="0 0 800 300">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => {
                const y = 50 + (i * 50);
                return (
                  <line
                    key={i}
                    x1="60"
                    y1={y}
                    x2="780"
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Y-axis labels */}
              {(() => {
                const maxCount = Math.max(...chartData.map(d => d.count), 1);
                const step = Math.ceil(maxCount / 4);
                return [4, 3, 2, 1, 0].map((i, index) => (
                  <text
                    key={i}
                    x="50"
                    y={50 + (index * 50) + 5}
                    textAnchor="end"
                    fontSize="12"
                    fill="#6b7280"
                  >
                    {i * step}
                  </text>
                ));
              })()}

              {/* Line path */}
              <path
                d={chartData.map((item, index) => {
                  const x = 60 + ((720 / Math.max(chartData.length - 1, 1)) * (chartData.length === 1 ? 0.5 * (chartData.length - 1) : index));
                  const maxCount = Math.max(...chartData.map(d => d.count), 1);
                  const y = 250 - ((item.count / maxCount) * 200);
                  return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points and labels */}
              {chartData.map((item, index) => {
                const x = 60 + ((720 / Math.max(chartData.length - 1, 1)) * (chartData.length === 1 ? 0.5 * (chartData.length - 1) : index));
                const maxCount = Math.max(...chartData.map(d => d.count), 1);
                const y = 250 - ((item.count / maxCount) * 200);

                return (
                  <g key={index}>
                    {/* Data point circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r="6"
                      fill="white"
                      stroke="#f59e0b"
                      strokeWidth="3"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r="3"
                      fill="#f59e0b"
                    />
                    
                    {/* Value label above point */}
                    <text
                      x={x}
                      y={y - 15}
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="600"
                      fill="#374151"
                    >
                      {item.count}
                    </text>

                    {/* Month label below */}
                    <text
                      x={x}
                      y={270}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#6b7280"
                    >
                      {item.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Latest Certificates Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Latest Certificates</h2>
          <Link
            href="/certificates"
            className="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center gap-1"
          >
            View All
            <Eye size={16} />
          </Link>
        </div>
        
        {latestCertificates.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No certificates issued yet. Start by issuing your first certificate!
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cert ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issued To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {latestCertificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {cert.certificateNumber || cert.id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cert.recipientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cert.issuedTo || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(cert.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <Link
                      href={`/certificates/${cert.id}/view`}
                      className="text-blue-600 hover:text-blue-900"
                      target="_blank"
                    >
                      <Eye size={18} className="inline" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Link
          href="/certificates"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border border-gray-200 hover:border-amber-500"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Award className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Certificates</h3>
              <p className="text-sm text-gray-500">Browse all issued certificates</p>
            </div>
          </div>
        </Link>

        <Link
          href="/cert-design"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border border-gray-200 hover:border-amber-500"
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <FileText className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Design Template</h3>
              <p className="text-sm text-gray-500">Create or edit templates</p>
            </div>
          </div>
        </Link>

        <Link
          href="/users"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border border-gray-200 hover:border-amber-500"
        >
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-500">User management</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
