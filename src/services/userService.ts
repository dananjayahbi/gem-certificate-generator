import { API_ENDPOINTS } from '@/lib/constants/apiEndpoints';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'ADMIN' | 'USER';
  isActive?: boolean;
}

/**
 * Fetch all users
 */
export async function fetchUsers(): Promise<{ users: User[] }> {
  const response = await fetch(API_ENDPOINTS.USER.LIST, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch users' }));
    throw new Error(error.error || 'Failed to fetch users');
  }

  return response.json();
}

/**
 * Create a new user
 */
export async function createUser(userData: CreateUserData): Promise<{ message: string; user: User }> {
  const response = await fetch(API_ENDPOINTS.USER.CREATE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create user' }));
    throw new Error(error.error || 'Failed to create user');
  }

  return response.json();
}

/**
 * Update an existing user
 */
export async function updateUser(id: string, userData: UpdateUserData): Promise<{ message: string; user: User }> {
  const response = await fetch(API_ENDPOINTS.USER.UPDATE(id), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update user' }));
    throw new Error(error.error || 'Failed to update user');
  }

  return response.json();
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<{ message: string }> {
  const response = await fetch(API_ENDPOINTS.USER.DELETE(id), {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete user' }));
    throw new Error(error.error || 'Failed to delete user');
  }

  return response.json();
}
