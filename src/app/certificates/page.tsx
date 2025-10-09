'use client';

import { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Printer, Download, Plus } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import EditCertificateModal from './components/EditCertificateModal';
import Link from 'next/link';

interface Certificate {
  id: string;
  certificateNumber: string | null;
  recipientName: string;
  issuedTo: string | null;
  backgroundVisible: boolean;
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
  const [editModal, setEditModal] = useState<{ isOpen: boolean; certificate: Certificate | null }>({
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
      toast({ title: 'Info', description: 'Preparing to print...', variant: 'info' });
      
      // Fetch PDF as blob and convert to data URI to avoid download managers
      const response = await fetch(`/api/certificates/${cert.id}/generate?format=pdf&disposition=inline`);
      if (!response.ok) throw new Error('Failed to generate PDF');
      
      const blob = await response.blob();
      
      // Convert blob to base64 data URI
      const reader = new FileReader();
      reader.onloadend = function() {
        const base64data = reader.result as string;
        
        // Open a popup window with the PDF
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        
        if (!printWindow) {
          toast({ 
            title: 'Popup Blocked', 
            description: 'Please allow popups to print certificates', 
            variant: 'error' 
          });
          return;
        }
        
        // Write HTML with PDF object
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print Certificate</title>
              <style>
                body, html {
                  margin: 0;
                  padding: 0;
                  height: 100%;
                  width: 100%;
                  overflow: hidden;
                }
                object {
                  width: 100%;
                  height: 100%;
                }
              </style>
            </head>
            <body>
              <object data="${base64data}" type="application/pdf" width="100%" height="100%">
                <p>PDF cannot be displayed. Please update your browser.</p>
              </object>
              <script>
                window.addEventListener('load', function() {
                  setTimeout(function() {
                    window.print();
                  }, 1000);
                });
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Print error:', error);
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

  const handleToggleBackground = async (cert: Certificate) => {
    try {
      const newValue = !cert.backgroundVisible;
      const response = await fetch(`/api/certificates/${cert.id}/background-visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
        },
        body: JSON.stringify({ backgroundVisible: newValue }),
      });
      
      if (!response.ok) throw new Error('Failed to update background visibility');
      
      toast({ 
        title: 'Success', 
        description: `Background ${newValue ? 'enabled' : 'disabled'}`, 
        variant: 'success' 
      });
      loadCertificates();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update background visibility', variant: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
        onConfirm={handleDelete}
        title="Delete Certificate"
        message={`Are you sure you want to delete certificate for "${deleteModal.name}"?`}
      />

      {/* Edit Certificate Modal */}
      {editModal.certificate && (
        <EditCertificateModal
          certificate={editModal.certificate}
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, certificate: null })}
          onSave={loadCertificates}
          onToast={toast}
        />
      )}

      {/* Download Format Modal */}
      {downloadModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          style={{ backdropFilter: 'blur(4px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDownloadModal({ isOpen: false, certificate: null });
            }
          }}
        >
           <div
             className="bg-white rounded-lg p-6 max-w-sm w-full"
             role="dialog"
             aria-modal="true"
           >
             <h3 className="text-lg font-semibold mb-4">Select Download Format</h3>
             <div className="space-y-2">
               <button
                 onClick={() => handleDownload(downloadModal.certificate!, 'pdf')}
                 className="w-full px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 cursor-pointer"
               >
                 PDF
               </button>
               <button
                 onClick={() => handleDownload(downloadModal.certificate!, 'png')}
                 className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 cursor-pointer"
               >
                 PNG
               </button>
               <button
                 onClick={() => handleDownload(downloadModal.certificate!, 'jpg')}
                 className="w-full px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 cursor-pointer"
               >
                 JPG
               </button>
               <button
                 onClick={() => setDownloadModal({ isOpen: false, certificate: null })}
                 className="w-full px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
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
                Background Visibility
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : certificates.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
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
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleToggleBackground(cert)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        cert.backgroundVisible ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                      title={cert.backgroundVisible ? 'Background enabled' : 'Background disabled'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          cert.backgroundVisible ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
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
                        onClick={() => setEditModal({ isOpen: true, certificate: cert })}
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
