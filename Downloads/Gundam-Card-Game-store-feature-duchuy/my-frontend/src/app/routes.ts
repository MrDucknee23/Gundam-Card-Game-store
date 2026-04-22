import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { ProtectedAdminLayout } from './components/ProtectedAdminLayout';
import { About } from './pages/About';
import { AddProduct } from './pages/AddProduct';
import { AdminAnalytics } from './pages/AdminAnalytics';
import { AdminCategories } from './pages/AdminCategories';
import { AdminLiveChat } from './pages/AdminLiveChat';
import { AdminChatTemplates } from './pages/AdminChatTemplates';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLoginWrapper } from './pages/AdminLoginWrapper';
import { AdminStatistics } from './pages/AdminStatistics';
import { AdminUsers } from './pages/AdminUsers';
import { AuthCallback } from './pages/AuthCallback';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Contact } from './pages/Contact';
import { FAQ } from './pages/FAQ';
import { ForgotPassword } from './pages/ForgotPassword';
import { Home } from './pages/Home';
import { InboundDetail } from './pages/InboundDetail';
import { InventoryInbound } from './pages/InventoryInbound';
import { Login } from './pages/Login';
import { ManageOrders } from './pages/ManageOrders';
import { ManageProductsEnhanced } from './pages/ManageProductsEnhanced';
import { MyOrders } from './pages/MyOrders';
import { NotFound } from './pages/NotFound';
import { OrderDetail } from './pages/OrderDetail';
import { OrderTracking } from './pages/OrderTracking';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { ProductDetail } from './pages/ProductDetail';
import { ProductDetails } from './pages/ProductDetails';
import { Profile } from './pages/Profile';
import { PurchaseGuide } from './pages/PurchaseGuide';
import { ResetPassword } from './pages/ResetPassword';
import { ReturnPolicy } from './pages/ReturnPolicy';
import { ShippingPolicy } from './pages/ShippingPolicy';
import { Shop } from './pages/Shop';
import { SupportChat } from './pages/SupportChat';
import { TermsOfUse } from './pages/TermsOfUse';

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
      { path: 'forgot-password', Component: ForgotPassword },
      { path: 'reset-password', Component: ResetPassword },
      { path: 'auth/callback', Component: AuthCallback },
      { path: 'profile', Component: Profile },
      { path: 'about', Component: About },
      { path: 'contact', Component: Contact },
      { path: 'faq', Component: FAQ },
      { path: 'return-policy', Component: ReturnPolicy },
      { path: 'shipping-policy', Component: ShippingPolicy },
      { path: 'purchase-guide', Component: PurchaseGuide },
      { path: 'terms-of-use', Component: TermsOfUse },
      { path: 'privacy-policy', Component: PrivacyPolicy },
      { path: 'orders', Component: MyOrders },
      { path: 'orders/:id', Component: OrderTracking },
      { path: 'support-chat', Component: SupportChat },
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
      { path: 'categories', Component: AdminCategories },
      { path: 'category-attributes', Component: AdminCategories },
      { path: 'chat', Component: AdminLiveChat },
      { path: 'chat-templates', Component: AdminChatTemplates },
      { path: 'statistics', Component: AdminStatistics },
      { path: 'analytics', Component: AdminAnalytics },
      { path: 'inventory/inbound', Component: InventoryInbound },
      { path: 'inventory/inbound/:id', Component: InboundDetail }
    ]
  }
]);