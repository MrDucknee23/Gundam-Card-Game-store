import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000';

export const useUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`);
      const data = await res.json();
      const mapped = data.map((u: any) => ({
        ...u,
        id: u._id,
        joinDate: new Date(u.createdAt),
      }));
      setUsers(mapped);
    } catch {
      setError('Không thể tải người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const addUser = async (data: any) => {
    const res = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await fetchUsers();
  };

  const updateUser = async (id: string, data: any) => {
    await fetch(`${API_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await fetchUsers();
  };

  const deleteUser = async (id: string) => {
    await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE' });
    await fetchUsers();
  };

  const toggleStatus = async (id: string) => {
    await fetch(`${API_URL}/api/users/${id}/toggle-status`, { method: 'PATCH' });
    await fetchUsers();
  };

  return { users, loading, error, addUser, updateUser, deleteUser, toggleStatus };
};