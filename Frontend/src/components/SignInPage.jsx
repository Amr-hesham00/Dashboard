import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAdmin as checkIsAdmin } from '../api/auth';

export default function SignInPage() {
  const [emailOrUserName, setEmailOrUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, user, initialLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const customTarget = location.state?.from?.pathname;

  // If already authenticated, redirect to target or appropriate dashboard
  useEffect(() => {
    if (!initialLoading && isAuthenticated) {
      if (customTarget && customTarget !== '/pages/authentication/sign-in' && customTarget !== '/login') {
        navigate(customTarget, { replace: true });
      } else if (checkIsAdmin(user)) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, initialLoading, navigate, customTarget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!emailOrUserName.trim() || !password) {
      setErrorMsg('Please enter both your email/username and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await login({ emailOrUserName: emailOrUserName.trim(), password });
      const loggedUser = result?.user || user;
      if (customTarget && customTarget !== '/pages/authentication/sign-in' && customTarget !== '/login') {
        navigate(customTarget, { replace: true });
      } else if (checkIsAdmin(loggedUser)) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid username/email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="d-flex flex-column justify-content-center vh-100">
      <section>
        <div className="container">
          <div className="row mb-8">
            <div className="col-xl-4 offset-xl-4 col-md-12 col-12">
              <div className="text-center">
                <Link to="/pages/authentication/sign-in" className="fs-2 fw-bold d-flex align-items-center gap-2 justify-content-center mb-6">
                  <img src="/assets/images/brand/logo/logo-icon.svg" alt="Dasher Logo" />
                  <span>Dasher</span>
                </Link>
                <h1 className="h2 fw-bold mb-1">Welcome Back</h1>
                <p className="text-secondary fs-6 mb-0">Sign in to your account</p>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8 col-12">
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4 p-md-5">
                  {errorMsg && (
                    <div className="alert alert-danger alert-dismissible fade show py-2.5 px-3 mb-3" role="alert">
                      {errorMsg}
                      <button
                        type="button"
                        className="btn-close py-2.5"
                        onClick={() => setErrorMsg('')}
                        aria-label="Close"
                      ></button>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-3">
                      <label htmlFor="signinEmailInput" className="form-label fw-semibold fs-6 mb-1.5">
                        Email or Username <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control py-2 fs-6"
                        id="signinEmailInput"
                        value={emailOrUserName}
                        onChange={(e) => setEmailOrUserName(e.target.value)}
                        placeholder="Enter email or username"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="formSignUpPassword" className="form-label fw-semibold fs-6 mb-1.5">
                        Password <span className="text-danger">*</span>
                      </label>
                      <div className="password-field position-relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control fakePassword py-2 fs-6"
                          id="formSignUpPassword"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                          required
                          disabled={loading}
                        />
                        <span
                          style={{ cursor: 'pointer', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i className={`ti ${showPassword ? 'ti-eye' : 'ti-eye-off'} passwordToggler fs-5`}></i>
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 d-flex align-items-center justify-content-between">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="rememberMeCheckbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label className="form-check-label ms-1" htmlFor="rememberMeCheckbox">
                          Remember me
                        </label>
                      </div>

                      <div>
                        <Link to="/pages/authentication/forget-password" className="text-primary fw-medium">
                          Forgot Password
                        </Link>
                      </div>
                    </div>

                    <div className="d-grid mb-3">
                      <button className="btn btn-primary py-2.5 fs-6 fw-semibold shadow-sm" type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Signing In...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </button>
                    </div>
                  </form>


                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="position-absolute top-0 end-0 m-4">
        <button
          className="btn btn-light btn-icon rounded-circle d-flex align-items-center justify-content-center shadow-sm theme-toggle-btn"
          type="button"
          aria-label="Toggle theme"
          style={{ width: '40px', height: '40px' }}
        >
          <span className="theme-icon-active d-flex align-items-center justify-content-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-sun text-warning">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
              <path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />
            </svg>
          </span>
        </button>
      </div>
    </main>
  );
}
