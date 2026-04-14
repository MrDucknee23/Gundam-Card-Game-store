import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000';

export const useUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useContext(AuthContext);
  const fetchUsers = async () => {
    try {
      let res;
      if (user && user.token) {
        res = await fetch(`${API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      } else {
        res = await fetch(`${API_URL}/api/users`);
      }
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
    if (!user || !user.token) return;
    await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      body: JSON.stringify(data),
    });
    await fetchUsers();
  };

  const updateUser = async (id: string, data: any) => {
    if (!user || !user.token) return;
    await fetch(`${API_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      body: JSON.stringify(data),
    });
    await fetchUsers();
  };

  const deleteUser = async (id: string) => {
    if (!user || !user.token) return;
    await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${user.token}` } });
    await fetchUsers();
  };

  const toggleStatus = async (id: string) => {
    if (!user || !user.token) return;
    await fetch(`${API_URL}/api/users/${id}/toggle-status`, { method: 'PATCH', headers: { Authorization: `Bearer ${user.token}` } });
    await fetchUsers();
  };

  return { users, loading, error, addUser, updateUser, deleteUser, toggleStatus };
};