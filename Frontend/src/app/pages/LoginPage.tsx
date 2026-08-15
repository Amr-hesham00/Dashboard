import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Eye, EyeOff, BarChart3, Lock, Mail, Check,
} from 'lucide-react';

/* ─── constants ─────────────────────────────────────────────────────── */

const MESSAGES = {
  required: 'This field is required.',
  invalidEmail: 'Enter a valid email address.',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FEATURES = [
  'Color-coded KPI cards at a glance',
  'Platform charts and campaign tables',
  'Rule-based optimization recommendations',
];

/* ─── sub-components ────────────────────────────────────────────────── */

/** Checkmark icon used in the feature list */
function FeatureCheck() {
  return (
    <span
      className="flex-shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center mt-[1px]"
      style={{ background: 'rgba(52,211,153,0.18)' }}
    >
      <Check className="w-3 h-3" style={{ color: '#6ee7b7' }} />
    </span>
  );
}

/** Left-hand brand panel (hidden on mobile) */
function BrandPanel() {
  return (
    <aside
      className="hidden lg:flex fixed top-0 left-0 bottom-0 flex-col justify-between overflow-hidden z-0"
      style={{
        width: '46%',
        background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 38%, #2563eb 72%, #2a55d4 100%)',
        padding: 'clamp(2rem, 4vw, 3.5rem)',
      }}
    >
      {/* decorative blobs */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 'min(520px, 60vw)', height: 'min(520px, 60vw)',
          top: -120, left: -100,
          background: 'rgba(255,255,255,0.07)',
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 'min(480px, 55vw)', height: 'min(480px, 55vw)',
          bottom: -140, left: '20%',
          background: 'rgba(59,130,246,0.3)',
          filter: 'blur(40px)',
        }}
      />

      {/* content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        {/* brand */}
        <div className="flex items-center gap-3">
          <div
            className="w-[42px] h-[42px] rounded-[10px] flex items-center justify-center text-white text-xs font-bold tracking-wide"
            style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)' }}
          >
            PM
          </div>
          <span className="text-white text-base font-semibold leading-tight">
            Performance Dashboard
          </span>
        </div>

        <h1
          className="text-white mt-10 mb-4 max-w-[20rem]"
          style={{
            fontSize: 'clamp(1.6rem, 2.5vw, 2.1rem)',
            fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.02em',
          }}
        >
          Reporting your clients actually understand.
        </h1>

        <p
          className="max-w-[21rem] mb-8"
          style={{
            fontSize: '0.95rem', lineHeight: 1.65,
            color: 'rgba(219,234,254,0.88)',
          }}
        >
          Monitor spend, revenue, and ROAS across Meta, Google, Snapchat, and
          TikTok — with clear KPIs and actionable insights.
        </p>

        <ul className="list-none p-0 m-0 space-y-3">
          {FEATURES.map((text) => (
            <li
              key={text}
              className="flex items-start gap-3 text-sm"
              style={{ color: 'rgba(241,245,249,0.92)' }}
            >
              <FeatureCheck />
              {text}
            </li>
          ))}
        </ul>
      </div>

      {/* footer */}
      <p
        className="relative z-10 pt-8 m-0"
        style={{ fontSize: '0.75rem', color: 'rgba(191,219,254,0.55)' }}
      >
        Private dashboard · Phase 1 preview
      </p>
    </aside>
  );
}

/* ─── main component ────────────────────────────────────────────────── */

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [alert, setAlert] = useState<{ message: string; variant: 'info' | 'warning' | 'danger' } | null>(null);

  /* ── validation ─────────────────────────────────────────────────── */

  const validate = useCallback(() => {
    let valid = true;
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setEmailError(MESSAGES.required); valid = false;
    } else if (!EMAIL_RE.test(trimmedEmail)) {
      setEmailError(MESSAGES.invalidEmail); valid = false;
    } else {
      setEmailError('');
    }

    if (!trimmedPassword) {
      setPasswordError(MESSAGES.required); valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  }, [email, password]);

  /* ── handlers ───────────────────────────────────────────────────── */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      sessionStorage.setItem('isLoggedIn', 'true');
      navigate('/clients');
    }, 700);
  };

  const clearFieldError = (field: 'email' | 'password') => {
    if (field === 'email' && emailError) setEmailError('');
    if (field === 'password' && passwordError) setPasswordError('');
    if (alert) setAlert(null);
  };

  /* ── alert colours ─────────────────────────────────────────────── */

  const alertStyles: Record<string, { bg: string; border: string; text: string }> = {
    info:    { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
    danger:  { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' },
  };

  /* ── render ─────────────────────────────────────────────────────── */

  return (
    <div className="relative min-h-screen min-h-[100dvh]">
      {/* ── Left brand panel (desktop only) ── */}
      <BrandPanel />

      {/* ── Right login area ── */}
      <main
        className="flex items-center justify-center min-h-screen min-h-[100dvh]"
        style={{
          marginLeft: 'var(--login-aside-width, 0)',
          width: 'var(--login-main-width, 100%)',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          background: 'radial-gradient(ellipse 70% 45% at 80% 10%, rgba(42,85,212,0.06), transparent), #f1f5f9',
        }}
      >
        <div
          className="w-full max-w-[420px] bg-white border border-slate-200 shadow-lg"
          style={{
            padding: 'clamp(1.75rem, 4vw, 2.25rem)',
            borderRadius: 18,
            animation: 'loginCardIn 0.45s ease both',
          }}
        >
          {/* mobile-only brand */}
          <div className="flex items-center gap-3 mb-7 lg:hidden">
            <div
              className="w-[42px] h-[42px] rounded-[10px] flex items-center justify-center text-white text-xs font-bold tracking-wide"
              style={{ background: '#2a55d4' }}
            >
              PM
            </div>
            <span className="text-base font-semibold leading-tight text-slate-900">
              Performance Dashboard
            </span>
          </div>

          {/* heading */}
          <header>
            <h2
              className="text-slate-900 mb-1"
              style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.02em' }}
            >
              Welcome back
            </h2>
            <p className="text-slate-500 mb-7" style={{ fontSize: '0.9rem' }}>
              Sign in to manage your client dashboards.
            </p>
          </header>

          {/* alert */}
          {alert && (
            <div
              className="flex items-start gap-2 mb-5 text-sm rounded-[10px]"
              style={{
                padding: '0.75rem 0.9rem',
                color: alertStyles[alert.variant].text,
                background: alertStyles[alert.variant].bg,
                border: `1px solid ${alertStyles[alert.variant].border}`,
                animation: 'loginAlertIn 0.25s ease',
              }}
            >
              {alert.message}
            </div>
          )}

          {/* form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="login-email"
                className="block mb-1.5 text-slate-700"
                style={{ fontSize: '0.8125rem', fontWeight: 500 }}
              >
                Email
              </label>
              <div className="relative flex items-center">
                <Mail
                  className="absolute left-3.5 w-4 h-4 pointer-events-none transition-colors"
                  style={{ color: emailError ? '#dc2626' : '#94a3b8' }}
                />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
                  placeholder="Example@gmail.com"
                  autoComplete="email"
                  inputMode="email"
                  spellCheck={false}
                  className="w-full bg-white text-slate-900 outline-none transition-all"
                  style={{
                    padding: '0.7rem 2.75rem 0.7rem 2.65rem',
                    fontSize: '0.9375rem',
                    border: `1px solid ${emailError ? '#dc2626' : '#e2e8f0'}`,
                    borderRadius: 14,
                    boxShadow: emailError ? '0 0 0 3px rgba(220,38,38,0.1)' : undefined,
                  }}
                  onFocus={(e) => {
                    if (!emailError) {
                      e.currentTarget.style.borderColor = '#2a55d4';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(42,85,212,0.12)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!emailError) {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                />
              </div>
              {emailError && (
                <p className="mt-1 text-red-600" style={{ fontSize: '0.8125rem' }} role="alert">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label
                htmlFor="login-password"
                className="block mb-1.5 text-slate-700"
                style={{ fontSize: '0.8125rem', fontWeight: 500 }}
              >
                Password
              </label>
              <div className="relative flex items-center">
                <Lock
                  className="absolute left-3.5 w-4 h-4 pointer-events-none transition-colors"
                  style={{ color: passwordError ? '#dc2626' : '#94a3b8' }}
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full bg-white text-slate-900 outline-none transition-all"
                  style={{
                    padding: '0.7rem 2.75rem 0.7rem 2.65rem',
                    fontSize: '0.9375rem',
                    border: `1px solid ${passwordError ? '#dc2626' : '#e2e8f0'}`,
                    borderRadius: 14,
                    boxShadow: passwordError ? '0 0 0 3px rgba(220,38,38,0.1)' : undefined,
                  }}
                  onFocus={(e) => {
                    if (!passwordError) {
                      e.currentTarget.style.borderColor = '#2a55d4';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(42,85,212,0.12)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!passwordError) {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 p-1.5 bg-transparent border-none cursor-pointer transition-colors"
                  style={{ borderRadius: 8, color: '#94a3b8', lineHeight: 1 }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#0f172a';
                    e.currentTarget.style.background = '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#94a3b8';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1 text-red-600" style={{ fontSize: '0.8125rem' }} role="alert">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Remember / Forgot */}
            <div
              className="flex items-center justify-between gap-4 mb-5"
              style={{ fontSize: '0.875rem' }}
            >
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded border-slate-300 accent-[#2a55d4]"
                />
                <span className="text-slate-600">Remember me</span>
              </label>
              <button
                type="button"
                className="bg-transparent border-none p-0 cursor-pointer font-medium"
                style={{ color: '#2a55d4', fontSize: '0.875rem' }}
                title="Coming soon"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#2344ab';
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#2a55d4';
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 text-white border-none cursor-pointer transition-all"
              style={{
                padding: '0.75rem 1rem',
                fontSize: '0.9375rem',
                fontWeight: 600,
                background: '#2a55d4',
                borderRadius: 14,
                boxShadow: '0 1px 2px rgba(42,85,212,0.2)',
                opacity: loading ? 0.65 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = '#2344ab';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = '#2a55d4';
              }}
              onMouseDown={(e) => {
                if (!loading) e.currentTarget.style.transform = 'scale(0.99)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {loading && (
                <span
                  className="inline-block rounded-full animate-spin"
                  style={{
                    width: '1.1rem', height: '1.1rem',
                    border: '2px solid rgba(255,255,255,0.35)',
                    borderTopColor: '#fff',
                  }}
                />
              )}
              <span>{loading ? 'Signing in…' : 'Sign in'}</span>
            </button>
          </form>

          <p
            className="text-center mt-6 m-0"
            style={{ fontSize: '0.75rem', color: '#94a3b8' }}
          >
            Demo only · Authentication will be added in Phase 2
          </p>
        </div>
      </main>

      {/* ── scoped keyframes + responsive CSS vars ── */}
      <style>{`
        @keyframes loginCardIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes loginAlertIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (min-width: 1024px) {
          :root {
            --login-aside-width: 46%;
            --login-main-width: 54%;
          }
        }
      `}</style>
    </div>
  );
}
