import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, LogOut, Phone, Wrench, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ToastNotification';
import GearLogo from './GearLogo';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  const { currentUser, isAuthenticated, logout } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    addToast('You have been securely signed out.', 'info');
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Services', href: '/#services' },
    { label: 'Why AutoServe', href: '/#about' },
  ];

  const isTransparent = isHome && !scrolled && !mobileOpen;

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isTransparent ? 'bg-transparent border-transparent py-4' : 'border-b border-white/10 py-2.5'
      }`}
      style={!isTransparent ? { background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' } : {}}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={currentUser?.role === 'admin' || currentUser?.role === 'mechanic' ? '/admin' : '/'} className="flex items-center gap-3 group">
            <GearLogo size={40} />
            <span className="text-2xl font-extrabold tracking-tight text-white">
              Auto<span className="text-accent font-light">Serve</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-2">
            {currentUser?.role === 'admin' || currentUser?.role === 'mechanic' ? (
              <span className="text-xs font-bold text-accent px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 flex items-center gap-2">
                <Shield size={14} /> Garage Manager Live Operations
              </span>
            ) : (
              navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`text-xs uppercase tracking-wider font-semibold px-4 py-2 rounded-full transition-all duration-300 ${
                    link.label === 'Home' ? 'text-accent bg-accent/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </a>
              ))
            )}
          </div>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* User Portal Chip for Customer only */}
                {currentUser?.role !== 'admin' && currentUser?.role !== 'mechanic' && (
                  <Link
                    to="/my-garage"
                    className="flex items-center gap-2 text-xs font-bold text-accent bg-accent/10 border border-accent/30 px-4 py-2 rounded-full hover:bg-accent/20 transition-all"
                  >
                    <Wrench size={14} /> My Garage
                  </Link>
                )}

                {/* User Info chip with Phone Number */}
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
                  <div className="w-6 h-6 rounded-full bg-accent/20 text-accent font-bold text-xs flex items-center justify-center">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left leading-tight">
                    <span className="text-xs font-medium text-gray-200 block max-w-[110px] truncate">
                      {currentUser?.name}
                    </span>
                    <span className="text-[10px] text-accent font-mono block">
                      {currentUser?.phone}
                    </span>
                  </div>
                </div>

                {/* Sign Out */}
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-full text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  state={{ from: '/book-service' }}
                  className="text-xs uppercase tracking-wider font-bold text-white px-5 py-2.5 rounded-full border border-white/20 hover:bg-white/10 transition-colors flex items-center gap-1.5"
                >
                  <Phone size={13} className="text-accent" /> Sign In with Phone
                </Link>
                <Link
                  to="/login"
                  state={{ from: '/book-service' }}
                  className="text-xs uppercase tracking-wider font-extrabold text-[#050505] px-6 py-2.5 rounded-full shadow-lg hover:shadow-accent/40 hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #d4af37, #b7791f)' }}
                >
                  Login to Book
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 absolute w-full animate-fade-in shadow-2xl">
          <div className="px-6 py-5 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                {link.label}
              </a>
            ))}

            <div className="pt-4 border-t border-white/10 mt-3 flex flex-col gap-2.5">
              {isAuthenticated ? (
                <>
                  <div className="p-3 bg-white/5 rounded-xl flex items-center justify-between border border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-accent/20 text-accent font-bold text-sm flex items-center justify-center">
                        {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{currentUser?.name}</p>
                        <p className="text-[10px] text-accent font-mono">{currentUser?.phone}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                      className="text-xs font-semibold text-rose-400 hover:text-rose-300"
                    >
                      Sign Out
                    </button>
                  </div>

                  {currentUser?.role === 'admin' || currentUser?.role === 'mechanic' ? (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="w-full text-center text-sm font-bold text-accent bg-accent/10 border border-accent/30 py-3 rounded-xl"
                    >
                      Garage Admin Portal
                    </Link>
                  ) : (
                    <Link
                      to="/my-garage"
                      onClick={() => setMobileOpen(false)}
                      className="w-full text-center text-sm font-bold text-accent bg-accent/10 border border-accent/30 py-3 rounded-xl"
                    >
                      My Garage
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    state={{ from: '/book-service' }}
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center text-sm font-semibold text-white border border-white/20 py-3 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone size={15} className="text-accent" /> Sign In with Phone
                  </Link>
                  <Link
                    to="/login"
                    state={{ from: '/book-service' }}
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-sm font-bold text-[#050505] py-3 rounded-xl text-center shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #d4af37, #b7791f)' }}
                  >
                    Login to Book Service
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
