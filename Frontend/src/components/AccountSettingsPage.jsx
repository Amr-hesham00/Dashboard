import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { useAuth } from '../context/AuthContext';

export default function AccountSettingsPage() {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    phone: '',
    profilePicture: '',
    bio: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        userName: user.userName || user.username || '',
        email: user.email || '',
        phone: user.phone || user.phoneNumber || '',
        profilePicture: user.profilePicture || user.imageUrl || user.avatar || '',
        bio: user.bio || 'Marketing Specialist & Campaign Manager',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    try {
      if (updateUser) {
        updateUser(formData);
      }
      setSuccessMessage('Account profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile.');
    }
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('New password and confirm password do not match.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setSuccessMessage('Password updated successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const displayName = formData.firstName
    ? `${formData.firstName} ${formData.lastName}`.trim()
    : formData.userName || formData.email || 'User Account';

  return (
    <DashboardLayout title="Account Settings | Dasher">
      <div id="content" className="position-relative h-100 p-4">
        <div className="custom-container">
          {/* Breadcrumb Navigation */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb mb-0" style={{ fontSize: '0.88rem' }}>
              <li className="breadcrumb-item">
                <a href="/" data-internal-link="true" className="text-secondary text-decoration-none">
                  Dashboard
                </a>
              </li>
              <li className="breadcrumb-item active fw-medium text-primary" aria-current="page">
                Account Settings
              </li>
            </ol>
          </nav>

          {/* Page Header */}
          <div className="d-flex justify-content-between align-items-center mb-5">
            <div>
              <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.3px' }}>
                Account Settings
              </h2>
              <p className="text-secondary mb-0 small">
                Manage your personal profile, credentials, security preferences, and dashboard settings.
              </p>
            </div>
          </div>

          {/* Feedback Alerts */}
          {successMessage && (
            <div className="alert alert-success alert-dismissible fade show rounded-3 mb-4 shadow-sm" role="alert">
              <i className="ti ti-check-circle me-2 fs-5"></i>
              {successMessage}
              <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
            </div>
          )}
          {errorMessage && (
            <div className="alert alert-danger alert-dismissible fade show rounded-3 mb-4 shadow-sm" role="alert">
              <i className="ti ti-alert-triangle me-2 fs-5"></i>
              {errorMessage}
              <button type="button" className="btn-close" onClick={() => setErrorMessage('')}></button>
            </div>
          )}

          {/* Navigation Tabs */}
          <ul className="nav nav-pills gap-2 mb-5 p-1 bg-dark-subtle rounded-3 d-inline-flex border border-secondary-subtle">
            <li className="nav-item">
              <button
                className={`nav-link px-4 py-2 rounded-2 fw-semibold ${activeTab === 'profile' ? 'active shadow-sm' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <i className="ti ti-user me-2"></i>Profile Details
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link px-4 py-2 rounded-2 fw-semibold ${activeTab === 'security' ? 'active shadow-sm' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <i className="ti ti-lock me-2"></i>Security & Password
              </button>
            </li>
          </ul>

          {/* Tab 1: Profile Details */}
          {activeTab === 'profile' && (
            <div className="row g-5">
              {/* Left Column: Avatar & Overview */}
              <div className="col-xl-4 col-lg-5 col-12">
                <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
                  <div className="position-relative d-inline-block mx-auto mb-3">
                    <div className="user-avatar-container">
                      {formData.profilePicture ? (
                        <img
                          src={formData.profilePicture}
                          alt={displayName}
                          className="avatar avatar-xxl rounded-circle border border-2 border-primary shadow-sm"
                          style={{ width: '110px', height: '110px', objectFit: 'cover' }}
                        />
                      ) : (
                        <span
                          className="avatar avatar-xxl rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm"
                          style={{ width: '110px', height: '110px', backgroundColor: '#081615', border: '2px solid #10b981' }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="54"
                            height="54"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                            <path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                            <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="fw-bold mb-1">{displayName}</h4>
                  <p className="text-secondary small mb-3">@{formData.userName || 'user'}</p>
                  <div className="badge bg-primary-subtle text-primary fw-semibold px-3 py-2 rounded-pill mb-4">
                    {formData.bio}
                  </div>

                  <hr className="my-3 opacity-25" />

                  <div className="text-start small">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="ti ti-mail text-secondary"></i>
                      <span className="text-truncate">{formData.email}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <i className="ti ti-phone text-secondary"></i>
                      <span>{formData.phone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Edit Profile Form */}
              <div className="col-xl-8 col-lg-7 col-12">
                <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
                  <h4 className="fw-bold mb-4">Edit Personal Information</h4>
                  <form onSubmit={handleSaveProfile}>
                    <div className="row g-4">
                      <div className="col-md-6 col-12">
                        <label className="form-label fw-semibold small">First Name</label>
                        <input
                          type="text"
                          className="form-control form-control-lg rounded-3 fs-6"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleProfileChange}
                          placeholder="John"
                          required
                        />
                      </div>
                      <div className="col-md-6 col-12">
                        <label className="form-label fw-semibold small">Last Name</label>
                        <input
                          type="text"
                          className="form-control form-control-lg rounded-3 fs-6"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleProfileChange}
                          placeholder="Doe"
                        />
                      </div>
                      <div className="col-md-6 col-12">
                        <label className="form-label fw-semibold small">Username</label>
                        <input
                          type="text"
                          className="form-control form-control-lg rounded-3 fs-6"
                          name="userName"
                          value={formData.userName}
                          onChange={handleProfileChange}
                          placeholder="johndoe"
                          required
                        />
                      </div>
                      <div className="col-md-6 col-12">
                        <label className="form-label fw-semibold small">Email Address</label>
                        <input
                          type="email"
                          className="form-control form-control-lg rounded-3 fs-6"
                          name="email"
                          value={formData.email}
                          onChange={handleProfileChange}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                      <div className="col-md-6 col-12">
                        <label className="form-label fw-semibold small">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control form-control-lg rounded-3 fs-6"
                          name="phone"
                          value={formData.phone}
                          onChange={handleProfileChange}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                      <div className="col-md-6 col-12">
                        <label className="form-label fw-semibold small">Profile Picture URL</label>
                        <input
                          type="url"
                          className="form-control form-control-lg rounded-3 fs-6"
                          name="profilePicture"
                          value={formData.profilePicture}
                          onChange={handleProfileChange}
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold small">Professional Bio / Title</label>
                        <input
                          type="text"
                          className="form-control form-control-lg rounded-3 fs-6"
                          name="bio"
                          value={formData.bio}
                          onChange={handleProfileChange}
                          placeholder="Campaign Specialist"
                        />
                      </div>
                      <div className="col-12 d-flex justify-content-end gap-3 mt-4">
                        <button type="submit" className="btn btn-primary btn-lg px-5 rounded-3 fw-bold shadow-sm">
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Security & Password */}
          {activeTab === 'security' && (
            <div className="row justify-content-center">
              <div className="col-xl-8 col-lg-10 col-12">
                <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
                  <h4 className="fw-bold mb-1">Change Password</h4>
                  <p className="text-secondary small mb-4">
                    Ensure your account is using a strong, unique password to maintain data security.
                  </p>

                  <form onSubmit={handleSavePassword}>
                    <div className="row g-4">
                      <div className="col-12">
                        <label className="form-label fw-semibold small">Current Password</label>
                        <input
                          type="password"
                          className="form-control form-control-lg rounded-3 fs-6"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      <div className="col-md-6 col-12">
                        <label className="form-label fw-semibold small">New Password</label>
                        <input
                          type="password"
                          className="form-control form-control-lg rounded-3 fs-6"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      <div className="col-md-6 col-12">
                        <label className="form-label fw-semibold small">Confirm New Password</label>
                        <input
                          type="password"
                          className="form-control form-control-lg rounded-3 fs-6"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      <div className="col-12 d-flex justify-content-start gap-3 mt-4">
                        <button type="submit" className="btn btn-primary btn-lg px-5 rounded-3 fw-bold">
                          Update Password
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
