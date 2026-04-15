import React from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminLayout } from './AdminLayout';

export const ProtectedAdminLayout: React.FC = () => {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminLayout />
    </ProtectedRoute>
  );
};
