import { useState, useEffect } from 'react';
import { buildApiUrl } from '../utils/api';
import { getCached, setCache } from '../utils/cache';

const USERS_API_URL = buildApiUrl('/users');
const USERS_CACHE_KEY = 'users';
const REQUEST_TIMEOUT_MS = 5000;

export const useUsers = () => {
  const cachedUsers = getCached<any[]>(USERS_CACHE_KEY) ?? [];
  const [users, setUsers] = useState<any[]>(cachedUsers);
  const [loading, setLoading] = useState(cachedUsers.length === 0);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      setError(null);
      const res = await fetch(USERS_API_URL, { signal: controller.signal });
      if (!res.ok) {
        throw new Error('Không thể tải người dùng');
      }

      const data = await res.json();
      const mapped = Array.isArray(data)
        ? data.map((u: any) => ({
            ...u,
            id: u._id || u.id,
            joinDate: u.createdAt ? new Date(u.createdAt) : u.joinDate,
            avatar: u.avatar || '',
          }))
        : [];

      setUsers(mapped);
      setCache(USERS_CACHE_KEY, mapped);
    } catch (error) {
      const fallbackUsers = getCached<any[]>(USERS_CACHE_KEY) ?? [];
      setUsers((current) => (current.length > 0 ? current : fallbackUsers));
      setError(
        error instanceof Error && error.name === 'AbortError'
          ? 'Tải người dùng quá chậm'
          : 'Không thể tải người dùng'
      );
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  const addUser = async (data: any) => {
    await fetch(USERS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await fetchUsers();
  };

  const updateUser = async (id: string, data: any) => {
    await fetch(`${USERS_API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await fetchUsers();
  };

  const deleteUser = async (id: string) => {
    await fetch(`${USERS_API_URL}/${id}`, { method: 'DELETE' });
    await fetchUsers();
  };

  const toggleStatus = async (id: string) => {
    await fetch(`${USERS_API_URL}/${id}/toggle-status`, { method: 'PATCH' });
    await fetchUsers();
  };

  return { users, loading, error, addUser, updateUser, deleteUser, toggleStatus };
};