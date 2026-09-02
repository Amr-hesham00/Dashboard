import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleName } from '../api/auth';

export default function DashboardLayout({ children, title = 'Dasher - Dashboard' }) {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    document.title = title;
  }, [title]);

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.userName || user?.email || 'User Account';

  const userEmail = user?.email || '';
  const userRole = getRoleName(user?.role);
  const userAvatar = user?.profilePicture || user?.imageUrl || user?.avatar || user?.image || user?.photoUrl;

  const navItems = isAdmin
    ? [
        {
          to: '/admin',
          label: 'Admin Management',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-shield-lock">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3" />
              <path d="M12 11m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
              <path d="M12 12l0 2.5" />
            </svg>
          ),
        },
      ]
    : [
        {
          to: '/',
          label: 'Overview',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-layout-dashboard">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 4h6v8h-6z" />
              <path d="M4 16h6v4h-6z" />
              <path d="M14 12h6v8h-6z" />
              <path d="M14 4h6v4h-6z" />
            </svg>
          ),
        },
        {
          to: '/clients',
          label: 'Clients',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-users">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
              <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
            </svg>
          ),
        },
        {
          to: '/campaigns',
          label: 'Campaigns',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-speakerphone">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M18 8a3 3 0 0 1 0 6" />
              <path d="M10 8v11a1 1 0 0 1 -1 1h-1a1 1 0 0 1 -1 -1v-5" />
              <path d="M12 8h0l4.524 -3.77a.9 .9 0 0 1 1.476 .692v12.156a.9 .9 0 0 1 -1.476 .692l-4.524 -3.77h-8a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h8" />
            </svg>
          ),
        },
        {
          to: '/insights',
          label: 'Insights',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-bulb">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7" />
              <path d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3" />
              <path d="M9.7 17l4.6 0" />
            </svg>
          ),
        },
        {
          to: '/reports',
          label: 'Reports',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-file-analytics">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
              <path d="M9 17l0 -5" />
              <path d="M12 17l0 -1" />
              <path d="M15 17l0 -3" />
            </svg>
          ),
        },
        {
          to: '/team',
          label: 'Team',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-users-group">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
              <path d="M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1" />
              <path d="M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
              <path d="M17 10h2a2 2 0 0 1 2 2v1" />
              <path d="M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
              <path d="M3 13v-1a2 2 0 0 1 2 -2h2" />
            </svg>
          ),
        },
      ];

  const renderSidebarContent = () => (
    <div id="miniSidebar" className="d-flex flex-column h-100 justify-content-between">
      <div className="brand-logo">
        <Link className="d-flex align-items-center gap-2 text-decoration-none" to={isAdmin ? '/admin' : '/'}>
          <img src="/assets/images/brand/logo/logo-icon.svg" alt="Dasher Logo" />
          <span className="fw-bold fs-4 site-logo-text text-body">Dasher</span>
        </Link>
      </div>

      <ul className="navbar-nav flex-column flex-grow-1">
        <li className="nav-item">
          <div className="nav-heading">{isAdmin ? 'Administration' : 'Management'}</div>
          <hr className="mx-4 nav-line mb-2" />
        </li>
        {navItems.map((item) => {
          const isActive = currentPath === item.to || (item.to !== '/' && currentPath.startsWith(item.to));
          return (
            <li className="nav-item" key={item.to}>
              <Link
                className={`nav-link ${isActive ? 'active' : ''}`}
                to={item.to}
                title={item.label}
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                data-bs-title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="text">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Pinned Bottom Account Card with Right Hover/Focus Flyout */}
      <div className="sidebar-account-footer p-3 w-100 mt-auto">
        <div className="sidebar-account-card-wrapper position-relative">
          <Link
            to="/account-settings"
            className="card border-0 shadow-sm rounded-4 overflow-hidden sidebar-account-card text-decoration-none"
            title="Account Settings"
            data-bs-toggle="tooltip"
            data-bs-placement="right"
            data-bs-title="Account Settings"
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: currentPath === '/account-settings' ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-3">
                <div className="user-avatar-container position-relative flex-shrink-0">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={displayName}
                      className="avatar avatar-md rounded-circle user-sidebar-avatar"
                      style={{ width: '40px', height: '40px', objectFit: 'cover', border: '1.5px solid #10b981' }}
                    />
                  ) : (
                    <span
                      className="avatar avatar-md rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm"
                      style={{ width: '40px', height: '40px', backgroundColor: '#081615', border: '1.5px solid #10b981' }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="icon icon-tabler icons-tabler-outline icon-tabler-user"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                        <path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                        <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="overflow-hidden me-auto text-start">
                  <h6 className="mb-0 text-truncate fw-bold text-white sidebar-user-name" style={{ fontSize: '0.92rem', letterSpacing: '-0.2px' }}>
                    {displayName}
                  </h6>
                  <small className="text-truncate d-block sidebar-user-email" style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    {userRole} &bull; {userEmail}
                  </small>
                </div>
                <span className="ms-1 text-secondary opacity-75">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M9 6l6 6l-6 6" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>

          {/* Right Flyout Menu */}
          <div className="sidebar-account-flyout">
            <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
              <li>
                <Link className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 text-light rounded-2" to="/account-settings">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
                    <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                  </svg>
                  Account Setting
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 text-light rounded-2" to="/admin">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3" />
                      <path d="M12 11m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                      <path d="M12 12l0 2.5" />
                    </svg>
                    Admin Management
                  </Link>
                </li>
              )}
              <li>
                <Link className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 text-light rounded-2" to="/pages/authentication/forget-password">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z" />
                    <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
                    <path d="M8 11v-4a4 4 0 1 1 8 0v4" />
                  </svg>
                  Forgot Password
                </Link>
              </li>
              <li>
                <Link className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 text-light rounded-2" to="/pages/authentication/reset-password">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -5v5h5" />
                    <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 5v-5h-5" />
                  </svg>
                  Reset Password
                </Link>
              </li>
              <li><hr className="dropdown-divider bg-secondary opacity-25 my-1" /></li>
              <li>
                <button type="button" className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 text-danger rounded-2 sidebar-logout-btn w-100 text-start bg-transparent border-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                    <path d="M9 12h12l-3 -3" />
                    <path d="M18 15l3 -3" />
                  </svg>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Vertical Sidebar */}
      <div className="navbar-vertical navbar">
        {renderSidebarContent()}
      </div>

      {/* Mobile Offcanvas Sidebar */}
      <div className="offcanvasNav offcanvas offcanvas-start" tabIndex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
        <div className="offcanvas-body p-0">
          {renderSidebarContent()}
        </div>
      </div>

      {/* Main Content Shell */}
      <div id="content" className="position-relative d-flex flex-column min-vh-100">
        {/* Top Navbar */}
        <div className="navbar-glass navbar navbar-expand-lg px-0 px-lg-4">
          <div className="container-fluid px-lg-0">
            <div className="d-flex align-items-center gap-4">
              {/* Mobile Menu Toggle */}
              <div className="d-block d-lg-none">
                <a className="text-inherit" data-bs-toggle="offcanvas" href="#offcanvasExample" role="button" aria-controls="offcanvasExample">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-menu-2">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M4 6l16 0" />
                    <path d="M4 12l16 0" />
                    <path d="M4 18l16 0" />
                  </svg>
                </a>
              </div>

              {/* Desktop Sidebar Collapse Button */}
              <div className="d-none d-lg-block">
                <button type="button" className="sidebar-toggle btn p-2 d-flex align-items-center texttooltip border-0 bg-transparent" data-template="collapseMessage" aria-label="Toggle sidebar">
                  <span className="collapse-mini">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-bar-left text-secondary">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M4 12l10 0" />
                      <path d="M4 12l4 4" />
                      <path d="M4 12l4 -4" />
                      <path d="M20 4l0 16" />
                    </svg>
                  </span>
                  <span className="collapse-expanded">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-bar-right text-secondary">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M20 12l-10 0" />
                      <path d="M20 12l-4 4" />
                      <path d="M20 12l-4 -4" />
                      <path d="M4 4l0 16" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>

            {/* Navbar Controls */}
            <ul className="list-unstyled d-flex align-items-center mb-0 gap-2">
              {/* Search button (⌘K) */}
              <li>
                <button type="button" className="btn btn-white" data-bs-toggle="modal" data-bs-target="#searchModal">
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-search">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <circle cx="10" cy="10" r="7" />
                      <line x1="21" y1="21" x2="15" y2="15" />
                    </svg>
                  </span>
                  <small className="ms-1">⌘K</small>
                </button>
              </li>

              {/* Light / Dark Mode Direct Toggle */}
              <li>
                <button
                  className="btn btn-light btn-icon rounded-circle d-flex align-items-center justify-content-center shadow-sm theme-toggle-btn"
                  type="button"
                  aria-label="Toggle theme"
                  style={{ width: '38px', height: '38px' }}
                >
                  <span className="theme-icon-active d-flex align-items-center justify-content-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-sun text-warning">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                      <path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />
                    </svg>
                  </span>
                </button>
              </li>

              {/* Bell Notification Icon */}
              <li>
                <a
                  className="position-relative btn-icon btn-ghost btn rounded-circle"
                  data-bs-toggle="offcanvas"
                  href="#offcanvasNotification"
                  role="button"
                  aria-controls="offcanvasNotification"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-bell">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" />
                    <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
                  </svg>
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger mt-2 ms-n2">
                    2
                    <span className="visually-hidden">unread messages</span>
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Page Inner Content */}
        <div className="custom-container px-4 pt-2 pb-4 flex-grow-1">
          {children}
        </div>

        {/* Footer */}
        <footer className="py-4 mt-auto">
          <p className="text-center text-secondary small mb-0">
            © 2026 All rights reserved.
          </p>
        </footer>
      </div>

      {/* Offcanvas Notifications Drawer */}
      <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasNotification" aria-labelledby="offcanvasNotificationLabel">
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0 fw-bold text-body" id="offcanvasNotificationLabel">Notifications</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body p-4">
          <div className="list-group list-group-flush">
            <div className="list-group-item px-0 py-3 border-bottom bg-transparent">
              <div className="d-flex align-items-start gap-3">
                <span className="avatar rounded-circle bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                  <i className="ti ti-bell fs-5"></i>
                </span>
                <div>
                  <h6 className="mb-1 fw-semibold text-body">New Client Onboarded</h6>
                  <p className="small text-secondary mb-1">Acme Corp was successfully registered.</p>
                  <span className="small text-muted">10 mins ago</span>
                </div>
              </div>
            </div>
            <div className="list-group-item px-0 py-3 border-bottom bg-transparent">
              <div className="d-flex align-items-start gap-3">
                <span className="avatar rounded-circle bg-success-subtle text-success p-2 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                  <i className="ti ti-check fs-5"></i>
                </span>
                <div>
                  <h6 className="mb-1 fw-semibold text-body">Campaign Approved</h6>
                  <p className="small text-secondary mb-1">Summer Sale campaign is now active.</p>
                  <span className="small text-muted">1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Search Modal */}
      <div className="modal fade" id="searchModal" tabIndex="-1" aria-labelledby="searchModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0">
              <input
                type="search"
                className="form-control border-0 rounded-0 ps-0 form-focus-none"
                id="globalSearchInput"
                placeholder="Search any word..."
                aria-label="Search"
                aria-describedby="search-addon"
              />
              <button type="button" className="btn btn-primary btn-sm px-3 d-flex align-items-center gap-1 rounded-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-search">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <circle cx="10" cy="10" r="7" />
                  <line x1="21" y1="21" x2="15" y2="15" />
                </svg>
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
