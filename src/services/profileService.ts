import { API_ENDPOINTS } from '@/lib/constants/apiEndpoints';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

/**
 * Fetch current user's profile
 */
export async function fetchProfile(): Promise<{ user: Profile }> {
  const response = await fetch(API_ENDPOINTS.PROFILE.GET, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch profile' }));
    throw new Error(error.error || 'Failed to fetch profile');
  }

  return response.json();
}

/**
 * Update current user's profile
 */
export async function updateProfile(profileData: UpdateProfileData): Promise<{ message: string; user: Profile }> {
  const response = await fetch(API_ENDPOINTS.PROFILE.UPDATE, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update profile' }));
    throw new Error(error.error || 'Failed to update profile');
  }

  return response.json();
}
