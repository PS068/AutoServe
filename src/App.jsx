import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import BookService from './pages/BookService';
import BookingSuccess from './pages/BookingSuccess';
import MyGarage from './pages/MyGarage';
import BookingDetails from './pages/BookingDetails';
import AdminDashboard from './pages/AdminDashboard';
import AdminBookingDetails from './pages/AdminBookingDetails';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ToastNotification';

import { useAuth } from './context/AuthContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  if (typeof window !== 'undefined') window.scrollTo(0, 0);
  return null;
}

// Wrapper for Home: If admin or mechanic, redirect straight to /admin operations
function HomeRoute() {
  const { currentUser } = useAuth();
  if (currentUser?.role === 'admin' || currentUser?.role === 'mechanic') {
    return <AdminDashboard />;
  }
  return <Home />;
}

// Wrapper for BookService: Admin should not be shown customer vehicle registration
function BookServiceRoute() {
  const { currentUser } = useAuth();
  if (currentUser?.role === 'admin' || currentUser?.role === 'mechanic') {
    return <AdminDashboard />;
  }
  return <BookService />;
}

const AppLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/my-garage') || location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white">
      <ScrollToTop />
      {!isDashboard && <Navbar />}
      <main className="flex-grow">
        <Routes>
          {/* Public Informational Routes / Auto-routes to /admin for Garage Staff */}
          <Route path="/" element={<HomeRoute />} />
          <Route path="/login" element={<Login />} />

          {/* Strictly Protected Booking & Service Management Routes */}
          <Route 
            path="/book-service" 
            element={
              <ProtectedRoute allowedRoles={['customer', 'admin', 'mechanic']}>
                <BookServiceRoute />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/booking-success" 
            element={
              <ProtectedRoute allowedRoles={['customer', 'admin', 'mechanic']}>
                <BookingSuccess />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/booking/:id" 
            element={
              <ProtectedRoute allowedRoles={['customer', 'admin', 'mechanic']}>
                <BookingDetails />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Customer Garage Route */}
          <Route 
            path="/my-garage" 
            element={
              <ProtectedRoute allowedRoles={['customer', 'admin', 'mechanic']}>
                <MyGarage />
              </ProtectedRoute>
            } 
          />

          {/* Strictly Protected Admin & Garage Staff Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'mechanic']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/booking/:id" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'mechanic']}>
                <AdminBookingDetails />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      {!isDashboard && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <AppLayout />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
