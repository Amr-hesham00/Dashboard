import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password || !fullName) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('You must agree to the Terms of Use and Privacy Policy.');
      return;
    }

    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || firstName;
    const finalUserName = username.trim() || email.split('@')[0];

    setLoading(true);
    try {
      await register({
        userName: finalUserName,
        email,
        password,
        firstName,
        lastName,
      });

      setSuccessMsg('Account created successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/pages/authentication/sign-in');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
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
                <Link to="/" className="fs-2 fw-bold d-flex align-items-center gap-2 justify-content-center mb-6">
                  <img src="/assets/images/brand/logo/logo-icon.svg" alt="Dasher Logo" />
                  <span>Dasher</span>
                </Link>
                <h1 className="mb-1">Create Account</h1>
                <p className="mb-0">Sign up now and get free account instant.</p>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8 col-12">
              <div className="card shadow-sm mb-4">
                <div className="card-body p-6">
                  {errorMsg && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                      {errorMsg}
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setErrorMsg('')}
                        aria-label="Close"
                      ></button>
                    </div>
                  )}

                  {successMsg && (
                    <div className="alert alert-success fade show" role="alert">
                      {successMsg}
                    </div>
                  )}

                  <form className="mb-6" onSubmit={handleSubmit} noValidate>
                    <div className="mb-3">
                      <label htmlFor="signupFullnameInput" className="form-label">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="signupFullnameInput"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter full name"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="signupUsernameInput" className="form-label">
                        Username (Optional)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="signupUsernameInput"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose username"
                        disabled={loading}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="signupEmailInput" className="form-label">
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="signupEmailInput"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="formSignUpPassword" className="form-label">
                        Password <span className="text-danger">*</span>
                      </label>
                      <div className="password-field position-relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control fakePassword"
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
                          <i className={`ti ${showPassword ? 'ti-eye' : 'ti-eye-off'} passwordToggler`}></i>
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="formSignUpConfirmPassword" className="form-label">
                        Confirm Password <span className="text-danger">*</span>
                      </label>
                      <div className="password-field position-relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control fakePassword"
                          id="formSignUpConfirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="mb-4 d-flex align-items-center justify-content-between">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="signupCheckTextCheckbox"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                          />
                          <label className="form-check-label ms-2" htmlFor="signupCheckTextCheckbox">
                            <a href="#" onClick={(e) => e.preventDefault()}>Terms of Use</a> & <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="d-grid">
                      <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Registering...
                          </>
                        ) : (
                          'Sign Up'
                        )}
                      </button>
                    </div>
                  </form>

                  <span>Sign up with your social network.</span>
                  <div className="mt-3 d-flex gap-2 justify-content-between">
                    <a href="#" className="btn btn-google w-100" onClick={(e) => e.preventDefault()}>
                      <span className="me-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="ti ti-google" viewBox="0 0 16 16">
                          <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
                        </svg>
                      </span>
                      Continue with Google
                    </a>
                    <a href="#" className="btn btn-facebook w-100" onClick={(e) => e.preventDefault()}>
                      <span className="me-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="ti ti-facebook" viewBox="0 0 16 16">
                          <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                        </svg>
                      </span>
                      Continue with Facebook
                    </a>
                  </div>
                </div>
              </div>
              <span>
                Already have an account?{' '}
                <Link to="/pages/authentication/sign-in" className="text-primary">
                  Sign in here.
                </Link>
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="position-absolute end-0 bottom-0 m-4">
        <div className="dropdown">
          <button className="btn btn-light btn-icon rounded-circle d-flex align-items-center" type="button" data-bs-toggle="dropdown" aria-label="Toggle theme">
            <i className="bi theme-icon-active lh-1"><i class="bi theme-icon bi-sun-fill"></i></i>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow">
            <li>
              <button type="button" className="dropdown-item d-flex align-items-center active" data-bs-theme-value="light">
                <i className="ti theme-icon ti ti-sun"></i>
                <span className="ms-2">Light</span>
              </button>
            </li>
            <li>
              <button type="button" className="dropdown-item d-flex align-items-center" data-bs-theme-value="dark">
                <i className="ti theme-icon ti-moon-stars"></i>
                <span className="ms-2">Dark</span>
              </button>
            </li>
            <li>
              <button type="button" className="dropdown-item d-flex align-items-center" data-bs-theme-value="auto">
                <i className="ti theme-icon ti-circle-half-2"></i>
                <span className="ms-2">Auto</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
