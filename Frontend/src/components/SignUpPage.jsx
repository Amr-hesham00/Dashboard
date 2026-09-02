import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignUpPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setUserName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!firstName.trim() || !lastName.trim() || !userName.trim() || !email.trim() || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Password and confirmation password do not match.');
      return;
    }

    if (password.length < 3) {
      setErrorMsg('Password must be at least 3 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register({
        userName: userName.trim(),
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
        confirmPassword,
      });

      setSuccessMsg(`Manager account "${userName.trim()}" was created successfully!`);
      resetForm();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register manager.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="d-flex flex-column justify-content-center min-vh-100 py-4">
      <section>
        <div className="container">
          <div className="row mb-3">
            <div className="col-xl-6 offset-xl-3 col-md-12 col-12">
              <div className="text-center">
                <Link to="/" className="fs-2 fw-bold d-flex align-items-center gap-2 justify-content-center mb-2 text-decoration-none">
                  <img src="/assets/images/brand/logo/logo-icon.svg" alt="Dasher Logo" />
                  <span>Dasher</span>
                </Link>
                <h1 className="h3 fw-bold mb-1 text-body-emphasis">Manager Registration</h1>
                <p className="text-secondary small mb-2">
                  Admin authorization required &bull; Creates an active Manager account
                </p>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1.5 rounded-pill fw-semibold">
                  <i className="ti ti-shield-lock me-1"></i> Admin Portal
                </span>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-7 col-md-9 col-12">
              <div className="card shadow-sm border-0 mb-3 rounded-4">
                <div className="card-body p-4 p-md-5">
                  {errorMsg && (
                    <div className="alert alert-danger alert-dismissible fade show py-2.5 px-3 mb-4 rounded-3 d-flex align-items-center justify-content-between" role="alert">
                      <div className="d-flex align-items-center gap-2">
                        <i className="ti ti-alert-circle fs-5"></i>
                        <span>{errorMsg}</span>
                      </div>
                      <button
                        type="button"
                        className="btn-close py-2.5"
                        onClick={() => setErrorMsg('')}
                        aria-label="Close"
                      ></button>
                    </div>
                  )}

                  {successMsg && (
                    <div className="alert alert-success alert-dismissible fade show py-2.5 px-3 mb-4 rounded-3 d-flex align-items-center justify-content-between" role="alert">
                      <div className="d-flex align-items-center gap-2">
                        <i className="ti ti-circle-check fs-5"></i>
                        <span>{successMsg}</span>
                      </div>
                      <button
                        type="button"
                        className="btn-close py-2.5"
                        onClick={() => setSuccessMsg('')}
                        aria-label="Close"
                      ></button>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6 col-12">
                        <label htmlFor="regFirstName" className="form-label fw-semibold fs-6 mb-1.5">
                          First Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control py-2 fs-6"
                          id="regFirstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="e.g. Sarah"
                          required
                          disabled={loading}
                        />
                      </div>

                      <div className="col-md-6 col-12">
                        <label htmlFor="regLastName" className="form-label fw-semibold fs-6 mb-1.5">
                          Last Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control py-2 fs-6"
                          id="regLastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="e.g. Connor"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-md-6 col-12">
                        <label htmlFor="regUsername" className="form-label fw-semibold fs-6 mb-1.5">
                          Username <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control py-2 fs-6"
                          id="regUsername"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="Choose username"
                          required
                          disabled={loading}
                        />
                      </div>

                      <div className="col-md-6 col-12">
                        <label htmlFor="regEmail" className="form-label fw-semibold fs-6 mb-1.5">
                          Email Address <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control py-2 fs-6"
                          id="regEmail"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="manager@agency.com"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-md-6 col-12">
                        <label htmlFor="regPassword" className="form-label fw-semibold fs-6 mb-1.5">
                          Password <span className="text-danger">*</span>
                        </label>
                        <div className="password-field position-relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-control fakePassword py-2 fs-6"
                            id="regPassword"
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

                      <div className="col-md-6 col-12">
                        <label htmlFor="regConfirmPassword" className="form-label fw-semibold fs-6 mb-1.5">
                          Confirm Password <span className="text-danger">*</span>
                        </label>
                        <div className="password-field position-relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-control fakePassword py-2 fs-6"
                            id="regConfirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-3 p-3 bg-body-tertiary rounded-3 border">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <div className="fw-semibold small text-body-emphasis">Assigned Account Role</div>
                          <div className="text-secondary small">Automatically assigned with Manager permissions</div>
                        </div>
                        <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle px-2.5 py-1 rounded-pill fw-semibold">
                          Manager
                        </span>
                      </div>
                    </div>

                    <div className="d-grid gap-2 mt-4">
                      <button className="btn btn-primary py-2.5 fs-6 fw-semibold shadow-sm rounded-3" type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Registering Manager...
                          </>
                        ) : (
                          'Create Manager Account'
                        )}
                      </button>
                      <Link to="/" className="btn btn-outline-secondary py-2 fs-6 rounded-3">
                        Back to Dashboard
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
