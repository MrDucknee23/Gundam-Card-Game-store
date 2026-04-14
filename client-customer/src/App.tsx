import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './app/context/AuthContext';
import { CartProvider } from './app/context/CartContext';
import { Layout } from './app/components/Layout';
import { ProtectedRoute } from './app/components/ProtectedRoute';

// Customer Pages
import { Home } from './app/pages/Home';
import { Shop } from './app/pages/Shop';
import { Login } from './app/pages/Login';
import { Cart } from './app/pages/Cart';
import { Profile } from './app/pages/Profile';
import { ProductDetails } from './app/pages/ProductDetails';
import { Checkout } from './app/pages/Checkout';
import { OrderTracking } from './app/pages/OrderTracking';
import { MyOrders } from './app/pages/MyOrders';
import { OrderDetail } from './app/pages/OrderDetail';
import { FAQ } from './app/pages/FAQ';
import { Contact } from './app/pages/Contact';
import { About } from './app/pages/About';
import { NotFound } from './app/pages/NotFound';



function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="product/:id" element={<ProductDetails />} />
              <Route path="cart" element={<Cart />} />
              <Route path="login" element={<Login />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="contact" element={<Contact />} />
              <Route path="about" element={<About />} />
              
              <Route path="profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="order-tracking" element={
                <ProtectedRoute>
                  <OrderTracking />
                </ProtectedRoute>
              } />
              <Route path="orders" element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              } />
              <Route path="orders/:id" element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Route>

          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
