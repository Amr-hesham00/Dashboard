import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from './ConfirmDialog';

export default function AppBootstrap() {
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
          iconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-moon text-info"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.446z" /></svg>`;
        } else {
          iconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-sun text-warning"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" /></svg>`;
        }
      });
    };
    updateThemeIcons(effectiveTheme);

    // 3. Global event delegation for sidebar toggle, theme toggle, and LOGOUT confirmation
    const handleGlobalClick = (e) => {
      // Check for Logout action click
      const logoutBtn = e.target.closest('.sidebar-logout-btn, [data-action="logout"]');
      const targetTag = e.target.tagName;
      const isLogoutText =
        !logoutBtn &&
        (targetTag === 'A' || targetTag === 'BUTTON' || e.target.closest('a, button')) &&
        e.target.textContent.trim().toLowerCase().includes('logout');

      if (logoutBtn || isLogoutText) {
        e.preventDefault();
        e.stopPropagation();
        setShowLogoutConfirm(true);
        return;
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

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
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

