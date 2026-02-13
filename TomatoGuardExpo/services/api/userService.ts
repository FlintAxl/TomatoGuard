import { getApiClient } from './client';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  profile_picture: string | null;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string | null;
}

/**
 * Fetch all users (admin only)
 */
export const fetchAllUsers = async (token?: string): Promise<User[]> => {
  const client = getApiClient(token);
  const response = await client.get<User[]>('/api/v1/auth/users');
  return response.data;
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (
  userId: string,
  role: 'user' | 'admin',
  token?: string
): Promise<User> => {
  const client = getApiClient(token);
  const response = await client.put<User>(
    `/api/v1/auth/users/${userId}/role`,
    null,
    { params: { role } }
  );
  return response.data;
};

/**
 * Update user status (activate/deactivate) (admin only)
 */
export const updateUserStatus = async (
  userId: string,
  isActive: boolean,
  token?: string
): Promise<User> => {
  const client = getApiClient(token);
  const response = await client.put<User>(
    `/api/v1/auth/users/${userId}/status`,
    null,
    { params: { is_active: isActive } }
  );
  return response.data;
};
