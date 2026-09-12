import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from './ConfirmDialog';

export default function AppBootstrap() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme') || localStorage.getItem('theme') || 'light';
    const effectiveTheme =
      currentTheme === 'auto'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : currentTheme;

    const updateThemeIcons = (theme) => {
      const themeIconActives = document.querySelectorAll('.theme-icon-active');
      themeIconActives.forEach((iconEl) => {
        if (theme === 'dark') {
          iconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-moon text-info"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" /></svg>`;
        } else {
          iconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-sun text-warning"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" /></svg>`;
        }
      });
    };
    updateThemeIcons(effectiveTheme);
  }, [location.pathname]);

  useEffect(() => {
    // 1. Sync initial sidebar state from localStorage
    const savedSidebar = localStorage.getItem('sidebarExpanded');
    if (savedSidebar === 'false') {
      document.documentElement.classList.add('collapsed');
      document.documentElement.classList.remove('expanded');
    } else {
      document.documentElement.classList.remove('collapsed');
      document.documentElement.classList.add('expanded');
    }

    // 2. Sync initial theme mode from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    const effectiveTheme =
      savedTheme === 'auto'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : savedTheme;
    document.documentElement.setAttribute('data-bs-theme', effectiveTheme);

    const updateThemeIcons = (theme) => {
      const themeIconActives = document.querySelectorAll('.theme-icon-active');
      themeIconActives.forEach((iconEl) => {
        if (theme === 'dark') {
          iconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-moon text-info"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" /></svg>`;
        } else {
          iconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-sun text-warning"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" /></svg>`;
        }
      });
    };
    updateThemeIcons(effectiveTheme);

    // 3. Global event delegation for sidebar toggle, theme toggle, link routing, and LOGOUT confirmation
    const handleGlobalClick = (e) => {
      // Check for Logout action click
      const logoutBtn = e.target.closest('.sidebar-logout-btn, [data-action="logout"]');
      const targetTag = e.target.tagName;
      const isLogoutText =
        !logoutBtn &&
        (targetTag === 'A' || targetTag === 'BUTTON' || e.target.closest('a, button')) &&
        (e.target.textContent.trim().toLowerCase().includes('logout') ||
          e.target.textContent.trim().toLowerCase().includes('sign out'));

      if (logoutBtn || isLogoutText) {
        e.preventDefault();
        e.stopPropagation();
        setShowLogoutConfirm(true);
        return;
      }

      // Internal Link Routing
      const internalLink = e.target.closest('a[data-internal-link="true"], a[href^="/"]');
      if (internalLink) {
        const href = internalLink.getAttribute('href');
        const target = internalLink.getAttribute('target');
        if (
          href &&
          href.startsWith('/') &&
          !href.startsWith('//') &&
          target !== '_blank' &&
          !href.startsWith('/assets/') &&
          !href.startsWith('/vendor/') &&
          !href.startsWith('/node_modules/')
        ) {
          e.preventDefault();
          if (window.location.pathname !== href) {
            navigate(href);
          }
          return;
        }
      }

      // Sidebar Toggle
      const toggleBtn = e.target.closest('.sidebar-toggle');
      if (toggleBtn) {
        e.preventDefault();
        const isCollapsed = document.documentElement.classList.contains('collapsed');
        if (isCollapsed) {
          document.documentElement.classList.remove('collapsed');
          document.documentElement.classList.add('expanded');
          localStorage.setItem('sidebarExpanded', 'true');
        } else {
          document.documentElement.classList.add('collapsed');
          document.documentElement.classList.remove('expanded');
          localStorage.setItem('sidebarExpanded', 'false');
        }
        return;
      }

      // Topbar Profile Dropdown Toggle
      const topbarProfileBtn = e.target.closest('#topbarProfileBtn, .topbar-avatar-btn');
      if (topbarProfileBtn) {
        e.preventDefault();
        e.stopPropagation();
        const wrapper = topbarProfileBtn.closest('#topbarProfileDropdownLi, .topbar-profile-dropdown-wrapper') || topbarProfileBtn.parentElement;
        const menu = wrapper ? wrapper.querySelector('#topbarProfileMenu, .profile-menu-dropdown') : null;
        if (menu) {
          const isClosed = !menu.classList.contains('show') || menu.classList.contains('d-none') || menu.style.display === 'none';
          if (isClosed) {
            menu.classList.add('show');
            menu.classList.remove('d-none');
            menu.style.display = 'block';
            topbarProfileBtn.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.35)';
            topbarProfileBtn.style.transform = 'scale(1.04)';
            topbarProfileBtn.setAttribute('aria-expanded', 'true');
          } else {
            menu.classList.remove('show');
            menu.classList.add('d-none');
            menu.style.display = 'none';
            topbarProfileBtn.style.boxShadow = 'none';
            topbarProfileBtn.style.transform = 'scale(1)';
            topbarProfileBtn.setAttribute('aria-expanded', 'false');
          }
        }
        return;
      }

      // Close Topbar Profile Dropdown if clicked outside or on dropdown items
      const isInsideProfileWrapper = e.target.closest('#topbarProfileDropdownLi, .topbar-profile-dropdown-wrapper');
      const isProfileDropdownItem = e.target.closest('.profile-menu-dropdown .dropdown-item');
      if (!isInsideProfileWrapper || isProfileDropdownItem) {
        document.querySelectorAll('#topbarProfileMenu').forEach((menu) => {
          menu.classList.remove('show');
          menu.classList.add('d-none');
          menu.style.display = 'none';
        });
        document.querySelectorAll('#topbarProfileBtn, .topbar-avatar-btn').forEach((btn) => {
          btn.style.boxShadow = 'none';
          btn.style.transform = 'scale(1)';
          btn.setAttribute('aria-expanded', 'false');
        });
      }

      // Offcanvas Dismiss or Backdrop Click Handling
      const isBackdrop = e.target.classList.contains('offcanvas-backdrop');
      const isDismiss = e.target.closest('[data-bs-dismiss="offcanvas"]');
      if (isBackdrop || isDismiss) {
        e.preventDefault();
        e.stopPropagation();
        const openOffcanvas = document.querySelectorAll('.offcanvas.show');
        openOffcanvas.forEach((el) => {
          el.classList.remove('show');
          el.style.visibility = 'hidden';
        });
        document.querySelectorAll('.offcanvas-backdrop').forEach((bd) => bd.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        return;
      }

      // Offcanvas Toggle Button Click Handling
      const offcanvasToggle = e.target.closest('[data-bs-toggle="offcanvas"]');
      if (offcanvasToggle) {
        e.preventDefault();
        e.stopPropagation();
        const targetSelector = offcanvasToggle.getAttribute('href') || offcanvasToggle.getAttribute('data-bs-target');
        if (targetSelector) {
          const targetEl = document.querySelector(targetSelector);
          if (targetEl) {
            const isOpen = targetEl.classList.contains('show');
            document.querySelectorAll('.offcanvas-backdrop').forEach((bd) => bd.remove());
            if (isOpen) {
              targetEl.classList.remove('show');
              targetEl.style.visibility = 'hidden';
              document.body.style.overflow = '';
            } else {
              targetEl.classList.add('show');
              targetEl.style.visibility = 'visible';
              document.body.style.overflow = 'hidden';

              const backdrop = document.createElement('div');
              backdrop.className = 'offcanvas-backdrop fade show';
              backdrop.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.35); backdrop-filter: blur(2px); z-index: 1040; opacity: 0.35; transition: opacity 0.15s linear;';
              document.body.appendChild(backdrop);
            }
          }
        }
        return;
      }

      // Theme Mode Toggle (Light <-> Dark <-> Auto)
      const themeBtn = e.target.closest('.theme-toggle-btn, [data-bs-theme-value]');
      if (themeBtn) {
        const themeValue = themeBtn.getAttribute('data-bs-theme-value');
        const currentTheme = document.documentElement.getAttribute('data-bs-theme') || 'light';
        let targetTheme = 'light';

        if (themeValue) {
          if (themeValue === 'auto') {
            targetTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          } else {
            targetTheme = themeValue;
          }
        } else {
          targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
        }

        localStorage.setItem('theme', themeValue || targetTheme);
        document.documentElement.setAttribute('data-bs-theme', targetTheme);
        updateThemeIcons(targetTheme);

        if (themeValue) {
          document.querySelectorAll('[data-bs-theme-value]').forEach((el) => {
            const isMatch = el.getAttribute('data-bs-theme-value') === themeValue;
            el.classList.toggle('active', isMatch);
            el.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
          });
        }
        return;
      }
    };

    document.addEventListener('click', handleGlobalClick, true);
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, []);

  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    navigate('/pages/authentication/sign-in', { replace: true });
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <ConfirmDialog
      isOpen={showLogoutConfirm}
      title="Confirm Logout"
      message="Are you sure you want to log out of your account? You will need to sign in again to access the dashboard."
      confirmText="Log Out"
      cancelText="Cancel"
      confirmVariant="danger"
      onConfirm={handleConfirmLogout}
      onCancel={handleCancelLogout}
    />
  );
}

