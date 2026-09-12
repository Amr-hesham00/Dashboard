import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from './ConfirmDialog';



export default function AccountSettingsPage() {
  const { user, updateUser, logout } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    countryCode: '+1',
    phone: '',
    profilePicture: '',
    bio: '',
    location: '',
    timezone: 'UTC-05:00 Eastern Time (US & Canada)',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [notifications, setNotifications] = useState({
    emailCampaigns: true,
    emailBudget: true,
    emailWeeklyDigest: false,
    smsAlerts: false,
    securityAlerts: true,
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRemoveAvatarConfirm, setShowRemoveAvatarConfirm] = useState(false);
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  const fileInputRef = useRef(null);

const compressAndResizeImage = (dataUrl, maxWidth = 300, maxHeight = 300) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(compressedDataUrl);
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
  });
};

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarImageClick = () => {
    if (formData.profilePicture) {
      setShowFullScreenImage(true);
    } else {
      handleAvatarClick();
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select a valid image file.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('Image size should be less than 10MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (uploadEvent) => {
        const rawDataUrl = uploadEvent.target?.result;
        if (rawDataUrl) {
          const compressedDataUrl = await compressAndResizeImage(rawDataUrl, 2000, 2000);
          setFormData((prev) => ({ ...prev, profilePicture: compressedDataUrl }));
          if (updateUser) {
            updateUser({ profilePicture: compressedDataUrl });
          }
          setSuccessMessage('Profile picture uploaded and saved successfully!');
          setTimeout(() => setSuccessMessage(''), 4000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setShowRemoveAvatarConfirm(true);
  };

  const confirmRemoveAvatar = () => {
    setShowRemoveAvatarConfirm(false);
    setFormData((prev) => ({ ...prev, profilePicture: '' }));
    if (updateUser) {
      updateUser({ profilePicture: '' });
    }
    setSuccessMessage('Profile picture removed successfully.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

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
        location: user.location || 'New York, USA',
        timezone: user.timezone || 'UTC-05:00 Eastern Time (US & Canada)',
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

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    setSuccessMessage('Notification preferences updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3500);
  };



  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setIsSaving(true);

    try {
      if (updateUser) {
        updateUser(formData);
      }
      setSuccessMessage('Account profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: 'Empty', percent: 0, color: 'secondary' };
    if (pwd.length < 6) return { label: 'Too short', percent: 25, color: 'danger' };
    if (pwd.length < 9) return { label: 'Moderate', percent: 60, color: 'warning' };
    const hasNum = /\d/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    if (hasNum && hasSpecial) return { label: 'Strong', percent: 100, color: 'success' };
    return { label: 'Good', percent: 80, color: 'info' };
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

    setSuccessMessage('Password changed and updated successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false);
    logout();
  };

  const displayName = formData.firstName
    ? `${formData.firstName} ${formData.lastName}`.trim()
    : formData.userName || formData.email || 'User Account';

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  return (
    <DashboardLayout title="Account Settings | Dasher">
      <div className="container-fluid px-0 py-2">
        {/* Floating Toast Alert Banner */}
        {successMessage && (
          <div
            className="alert alert-success alert-dismissible fade show rounded-3 mb-4 shadow border-0 bg-success text-white d-flex align-items-center justify-content-between position-sticky top-0 z-3"
            style={{ zIndex: 1050 }}
            role="alert"
          >
            <div className="d-flex align-items-center">
              <i className="ti ti-circle-check me-2 fs-4"></i>
              <span className="fw-semibold">{successMessage}</span>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={() => setSuccessMessage('')}></button>
          </div>
        )}
        {errorMessage && (
          <div
            className="alert alert-danger alert-dismissible fade show rounded-3 mb-4 shadow border-0 bg-danger text-white d-flex align-items-center justify-content-between position-sticky top-0 z-3"
            style={{ zIndex: 1050 }}
            role="alert"
          >
            <div className="d-flex align-items-center">
              <i className="ti ti-alert-triangle me-2 fs-4"></i>
              <span className="fw-semibold">{errorMessage}</span>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={() => setErrorMessage('')}></button>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb mb-0 py-0 bg-transparent small align-items-center">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none fw-semibold text-secondary hover-primary">
                Dashboard
              </Link>
            </li>
            <li className="breadcrumb-item active text-success fw-semibold" aria-current="page">
              Account Settings
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <div className="d-flex align-items-center gap-3">
              <h2 className="fw-bold mb-0 text-body" style={{ letterSpacing: '-0.3px' }}>
                Account Settings
              </h2>
              <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 fw-semibold">
                <i className="ti ti-circle-check me-1"></i> Active
              </span>
            </div>
            <p className="text-secondary mb-0 small mt-1">
              Manage your personal details, login credentials, security preferences, and dashboard alerts.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-4">
          <ul className="nav nav-pills gap-2 p-1 bg-body-secondary rounded-3 d-inline-flex border border-secondary-subtle">
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link px-3 py-2 rounded-2 fw-semibold d-inline-flex align-items-center gap-2 ${activeTab === 'profile' ? 'active shadow-sm' : 'text-body'}`}
                onClick={() => setActiveTab('profile')}
              >
                <i className="ti ti-user fs-5"></i>
                Profile Details
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link px-3 py-2 rounded-2 fw-semibold d-inline-flex align-items-center gap-2 ${activeTab === 'security' ? 'active shadow-sm' : 'text-body'}`}
                onClick={() => setActiveTab('security')}
              >
                <i className="ti ti-shield-lock fs-5"></i>
                Security & Password
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link px-3 py-2 rounded-2 fw-semibold d-inline-flex align-items-center gap-2 ${activeTab === 'notifications' ? 'active shadow-sm' : 'text-body'}`}
                onClick={() => setActiveTab('notifications')}
              >
                <i className="ti ti-bell fs-5"></i>
                Notifications
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link px-3 py-2 rounded-2 fw-semibold d-inline-flex align-items-center gap-2 ${activeTab === 'danger' ? 'active shadow-sm text-danger' : 'text-danger'}`}
                onClick={() => setActiveTab('danger')}
              >
                <i className="ti ti-trash fs-5"></i>
                Account Actions
              </button>
            </li>
          </ul>
        </div>

        {/* TAB 1: Profile Details */}
        {activeTab === 'profile' && (
          <div className="row g-4">
            {/* Left Column: Avatar & Summary Card */}
            <div className="col-xl-4 col-lg-5 col-12">
              <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
                <div className="position-relative d-inline-block mx-auto mb-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="d-none"
                  />
                  <div
                    className="user-avatar-container position-relative rounded-circle overflow-hidden shadow"
                    style={{ width: '110px', height: '110px', cursor: 'pointer' }}
                    onClick={handleAvatarImageClick}
                    title={formData.profilePicture ? 'Click to view in full screen' : 'Click to upload profile picture'}
                  >
                    {formData.profilePicture ? (
                      <img
                        src={formData.profilePicture}
                        alt={displayName}
                        className="avatar avatar-xxl rounded-circle border border-3 border-primary w-100 h-100"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <span
                        className="avatar avatar-xxl rounded-circle d-inline-flex align-items-center justify-content-center w-100 h-100"
                        style={{ backgroundColor: '#081615', border: '3px solid #10b981' }}
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

                    {/* Hover Overlay */}
                    <div
                      className="avatar-overlay position-absolute top-0 start-0 w-100 h-100 rounded-circle d-flex flex-column align-items-center justify-content-center text-white"
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        opacity: 0,
                        transition: 'opacity 0.2s ease-in-out',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                    >
                      <i className={`ti ${formData.profilePicture ? 'ti-maximize' : 'ti-camera'} fs-3 mb-1`}></i>
                      <span style={{ fontSize: '0.68rem', fontWeight: 600 }}>
                        {formData.profilePicture ? 'Fullscreen' : 'Upload'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Upload & Remove Photo Action Buttons */}
                <div className="d-flex flex-column align-items-center justify-content-center gap-1 mt-2 mb-3">
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-primary p-0 text-decoration-none fw-semibold"
                    onClick={handleAvatarClick}
                    style={{ fontSize: '0.78rem' }}
                  >
                    Upload photo
                  </button>
                  {formData.profilePicture && (
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-danger p-0 text-decoration-none fw-semibold"
                      onClick={handleRemoveAvatar}
                      style={{ fontSize: '0.78rem' }}
                    >
                      Remove photo
                    </button>
                  )}
                </div>

                <h4 className="fw-bold mb-1 text-body">{displayName}</h4>
                <p className="text-secondary small mb-2">@{formData.userName || 'user'}</p>
                <div className="badge bg-primary-subtle text-primary fw-semibold px-3 py-2 rounded-pill mb-3">
                  {formData.bio}
                </div>




              </div>
            </div>

            {/* Right Column: Edit Profile Form */}
            <div className="col-xl-8 col-lg-7 col-12">
              <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold mb-0 text-body">Edit Personal Information</h4>
                  <span className="text-secondary small">Fields marked with * are required</span>
                </div>

                <form onSubmit={handleSaveProfile}>
                  <div className="row g-4">
                    <div className="col-md-6 col-12">
                      <label className="form-label fw-semibold small text-body">First Name *</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleProfileChange}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="col-md-6 col-12">
                      <label className="form-label fw-semibold small text-body">Last Name</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleProfileChange}
                        placeholder="Doe"
                      />
                    </div>
                    <div className="col-md-6 col-12">
                      <label className="form-label fw-semibold small text-body">Username *</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        name="userName"
                        value={formData.userName}
                        onChange={handleProfileChange}
                        placeholder="johndoe"
                        required
                      />
                    </div>
                    <div className="col-md-6 col-12">
                      <label className="form-label fw-semibold small text-body">Email Address *</label>
                      <input
                        type="email"
                        className="form-control rounded-3"
                        name="email"
                        value={formData.email}
                        onChange={handleProfileChange}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div className="col-md-6 col-12">
                      <label className="form-label fw-semibold small text-body">Phone Number</label>
                      <div className="input-group">
                        <select
                          className="form-select rounded-start-3"
                          style={{ maxWidth: '110px' }}
                          name="countryCode"
                          value={formData.countryCode || '+1'}
                          onChange={handleProfileChange}
                        >
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+49">🇩🇪 +49</option>
                          <option value="+33">🇫🇷 +33</option>
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+61">🇦🇺 +61</option>
                          <option value="+971">🇦🇪 +971</option>
                          <option value="+966">🇸🇦 +966</option>
                          <option value="+81">🇯🇵 +81</option>
                          <option value="+86">🇨🇳 +86</option>
                          <option value="+55">🇧🇷 +55</option>
                          <option value="+20">🇪🇬 +20</option>
                        </select>
                        <input
                          type="tel"
                          className="form-control rounded-end-3"
                          name="phone"
                          value={formData.phone}
                          onChange={handleProfileChange}
                          placeholder="555-000-0000"
                        />
                      </div>
                    </div>
                    <div className="col-md-6 col-12">
                      <label className="form-label fw-semibold small text-body">Location / Country</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        name="location"
                        value={formData.location}
                        onChange={handleProfileChange}
                        placeholder="New York, USA"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold small text-body">Description</label>
                      <textarea
                        className="form-control rounded-3"
                        rows="3"
                        name="bio"
                        value={formData.bio}
                        onChange={handleProfileChange}
                        placeholder="Enter a brief description..."
                      />
                    </div>
                    <div className="col-12 d-flex justify-content-between align-items-center mt-4 pt-2">
                      <div>
                        {successMessage && (
                          <span className="badge bg-success-subtle text-success p-2 rounded-3 fw-bold">
                            <i className="ti ti-check me-1"></i> Changes saved!
                          </span>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary px-5 py-2 rounded-3 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="ti ti-device-floppy"></i>
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Security & Password */}
        {activeTab === 'security' && (
          <div className="row g-4 justify-content-center">
            {/* Change Password Card */}
            <div className="col-xl-8 col-lg-10 col-12">
              <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div className="p-2 rounded-3 bg-primary-subtle text-primary">
                    <i className="ti ti-key fs-4"></i>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0 text-body">Change Password</h4>
                    <p className="text-secondary small mb-0">
                      Ensure your account is protected with a strong, unique password.
                    </p>
                  </div>
                </div>

                <hr className="my-4 opacity-25" />

                <form onSubmit={handleSavePassword}>
                  <div className="row g-4">
                    <div className="col-12">
                      <label className="form-label fw-semibold small text-body">Current Password *</label>
                      <div className="input-group">
                        <input
                          type={showPassword.current ? 'text' : 'password'}
                          className="form-control rounded-start-3"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPassword((p) => ({ ...p, current: !p.current }))}
                        >
                          <i className={`ti ${showPassword.current ? 'ti-eye-off' : 'ti-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                    <div className="col-md-6 col-12">
                      <label className="form-label fw-semibold small text-body">New Password *</label>
                      <div className="input-group">
                        <input
                          type={showPassword.new ? 'text' : 'password'}
                          className="form-control rounded-start-3"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPassword((p) => ({ ...p, new: !p.new }))}
                        >
                          <i className={`ti ${showPassword.new ? 'ti-eye-off' : 'ti-eye'}`}></i>
                        </button>
                      </div>
                      {/* Password strength meter */}
                      {passwordData.newPassword && (
                        <div className="mt-2">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="small text-secondary" style={{ fontSize: '0.75rem' }}>Strength</span>
                            <span className={`small fw-bold text-${passwordStrength.color}`} style={{ fontSize: '0.75rem' }}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="progress" style={{ height: '5px' }}>
                            <div
                              className={`progress-bar bg-${passwordStrength.color}`}
                              role="progressbar"
                              style={{ width: `${passwordStrength.percent}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 col-12">
                      <label className="form-label fw-semibold small text-body">Confirm New Password *</label>
                      <div className="input-group">
                        <input
                          type={showPassword.confirm ? 'text' : 'password'}
                          className="form-control rounded-start-3"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPassword((p) => ({ ...p, confirm: !p.confirm }))}
                        >
                          <i className={`ti ${showPassword.confirm ? 'ti-eye-off' : 'ti-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                    <div className="col-12 d-flex justify-content-end gap-3 mt-4">
                      <button type="submit" className="btn btn-primary px-5 py-2 rounded-3 fw-bold shadow-sm d-inline-flex align-items-center gap-2">
                        <i className="ti ti-check"></i>
                        Update Password
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Two-Factor Authentication (2FA) */}
              <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="p-2 rounded-3 bg-info-subtle text-info">
                      <i className="ti ti-lock-access fs-4"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-1 text-body">Two-Factor Authentication (2FA)</h5>
                      <p className="text-secondary small mb-0">
                        Add an extra layer of security to your account with authenticator verification.
                      </p>
                    </div>
                  </div>
                  <div className="form-check form-switch fs-4 mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="twoFactorSwitch"
                      checked={twoFactorEnabled}
                      onChange={() => {
                        setTwoFactorEnabled(!twoFactorEnabled);
                        setSuccessMessage(
                          !twoFactorEnabled ? '2-Factor Authentication enabled!' : '2-Factor Authentication disabled.'
                        );
                        setTimeout(() => setSuccessMessage(''), 3000);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
                <h5 className="fw-bold mb-3 text-body">Active Login Sessions</h5>
                <div className="list-group list-group-flush">
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0 py-3 bg-transparent border-secondary-subtle">
                    <div className="d-flex align-items-center gap-3">
                      <i className="ti ti-device-desktop fs-3 text-primary"></i>
                      <div>
                        <div className="fw-semibold text-body">Windows PC - Chrome Browser</div>
                        <small className="text-secondary">New York, USA • Current Active Session</small>
                      </div>
                    </div>
                    <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1">
                      Current
                    </span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center px-0 py-3 bg-transparent border-secondary-subtle">
                    <div className="d-flex align-items-center gap-3">
                      <i className="ti ti-device-mobile fs-3 text-secondary"></i>
                      <div>
                        <div className="fw-semibold text-body">iPhone 15 Pro - Safari</div>
                        <small className="text-secondary">New York, USA • 2 hours ago</small>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger rounded-pill px-3"
                      onClick={() => {
                        setSuccessMessage('Session revoked successfully.');
                        setTimeout(() => setSuccessMessage(''), 3000);
                      }}
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Notifications */}
        {activeTab === 'notifications' && (
          <div className="row g-4 justify-content-center">
            <div className="col-xl-8 col-lg-10 col-12">
              <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
                <h4 className="fw-bold mb-2 text-body">Notification Preferences</h4>
                <p className="text-secondary small mb-4">
                  Choose what email alerts, SMS messages, and dashboard updates you receive.
                </p>

                <div className="d-flex flex-column gap-3">
                  <div className="d-flex justify-content-between align-items-center p-3 rounded-3 bg-body-secondary">
                    <div>
                      <div className="fw-semibold text-body">Campaign Performance Updates</div>
                      <small className="text-secondary">Receive daily notifications when key metric milestones are met.</small>
                    </div>
                    <div className="form-check form-switch fs-4 mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={notifications.emailCampaigns}
                        onChange={() => handleNotificationToggle('emailCampaigns')}
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center p-3 rounded-3 bg-body-secondary">
                    <div>
                      <div className="fw-semibold text-body">Budget Pacing & Spend Alerts</div>
                      <small className="text-secondary">Get notified if ad spend exceeds daily target budgets.</small>
                    </div>
                    <div className="form-check form-switch fs-4 mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={notifications.emailBudget}
                        onChange={() => handleNotificationToggle('emailBudget')}
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center p-3 rounded-3 bg-body-secondary">
                    <div>
                      <div className="fw-semibold text-body">Weekly Performance Digest</div>
                      <small className="text-secondary">Summary PDF report delivered every Monday morning.</small>
                    </div>
                    <div className="form-check form-switch fs-4 mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={notifications.emailWeeklyDigest}
                        onChange={() => handleNotificationToggle('emailWeeklyDigest')}
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center p-3 rounded-3 bg-body-secondary">
                    <div>
                      <div className="fw-semibold text-body">Security & Login Alerts</div>
                      <small className="text-secondary">Instant alerts whenever a new device signs in to your account.</small>
                    </div>
                    <div className="form-check form-switch fs-4 mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={notifications.securityAlerts}
                        onChange={() => handleNotificationToggle('securityAlerts')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Account Actions / Danger Zone */}
        {activeTab === 'danger' && (
          <div className="row g-4 justify-content-center">
            <div className="col-xl-8 col-lg-10 col-12">
              <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 border border-danger-subtle bg-danger-subtle bg-opacity-10">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-2 rounded-3 bg-danger-subtle text-danger">
                    <i className="ti ti-alert-triangle fs-4"></i>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0 text-danger">Danger Zone</h4>
                    <p className="text-secondary small mb-0">
                      Irreversible actions related to your personal account data.
                    </p>
                  </div>
                </div>

                <hr className="my-4 opacity-25" />

                <div className="d-flex flex-column gap-3">
                  <div className="d-flex justify-content-between align-items-center p-3 rounded-3 bg-body">
                    <div>
                      <div className="fw-semibold text-body">Export Account Data</div>
                      <small className="text-secondary">Download a copy of your personal details and activity records in JSON format.</small>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm px-3 rounded-pill"
                      onClick={() => {
                        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
                        const downloadAnchor = document.createElement('a');
                        downloadAnchor.setAttribute('href', dataStr);
                        downloadAnchor.setAttribute('download', `${formData.userName || 'account'}-data.json`);
                        document.body.appendChild(downloadAnchor);
                        downloadAnchor.click();
                        downloadAnchor.remove();
                        setSuccessMessage('Data exported successfully!');
                        setTimeout(() => setSuccessMessage(''), 3000);
                      }}
                    >
                      <i className="ti ti-download me-1"></i> Export Data
                    </button>
                  </div>

                  <div className="d-flex justify-content-between align-items-center p-3 rounded-3 bg-body border border-danger-subtle">
                    <div>
                      <div className="fw-semibold text-danger">Delete Account</div>
                      <small className="text-secondary">Permanently delete your account credentials and associated dashboard profile.</small>
                    </div>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm px-4 rounded-pill fw-bold"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <i className="ti ti-trash me-1"></i> Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Image Preview Modal */}
        {showFullScreenImage && formData.profilePicture && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-2"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.94)',
              zIndex: 2500,
              backdropFilter: 'blur(10px)',
            }}
            onClick={() => setShowFullScreenImage(false)}
          >
            <button
              type="button"
              className="btn btn-light rounded-circle position-absolute top-0 end-0 m-3 m-md-4 shadow-lg d-flex align-items-center justify-content-center border border-2 border-danger-subtle"
              style={{ width: '52px', height: '52px', zIndex: 2600 }}
              onClick={() => setShowFullScreenImage(false)}
              title="Close full screen view"
            >
              <span className="text-danger fw-bold" style={{ fontSize: '2rem', lineHeight: '1' }}>&times;</span>
            </button>
            <div
              className="position-relative d-flex align-items-center justify-content-center w-100 h-100"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={formData.profilePicture}
                alt={displayName}
                className="rounded-4 shadow-lg"
                style={{
                  maxWidth: '98vw',
                  maxHeight: '96vh',
                  minWidth: '350px',
                  objectFit: 'contain',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                }}
              />
            </div>
          </div>
        )}

        {/* Remove Avatar Confirmation Modal */}
        <ConfirmDialog
          isOpen={showRemoveAvatarConfirm}
          title="Remove Profile Picture"
          message="Are you sure you want to remove your profile picture? Your profile will revert to the default avatar."
          confirmText="Yes, Remove Photo"
          cancelText="Cancel"
          confirmVariant="danger"
          onConfirm={confirmRemoveAvatar}
          onCancel={() => setShowRemoveAvatarConfirm(false)}
        />

        {/* Delete Account Modal Confirmation */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Account"
          message="Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently remove your session."
          confirmText="Yes, Delete Account"
          cancelText="Cancel"
          confirmVariant="danger"
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    </DashboardLayout>
  );
}
