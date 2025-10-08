'use client';

import { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Printer, Download, Plus } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import Link from 'next/link';

interface Certificate {
  id: string;
  certificateNumber: string | null;
  recipientName: string;
  issuedTo: string | null;
  createdAt: string;
  templateId: string;
  fieldValues: string;
}

export default function Page() {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: '',
  });
  const [downloadModal, setDownloadModal] = useState<{ isOpen: boolean; certificate: Certificate | null }>({
    isOpen: false,
    certificate: null,
  });

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/certificates', {
        headers: { 'x-user-role': 'admin' },
      });
      if (!response.ok) throw new Error('Failed to load certificates');
      const data = await response.json();
      setCertificates(data.certificates);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load certificates', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/certificates/${deleteModal.id}`, {
        method: 'DELETE',
        headers: { 'x-user-role': 'admin' },
      });
      if (!response.ok) throw new Error('Failed to delete');
      toast({ title: 'Success', description: 'Certificate deleted', variant: 'success' });
      loadCertificates();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete certificate', variant: 'error' });
    } finally {
      setDeleteModal({ isOpen: false, id: '', name: '' });
    }
  };

  const handleView = async (cert: Certificate) => {
    try {
      toast({ title: 'Info', description: 'Generating certificate image...', variant: 'info' });
      
      const response = await fetch(`/api/certificates/${cert.id}/image`);
      if (!response.ok) throw new Error('Failed to generate certificate image');
      
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      window.open(imageUrl, '_blank');
      
      // Clean up after a delay
      setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to view certificate', variant: 'error' });
    }
  };

  const handlePrint = async (cert: Certificate) => {
    try {
      toast({ title: 'Info', description: 'Preparing certificate for print...', variant: 'info' });
      
      const response = await fetch(`/api/certificates/${cert.id}/generate?format=pdf`);
      if (!response.ok) throw new Error('Failed to generate certificate');
      
      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);
      
      // Create hidden iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.src = pdfUrl;
      document.body.appendChild(iframe);
      
      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            console.error('Print error:', e);
            window.open(pdfUrl, '_blank');
          }
        }, 1000);
      };
      
      // Clean up after a delay
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(pdfUrl);
      }, 5000);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to print certificate', variant: 'error' });
    }
  };

  const handleDownload = async (cert: Certificate, format: 'pdf' | 'png' | 'jpg') => {
    try {
      toast({ title: 'Info', description: `Downloading ${format.toUpperCase()}...`, variant: 'info' });
      
      if (format === 'pdf') {
        const response = await fetch(`/api/certificates/${cert.id}/generate?format=pdf`);
        if (!response.ok) throw new Error('Failed to generate certificate');
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${cert.certificateNumber || cert.id}.pdf`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      } else {
        // For images (PNG/JPG), use image endpoint
        const response = await fetch(`/api/certificates/${cert.id}/image`);
        if (!response.ok) throw new Error('Failed to generate certificate image');
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${cert.certificateNumber || cert.id}.${format}`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      }
      
      toast({ title: 'Success', description: 'Certificate downloaded successfully', variant: 'success' });
      setDownloadModal({ isOpen: false, certificate: null });
    } catch (error) {
      console.error('Download error:', error);
      toast({ title: 'Error', description: 'Failed to download certificate', variant: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
        onConfirm={handleDelete}
        title="Delete Certificate"
        message={`Are you sure you want to delete certificate for "${deleteModal.name}"?`}
      />

      {/* Download Format Modal */}
      {downloadModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Select Download Format</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleDownload(downloadModal.certificate!, 'pdf')}
                className="w-full px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                PDF
              </button>
              <button
                onClick={() => handleDownload(downloadModal.certificate!, 'png')}
                className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                PNG
              </button>
              <button
                onClick={() => handleDownload(downloadModal.certificate!, 'jpg')}
                className="w-full px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                JPG
              </button>
              <button
                onClick={() => setDownloadModal({ isOpen: false, certificate: null })}
                className="w-full px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Certificates</h1>
          <p className="text-gray-600 mt-2">View and manage issued certificates</p>
        </div>
        <Link
          href="/certificates/create"
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Issue New Certificate
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Cert ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Recipient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Issued To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : certificates.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No certificates found
                </td>
              </tr>
            ) : (
              certificates.map((cert) => (
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
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleView(cert)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => toast({ title: 'Edit feature', description: 'Coming soon', variant: 'info' })}
                        className="text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, id: cert.id, name: cert.recipientName })}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => handlePrint(cert)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Print"
                      >
                        <Printer size={18} />
                      </button>
                      <button
                        onClick={() => setDownloadModal({ isOpen: true, certificate: cert })}
                        className="text-amber-600 hover:text-amber-900"
                        title="Download"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
