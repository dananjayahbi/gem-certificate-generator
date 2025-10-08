/**
 * Certificate Template Service
 * Handles all certificate template operations including CRUD and field management
 */

export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'signature' | 'date' | 'image';
  x: number; // X coordinate in mm
  y: number; // Y coordinate in mm
  width?: number; // Width in mm (for images)
  height?: number; // Height in mm (for images)
  fontSize?: number; // Font size in pt (for text)
  fontFamily?: string; // Font family (for text)
  fontWeight?: 'normal' | 'bold' | 'light';
  color?: string; // Text color in hex (for text)
  align?: 'left' | 'center' | 'right'; // Text alignment
  placeholder?: string; // Placeholder text for UI
  signatureImageUrl?: string; // Base64 data URL for signature images
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description?: string;
  backgroundImageUrl: string;
  width: number; // Width in mm (e.g., 297 for A4 landscape)
  height: number; // Height in mm (e.g., 210 for A4 landscape)
  fields: TemplateField[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  backgroundImageUrl: string;
  width: number;
  height: number;
  fields?: TemplateField[];
  isActive?: boolean;
}

export interface UpdateTemplateData {
  name?: string;
  description?: string;
  backgroundImageUrl?: string;
  width?: number;
  height?: number;
  fields?: TemplateField[];
  isActive?: boolean;
}

/**
 * Fetch all certificate templates
 */
export async function fetchTemplates(): Promise<CertificateTemplate[]> {
  try {
    const response = await fetch('/api/templates', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch templates');
    }

    const data = await response.json();
    return data.templates;
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
}

/**
 * Fetch a single certificate template by ID
 */
export async function fetchTemplateById(id: string): Promise<CertificateTemplate> {
  try {
    const response = await fetch(`/api/templates/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch template');
    }

    const data = await response.json();
    return data.template;
  } catch (error) {
    console.error('Error fetching template:', error);
    throw error;
  }
}

/**
 * Create a new certificate template
 */
export async function createTemplate(templateData: CreateTemplateData): Promise<CertificateTemplate> {
  try {
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create template');
    }

    const data = await response.json();
    return data.template;
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
}

/**
 * Update an existing certificate template
 */
export async function updateTemplate(
  id: string,
  templateData: UpdateTemplateData
): Promise<CertificateTemplate> {
  try {
    const response = await fetch(`/api/templates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update template');
    }

    const data = await response.json();
    return data.template;
  } catch (error) {
    console.error('Error updating template:', error);
    throw error;
  }
}

/**
 * Delete a certificate template
 */
export async function deleteTemplate(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/templates/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete template');
    }
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
}

/**
 * Upload background image for certificate template
 * This function converts an image file to base64 and returns the data URL
 */
/**
 * Upload a background image or signature image for a certificate template
 * @param file - The image file to upload
 * @param templateId - Optional template ID (UUID). If not provided, a new UUID is generated
 * @param fileType - Type of file: 'background', 'signature', or 'image'
 * @param oldFilePath - Optional path to old file to delete (when replacing)
 * @returns The web-accessible file path and template ID
 */
export async function uploadBackgroundImage(
  file: File,
  templateId?: string,
  fileType: 'background' | 'signature' | 'image' = 'background',
  oldFilePath?: string
): Promise<{ filePath: string; templateId: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    if (templateId) formData.append('templateId', templateId);
    if (oldFilePath) formData.append('oldFilePath', oldFilePath);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload image');
    }

    const data = await response.json();
    return {
      filePath: data.filePath,
      templateId: data.templateId,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Validate template field coordinates
 * Ensures fields are within the certificate bounds
 */
export function validateFieldPosition(
  field: TemplateField,
  templateWidth: number,
  templateHeight: number
): boolean {
  if (field.x < 0 || field.y < 0) {
    return false;
  }

  if (field.x > templateWidth || field.y > templateHeight) {
    return false;
  }

  // For images, check if they fit within bounds
  if (field.type === 'image' || field.type === 'signature') {
    if (field.width && field.height) {
      if (field.x + field.width > templateWidth || field.y + field.height > templateHeight) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Generate a unique field ID
 */
export function generateFieldId(): string {
  return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
