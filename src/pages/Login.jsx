import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Shield, Lock, User, Eye, EyeOff, AlertTriangle, ArrowRight, 
  KeyRound, Sparkles, Clock, Mail, UserPlus, LogIn, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastNotification';
import GearLogo from '../components/GearLogo';

export default function Login() {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  
  // SIGN IN STATE (Direct Login - No OTP)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // CREATE ACCOUNT STATE (Direct Registration - Name, Phone, Email, Password)
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // FORGOT PASSWORD STATE (Direct Reset - Identifier + New Password)
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [shakeError, setShakeError] = useState(false);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);

  const { login, createAccount, resetPassword, lockoutUntil } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Lockout countdown timer
  useEffect(() => {
    if (!lockoutUntil) {
      setLockoutCountdown(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // 1. DIRECT LOGIN (Phone or Email + Password)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (lockoutCountdown > 0) {
      setErrorMessage(`Security lockout active. Please wait ${lockoutCountdown} seconds.`);
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }

    try {
      setIsLoading(true);
      const user = await login(identifier, password);
      addToast(`Welcome back, ${user.name}!`, 'success');
      
      const destination = (user.role === 'admin' || user.role === 'mechanic')
        ? '/admin'
        : (location.state?.from && !location.state.from.startsWith('/admin') ? location.state.from : '/my-garage');
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please verify your email/phone and password.');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      addToast(err.message || 'Authentication error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. CREATE ACCOUNT (Direct Account Creation)
  const handleCreateAccountSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!signupName.trim()) {
      setErrorMessage('Please enter your full name.');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }

    const cleanPhone = signupPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile phone number.');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }

    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }

    try {
      setIsLoading(true);
      const newUser = await createAccount({
        name: signupName,
        phone: signupPhone,
        email: signupEmail,
        password: signupPassword
      });

      addToast(`Account created successfully! Welcome, ${newUser.name}.`, 'success');
      
      const destination = location.state?.from && !location.state.from.startsWith('/admin') ? location.state.from : '/my-garage';
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your details.');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      addToast(err.message || 'Registration error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. FORGOT PASSWORD (Direct Reset)
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!forgotIdentifier.trim()) {
      setErrorMessage('Please enter your registered mobile number or email address.');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }

    if (forgotNewPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword({
        identifier: forgotIdentifier,
        newPassword: forgotNewPassword
      });

      addToast('Password reset successfully! You can now sign in with your new password.', 'success');
      setIdentifier(forgotIdentifier);
      setPassword(forgotNewPassword);
      setAuthMode('login');
      setForgotIdentifier('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to reset password.');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      addToast(err.message || 'Password reset error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (type) => {
    setAuthMode('login');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-accent-light/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-fade-in text-center">
        <Link to="/" className="inline-flex items-center justify-center gap-3 group mb-6">
          <GearLogo size={46} />
          <span className="text-3xl font-extrabold tracking-tight text-white">
            Auto<span className="text-accent font-light">Serve</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          {authMode === 'login' 
            ? 'Sign In to AutoServe' 
            : authMode === 'signup' 
              ? 'Create Your Account' 
              : 'Reset Your Password'}
        </h2>
        <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1.5">
          <Lock size={13} className="text-accent" /> 
          {authMode === 'login' 
            ? 'Sign in using your Email ID or Mobile Phone Number & Password' 
            : authMode === 'signup' 
              ? 'Quick Registration with Name, Phone, Email & Password' 
              : 'Enter your registered details and set a new password'}
        </p>
      </div>

      <div className={`mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 ${shakeError ? 'animate-shake' : ''}`}>
        <div className="glass-panel py-8 px-6 shadow-2xl border border-white/10 sm:rounded-3xl sm:px-10 transition-all duration-300 space-y-5">
          
          {/* AUTH TABS: SIGN IN VS CREATE ACCOUNT */}
          {authMode !== 'forgot' && (
            <div className="grid grid-cols-2 p-1 bg-white/5 rounded-2xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
                className={`py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'login'
                    ? 'bg-gradient-to-r from-accent to-accent-light text-slate-950 shadow-md font-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <LogIn size={14} /> Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setErrorMessage(''); }}
                className={`py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'signup'
                    ? 'bg-gradient-to-r from-accent to-accent-light text-slate-950 shadow-md font-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <UserPlus size={14} /> Create Account
              </button>
            </div>
          )}

          {/* Lockout Warning Banner */}
          {lockoutCountdown > 0 && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3 animate-fade-in">
              <Clock size={20} className="shrink-0 text-rose-400 mt-0.5 animate-spin" />
              <div>
                <h4 className="font-bold text-sm text-rose-200">Security Cooldown Triggered</h4>
                <p className="text-xs text-rose-300 mt-0.5">
                  Too many attempts. Please wait <span className="font-bold text-white underline">{lockoutCountdown}s</span> before retrying.
                </p>
              </div>
            </div>
          )}

          {/* General Error Banner */}
          {errorMessage && lockoutCountdown === 0 && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-2.5 animate-fade-in">
              <AlertTriangle size={18} className="shrink-0 text-rose-400 mt-0.5" />
              <p className="text-xs leading-relaxed font-medium">{errorMessage}</p>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 1: SIGN IN (EMAIL OR PHONE + PASSWORD) */}
          {/* ============================================================ */}
          {authMode === 'login' && (
            <form className="space-y-4 animate-fade-in" onSubmit={handleLoginSubmit}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Email ID or Mobile Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    disabled={lockoutCountdown > 0 || isLoading}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="block w-full pl-10 rounded-xl bg-white/5 py-3 pr-4 text-white placeholder-gray-500 text-sm border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all disabled:opacity-50"
                    placeholder="Email address or mobile number"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Password
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-accent hover:text-accent-light transition-colors flex items-center gap-1"
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />} {showPassword ? 'Hide' : 'Show'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot');
                        setErrorMessage('');
                        setForgotIdentifier(identifier);
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <KeyRound size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={lockoutCountdown > 0 || isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 rounded-xl bg-white/5 py-3 pr-4 text-white placeholder-gray-500 text-sm border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all disabled:opacity-50 font-mono"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || lockoutCountdown > 0}
                className="w-full py-3.5 rounded-xl text-[#050505] font-extrabold text-sm shadow-xl hover:shadow-accent/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #d4af37, #b7791f)' }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#050505] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In to Portal <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-2">
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setErrorMessage(''); }}
                  className="hover:text-accent transition-colors"
                >
                  Need an account? <span className="text-accent font-bold underline">Create Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('forgot');
                    setErrorMessage('');
                    setForgotIdentifier(identifier);
                  }}
                  className="text-gray-400 hover:text-amber-400 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* TAB 2: CREATE ACCOUNT (NAME, PHONE, EMAIL, PASSWORD) */}
          {/* ============================================================ */}
          {authMode === 'signup' && (
            <form onSubmit={handleCreateAccountSubmit} className="space-y-3.5 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User size={15} />
                  </div>
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Rajesh Patil"
                    className="block w-full pl-10 rounded-xl bg-white/5 py-2.5 pr-4 text-white placeholder-gray-500 text-xs border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  Mobile Phone Number *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs text-gray-400 font-mono font-bold">+91</span>
                  <input
                    type="tel"
                    required
                    disabled={isLoading}
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="9822334455"
                    className="block w-full pl-12 rounded-xl bg-white/5 py-2.5 pr-4 text-white placeholder-gray-500 text-xs font-mono border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={15} />
                  </div>
                  <input
                    type="email"
                    required
                    disabled={isLoading}
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="e.g. rajesh@example.com"
                    className="block w-full pl-10 rounded-xl bg-white/5 py-2.5 pr-4 text-white placeholder-gray-500 text-xs border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="text-[11px] text-accent hover:underline flex items-center gap-1"
                  >
                    {showSignupPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <KeyRound size={15} />
                  </div>
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    disabled={isLoading}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="block w-full pl-10 rounded-xl bg-white/5 py-2.5 pr-4 text-white placeholder-gray-500 text-xs border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl text-[#050505] font-extrabold text-sm shadow-xl hover:shadow-accent/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                style={{ background: 'linear-gradient(135deg, #d4af37, #b7791f)' }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#050505] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus size={16} /> Create Account <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
                  className="text-xs text-gray-400 hover:text-accent transition-colors"
                >
                  Already have an account? <span className="text-accent font-bold underline">Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* TAB 3: FORGOT PASSWORD (DIRECT PASSWORD RESET) */}
          {/* ============================================================ */}
          {authMode === 'forgot' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <KeyRound size={15} /> Password Recovery
                </span>
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                >
                  Back to Sign In
                </button>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Registered Mobile Number or Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <User size={15} />
                    </div>
                    <input
                      type="text"
                      required
                      disabled={isLoading}
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder="Mobile number or email address"
                      className="block w-full pl-10 rounded-xl bg-white/5 py-2.5 pr-4 text-white placeholder-gray-500 text-xs border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                      New Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      className="text-[11px] text-accent hover:underline flex items-center gap-1"
                    >
                      {showForgotNewPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <KeyRound size={15} />
                    </div>
                    <input
                      type={showForgotNewPassword ? 'text' : 'password'}
                      required
                      disabled={isLoading}
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="block w-full pl-10 rounded-xl bg-white/5 py-2.5 pr-4 text-white placeholder-gray-500 text-xs border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <KeyRound size={15} />
                    </div>
                    <input
                      type={showForgotNewPassword ? 'text' : 'password'}
                      required
                      disabled={isLoading}
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="block w-full pl-10 rounded-xl bg-white/5 py-2.5 pr-4 text-white placeholder-gray-500 text-xs border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl text-[#050505] font-extrabold text-sm shadow-xl hover:shadow-accent/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  style={{ background: 'linear-gradient(135deg, #d4af37, #b7791f)' }}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-[#050505] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> Reset Password & Sign In
                    </>
                  )}
                </button>
              </form>
            </div>
          )}



        </div>
      </div>
    </div>
  );
}
