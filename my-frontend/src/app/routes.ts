import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { ProtectedAdminLayout } from './components/ProtectedAdminLayout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { AdminLoginWrapper } from './pages/AdminLoginWrapper';
import { Profile } from './pages/Profile';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { FAQ } from './pages/FAQ';
import { MyOrders } from './pages/MyOrders';
import { OrderTracking } from './pages/OrderTracking';
import { AdminDashboard } from './pages/AdminDashboard';
import { AddProduct } from './pages/AddProduct';
import { ManageProductsEnhanced } from './pages/ManageProductsEnhanced';
import { ProductDetails } from './pages/ProductDetails';
import { AdminStatistics } from './pages/AdminStatistics';
import { AdminUsers } from './pages/AdminUsers';
import { AdminAnalytics } from './pages/AdminAnalytics';
import { ManageOrders } from './pages/ManageOrders';
import { OrderDetail } from './pages/OrderDetail';
import { InventoryInbound } from './pages/InventoryInbound';
import { InboundDetail } from './pages/InboundDetail';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'shop', Component: Shop },
      { path: 'product/:id', Component: ProductDetail },
      { path: 'cart', Component: Cart },
      { path: 'checkout', Component: Checkout },
      { path: 'login', Component: Login },
      { path: 'profile', Component: Profile },
      { path: 'about', Component: About },
      { path: 'contact', Component: Contact },
      { path: 'faq', Component: FAQ },
      { path: 'orders', Component: MyOrders },
      { path: 'orders/:id', Component: OrderTracking },
      { path: '*', Component: NotFound }
    ]
  },
  {
    path: '/admin/login',
    Component: AdminLoginWrapper
  },
  {
    path: '/admin',
    Component: ProtectedAdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: 'add-product', Component: AddProduct },
      { path: 'products', Component: ManageProductsEnhanced },
      { path: 'products/:id', Component: ProductDetails },
      { path: 'products/:id/edit', Component: AddProduct },
      { path: 'orders', Component: ManageOrders },
      { path: 'orders/:id', Component: OrderDetail },
      { path: 'users', Component: AdminUsers },
      { path: 'statistics', Component: AdminStatistics },
      { path: 'analytics', Component: AdminAnalytics },
      { path: 'inventory/inbound', Component: InventoryInbound },
      { path: 'inventory/inbound/:id', Component: InboundDetail }
    ]
  }
]);