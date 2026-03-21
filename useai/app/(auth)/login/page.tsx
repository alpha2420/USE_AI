'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { authAPI } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { useAuthStore } from '@/store/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response: any = await authAPI.login(email, password);
      // Expected response format: { token: '...', user: {...} }
      setAuth(response.token, response.user);
      toast.success('Welcome back! 👋');
      router.push('/dashboard');
    } catch (err: any) {
      setPassword('');
      const status = err.response?.status;
      if (status === 401) {
        setApiError('Wrong email or password');
      } else if (status === 404) {
        setApiError('No account found with this email');
      } else {
        setApiError('Connection failed. Try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.success('Check your email!');
  };

  return (
    <div className="auth-split">
      {/* Left Panel - Brand */}
      <div className="auth-brand">
        <div className="auth-logo" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          use<span>AI</span>
        </div>

        <div className="auth-brand-content">
          <h1>Welcome back to your AI team.</h1>
          <p>Everything you need to automate your support and sales intelligently.</p>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="af-icon">⚡</div>
              <div>Sub-second response time across all chats</div>
            </div>
            <div className="auth-feature">
              <div className="af-icon">🧠</div>
              <div>Trained specifically on your custom datasets</div>
            </div>
            <div className="auth-feature">
              <div className="af-icon">🗣️</div>
              <div>Fluent in English, Hindi, and 20+ regional languages</div>
            </div>
            <div className="auth-feature">
              <div className="af-icon">🤝</div>
              <div>Seamless human handoff when complex queries arise</div>
            </div>
          </div>

          <div className="auth-stats">
            <div className="auth-stat">
              <div className="as-val">2.5M+</div>
              <div className="as-sub">Chats automated</div>
            </div>
            <div className="auth-stat">
              <div className="as-val">40hrs</div>
              <div className="as-sub">Saved weekly</div>
            </div>
            <div className="auth-stat">
              <div className="as-val">24/7</div>
              <div className="as-sub">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Sign in to your account</h2>
            <p>Enter your details to access your dashboard.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {apiError && (
              <div className="auth-error-banner">
                {apiError}
              </div>
            )}

            <div className="form-group">
              <label>Work Email</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                disabled={isSubmitting}
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>Password</label>
                <a href="#" className="forgot-link" onClick={handleForgotPassword}>Forgot password?</a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                disabled={isSubmitting}
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && <div className="field-error">{errors.password}</div>}
            </div>

            <div className="form-group checkbox-group">
              <input type="checkbox" id="remember" disabled={isSubmitting} />
              <label htmlFor="remember" style={{ margin: 0, fontWeight: 400, color: 'var(--ink3)' }}>Remember for 30 days</label>
            </div>

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={isSubmitting || Object.keys(errors).length > 0}
            >
              {isSubmitting ? (
                <>
                  <svg className="spinner" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account? <Link href="/signup">Sign up free</Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Local Auth Layout Overrides */
        body { background: #fff; }
        
        .auth-split {
          display: flex;
          min-height: 100vh;
        }
        
        .auth-brand {
          flex: 1;
          background: #0D1117;
          color: white;
          padding: 40px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        
        .auth-brand::before {
          content: '';
          position: absolute;
          top: -200px;
          left: -200px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255,69,0,0.15), transparent 70%);
          filter: blur(60px);
        }
        
        .auth-brand::after {
          content: '';
          position: absolute;
          bottom: -200px;
          right: -200px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(56,189,248,0.15), transparent 70%);
          filter: blur(60px);
        }
        
        .auth-logo {
          font-family: var(--sans);
          font-size: 24px;
          font-weight: 800;
          color: white;
          letter-spacing: -0.5px;
          position: relative;
          z-index: 2;
        }
        
        .auth-logo span {
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .auth-brand-content {
          margin: auto 0;
          max-width: 480px;
          position: relative;
          z-index: 2;
        }
        
        .auth-brand-content h1 {
          font-family: var(--sans);
          font-size: 36px;
          letter-spacing: -1px;
          line-height: 1.1;
          margin-bottom: 16px;
        }
        
        .auth-brand-content p {
          color: rgba(255,255,255,0.6);
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 40px;
        }
        
        .auth-features {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 60px;
        }
        
        .auth-feature {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 15px;
          color: rgba(255,255,255,0.9);
        }
        
        .af-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        
        .auth-stats {
          display: flex;
          gap: 40px;
          padding-top: 40px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        
        .as-val {
          font-family: var(--sans);
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 4px;
        }
        
        .as-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
        }
        
        .auth-form-side {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: #fff;
        }
        
        .auth-form-container {
          width: 100%;
          max-width: 400px;
        }
        
        .auth-form-header {
          margin-bottom: 32px;
        }
        
        .auth-form-header h2 {
          font-family: var(--sans);
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
          color: var(--ink);
        }
        
        .auth-form-header p {
          color: var(--ink3);
          font-size: 15px;
        }
        
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .auth-error-banner {
          background: rgba(239, 68, 68, 0.1);
          color: rgb(220, 38, 38);
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .form-group label {
          font-size: 14px;
          font-weight: 600;
          color: var(--ink2);
        }
        
        .form-group input[type="email"],
        .form-group input[type="password"] {
          padding: 12px 16px;
          border-radius: 10px;
          border: 1.5px solid rgba(0,0,0,0.1);
          font-family: var(--sans);
          font-size: 15px;
          transition: all 0.2s;
          outline: none;
        }
        
        .form-group input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(232,66,10,0.1);
        }
        
        .form-group input.input-error {
          border-color: rgb(239, 68, 68);
        }
        .form-group input.input-error:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
        
        .form-group input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        .field-error {
          color: rgb(239, 68, 68);
          font-size: 13px;
          margin-top: 2px;
        }
        
        .forgot-link {
          font-size: 13px;
          color: var(--accent);
          text-decoration: none;
          font-weight: 500;
        }
        
        .forgot-link:hover {
          text-decoration: underline;
        }
        
        .checkbox-group {
          flex-direction: row;
          align-items: center;
          gap: 8px;
        }
        
        .btn-auth-submit {
          margin-top: 8px;
          padding: 14px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color: #fff;
          border: none;
          font-family: var(--sans);
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .btn-auth-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(232,66,10,0.3);
        }
        
        .btn-auth-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .spinner {
          width: 18px;
          height: 18px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .auth-footer {
          margin-top: 32px;
          text-align: center;
          font-size: 14px;
          color: var(--ink3);
        }
        
        .auth-footer a {
          color: var(--accent);
          text-decoration: none;
          font-weight: 600;
        }
        
        .auth-footer a:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 900px) {
          .auth-split { flex-direction: column; }
          .auth-brand { flex: none; padding: 32px 24px; }
          .auth-features, .auth-stats { display: none; }
          .auth-form-side { padding: 40px 24px; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
