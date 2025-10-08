'use client';

import { use, useEffect, useState } from 'react';
import { useToast } from '@/hooks/useToast';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    loadCertificate();
  }, [id]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      
      // Generate/fetch the certificate image
      const response = await fetch(`/api/certificates/${id}/image`);
      
      if (!response.ok) {
        throw new Error('Failed to generate certificate image');
      }

      const data = await response.json();
      const fullImageUrl = `${data.imageUrl}?t=${Date.now()}`;
      
      // Open image in current tab (since this page IS the new tab)
      setImageUrl(fullImageUrl);
    } catch (error) {
      console.error('Error loading certificate:', error);
      toast({
        title: 'Error',
        description: 'Failed to load certificate',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {loading ? (
        <div className="text-gray-700 text-xl font-semibold">Generating certificate preview...</div>
      ) : imageUrl ? (
        <div className="w-full max-w-5xl bg-white shadow-2xl rounded-lg overflow-hidden p-4">
          <img
            src={imageUrl}
            alt="Certificate"
            className="w-full h-auto"
          />
        </div>
      ) : (
        <div className="text-red-600 text-xl font-semibold">Failed to load certificate</div>
      )}
    </div>
  );
}
