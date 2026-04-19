import { RouterProvider } from 'react-router';
import { Toaster } from './components/ui/sonner';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { router } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" visibleToasts={3} expand={false} duration={2200} />
      </CartProvider>
    </AuthProvider>
  );
}