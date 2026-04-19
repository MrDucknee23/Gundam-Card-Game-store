import { lazy, Suspense, type ComponentType } from 'react';
import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { ProtectedAdminLayout } from './components/ProtectedAdminLayout';

// Loading fallback
const PageLoading = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Helper: wrap lazy component with Suspense
const lazyPage = (factory: () => Promise<{ default: ComponentType<any> } | { [key: string]: ComponentType<any> }>, namedExport?: string) => {
  const LazyComponent = lazy(() =>
    factory().then(module => {
      if (namedExport) {
        return { default: (module as Record<string, ComponentType<any>>)[namedExport] };
      }
      return module as { default: ComponentType<any> };
    })
  );
  return () => (
    <Suspense fallback={<PageLoading />}>
      <LazyComponent />
    </Suspense>
  );
};

// Customer pages — lazy loaded
const Home = lazyPage(() => import('./pages/Home'), 'Home');
const Shop = lazyPage(() => import('./pages/Shop'), 'Shop');
const ProductDetail = lazyPage(() => import('./pages/ProductDetail'), 'ProductDetail');
const Cart = lazyPage(() => import('./pages/Cart'), 'Cart');
const Checkout = lazyPage(() => import('./pages/Checkout'), 'Checkout');
const Login = lazyPage(() => import('./pages/Login'), 'Login');
const Profile = lazyPage(() => import('./pages/Profile'), 'Profile');
const About = lazyPage(() => import('./pages/About'), 'About');
const Contact = lazyPage(() => import('./pages/Contact'), 'Contact');
const FAQ = lazyPage(() => import('./pages/FAQ'), 'FAQ');
const ReturnPolicy = lazyPage(() => import('./pages/ReturnPolicy'), 'ReturnPolicy');
const ShippingPolicy = lazyPage(() => import('./pages/ShippingPolicy'), 'ShippingPolicy');
const PurchaseGuide = lazyPage(() => import('./pages/PurchaseGuide'), 'PurchaseGuide');
const TermsOfUse = lazyPage(() => import('./pages/TermsOfUse'), 'TermsOfUse');
const PrivacyPolicy = lazyPage(() => import('./pages/PrivacyPolicy'), 'PrivacyPolicy');
const MyOrders = lazyPage(() => import('./pages/MyOrders'), 'MyOrders');
const OrderTracking = lazyPage(() => import('./pages/OrderTracking'), 'OrderTracking');
const AdminLoginWrapper = lazyPage(() => import('./pages/AdminLoginWrapper'), 'AdminLoginWrapper');
const NotFound = lazyPage(() => import('./pages/NotFound'), 'NotFound');

// Admin pages — lazy loaded (chart.js, heavy data only loaded when needed)
const AdminDashboard = lazyPage(() => import('./pages/AdminDashboard'), 'AdminDashboard');
const AddProduct = lazyPage(() => import('./pages/AddProduct'), 'AddProduct');
const ManageProductsEnhanced = lazyPage(() => import('./pages/ManageProductsEnhanced'), 'ManageProductsEnhanced');
const ProductDetails = lazyPage(() => import('./pages/ProductDetails'), 'ProductDetails');
const AdminUsers = lazyPage(() => import('./pages/AdminUsers'), 'AdminUsers');
const AdminCategories = lazyPage(() => import('./pages/AdminCategories'), 'AdminCategories');
const ManageOrders = lazyPage(() => import('./pages/ManageOrders'), 'ManageOrders');
const OrderDetail = lazyPage(() => import('./pages/OrderDetail'), 'OrderDetail');
const InventoryInbound = lazyPage(() => import('./pages/InventoryInbound'), 'InventoryInbound');
const InboundDetail = lazyPage(() => import('./pages/InboundDetail'), 'InboundDetail');
const AdminChatTemplates = lazyPage(() => import('./pages/AdminChatTemplates'), 'AdminChatTemplates');

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
      { path: 'return-policy', Component: ReturnPolicy },
      { path: 'shipping-policy', Component: ShippingPolicy },
      { path: 'purchase-guide', Component: PurchaseGuide },
      { path: 'terms-of-use', Component: TermsOfUse },
      { path: 'privacy-policy', Component: PrivacyPolicy },
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
      { path: 'categories', Component: AdminCategories },
      { path: 'category-attributes', Component: AdminCategories },
      { path: 'inventory/inbound', Component: InventoryInbound },
      { path: 'inventory/inbound/:id', Component: InboundDetail }
      , { path: 'chat-templates', Component: AdminChatTemplates }
    ]
  }
]);