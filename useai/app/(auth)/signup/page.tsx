'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { authAPI } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { useAuthStore } from '@/store/auth.store';

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    websiteUrl: ''
  });

  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  const calculateStrength = (pwd: string): 'none' | 'weak' | 'medium' | 'strong' => {
    if (!pwd) return 'none';
    if (pwd.length < 8) return 'weak';

    let score = 0;
    if (/[a-zA-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score === 1) return 'weak';
    if (score === 2) return 'medium';
    return 'strong';
  };

  const strength = calculateStrength(formData.password);

  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (formData.name.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters';
    }
    if (formData.businessName.trim().length < 2) {
      newErrors.businessName = 'Business name must be at least 2 characters';
    }
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.websiteUrl && formData.websiteUrl.trim() !== '') {
      try {
        new URL(formData.websiteUrl.startsWith('http') ? formData.websiteUrl : `https://${formData.websiteUrl}`);
      } catch {
        newErrors.websiteUrl = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response: any = await authAPI.signup({
        name: formData.name,
        business_name: formData.businessName,
        email: formData.email,
        password: formData.password,
        website_url: formData.websiteUrl
      });

      setAuth(response.token, response.user);
      toast.success("Account created! Let's set up your AI 🚀");
      router.push('/onboarding');
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 409) {
        setApiError('An account with this email already exists');
      } else {
        setApiError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-split signup-split">
      {/* Left Panel - Brand */}
      <div className="auth-brand">
        <div className="auth-logo" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          use<span>AI</span>
        </div>

        <div className="auth-brand-content">
          <h1>Welcome to your AI team.</h1>
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
          <div className="auth-form-header" style={{ marginBottom: '24px' }}>
            <h2>Create your free account</h2>
            <p>14-day free trial on premium features. No credit card required.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} style={{ gap: '16px' }}>
            {apiError && (
              <div className="auth-error-banner">
                {apiError}
              </div>
            )}

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={errors.name ? 'input-error' : ''}
                />
                {errors.name && <div className="field-error">{errors.name}</div>}
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  placeholder="Acme Corp"
                  value={formData.businessName}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={errors.businessName ? 'input-error' : ''}
                />
                {errors.businessName && <div className="field-error">{errors.businessName}</div>}
              </div>
            </div>

            <div className="form-group">
              <label>Work Email *</label>
              <input
                type="email"
                name="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label>Website URL <span style={{ color: 'var(--ink3)', fontWeight: 400 }}>(Optional)</span></label>
              <input
                type="text"
                name="websiteUrl"
                placeholder="https://example.com"
                value={formData.websiteUrl}
                onChange={handleChange}
                disabled={isSubmitting}
                className={errors.websiteUrl ? 'input-error' : ''}
              />
              {errors.websiteUrl && <div className="field-error">{errors.websiteUrl}</div>}
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={errors.password ? 'input-error' : ''}
                />

                {/* Strength Meter */}
                {strength !== 'none' && (
                  <div className="pwd-meter">
                    <div className="pwd-bars">
                      <div className={`pwd-bar ${strength === 'weak' || strength === 'medium' || strength === 'strong' ? (strength === 'weak' ? 'bg-red' : (strength === 'medium' ? 'bg-amber' : 'bg-green')) : ''}`}></div>
                      <div className={`pwd-bar ${strength === 'medium' || strength === 'strong' ? (strength === 'medium' ? 'bg-amber' : 'bg-green') : ''}`}></div>
                      <div className={`pwd-bar ${strength === 'strong' ? 'bg-green' : ''}`}></div>
                    </div>
                    <span className={`pwd-label ${strength === 'weak' ? 'text-red' : (strength === 'medium' ? 'text-amber' : 'text-green')}`}>
                      {strength === 'weak' ? 'Weak' : (strength === 'medium' ? 'Medium' : 'Strong')}
                    </span>
                  </div>
                )}
                {errors.password && <div className="field-error">{errors.password}</div>}
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label>Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={errors.confirmPassword ? 'input-error' : ''}
                />
                {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
              </div>
            </div>

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={isSubmitting || Object.keys(errors).length > 0}
              style={{ marginTop: '16px' }}
            >
              {isSubmitting ? (
                <>
                  <svg className="spinner" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : 'Start your free trial'}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '24px' }}>
            Already have an account? <Link href="/login">Sign in</Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Local Auth Layout Overrides inherited from login */
        body { background: #fff; }
        
        .auth-split {
          display: flex;
          min-height: 100vh;
        }
        
        /* Ensures the form side scrolling is friendly on smaller laptops */
        .signup-split .auth-form-side {
          overflow-y: auto;
          padding: 60px 40px;
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
          position: sticky;
          top: 0;
          height: 100vh;
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
          background: #fff;
        }
        
        .auth-form-container {
          width: 100%;
          max-width: 440px;
          margin: auto;
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
        
        .form-row {
          display: flex;
          gap: 16px;
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
        
        .form-group input {
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

        /* Password Strength Meter */
        .pwd-meter {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }
        .pwd-bars {
          display: flex;
          flex: 1;
          gap: 4px;
        }
        .pwd-bar {
          height: 4px;
          flex: 1;
          background: rgba(0,0,0,0.06);
          border-radius: 2px;
          transition: all 0.3s ease;
        }
        .pwd-bar.bg-red { background: rgb(239, 68, 68); }
        .pwd-bar.bg-amber { background: rgb(245, 158, 11); }
        .pwd-bar.bg-green { background: rgb(34, 197, 94); }
        
        .pwd-label {
          font-size: 11px;
          font-weight: 600;
          min-width: 45px;
          text-align: right;
        }
        .text-red { color: rgb(239, 68, 68); }
        .text-amber { color: rgb(245, 158, 11); }
        .text-green { color: rgb(34, 197, 94); }
        
        .btn-auth-submit {
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
          .auth-brand { height: auto; position: relative; padding: 32px 24px; }
          .auth-features, .auth-stats { display: none; }
          .signup-split .auth-form-side { padding: 40px 24px; }
          .form-row { flex-direction: column; gap: 16px; }
        }
      `}</style>
    </div>
  );
}
