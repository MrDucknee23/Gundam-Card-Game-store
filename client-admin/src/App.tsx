import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './app/context/AuthContext';
import { ProtectedAdminLayout } from './app/components/ProtectedAdminLayout';

// Admin Pages
import { AdminLogin } from './app/pages/AdminLogin';
import { AdminDashboard } from './app/pages/AdminDashboard';
import { ManageProducts } from './app/pages/ManageProducts';
import { ManageOrders } from './app/pages/ManageOrders';
import { AdminUsers } from './app/pages/AdminUsers';
import { AdminAnalytics } from './app/pages/AdminAnalytics';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route path="/admin" element={<ProtectedAdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<ManageProducts />} />
            <Route path="orders" element={<ManageOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
