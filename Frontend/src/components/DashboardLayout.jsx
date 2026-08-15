import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import HtmlPage from './HtmlPage';
import blankHtml from '../content/pages/blank.html?raw';
import { useAuth } from '../context/AuthContext';

const blankScripts = [
  '/vendor/bootstrap/dist/js/bootstrap.bundle.min.js',
  '/vendor/simplebar/dist/simplebar.min.js',
  '/assets/js/main.js',
  '/assets/js/vendors/sidebarnav.js',
];

export default function DashboardLayout({ children, title = 'Dasher - Dashboard' }) {
  const { user, logout } = useAuth();
  const [container, setContainer] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const el = document.querySelector('.custom-container');
      if (el) {
        // Clear placeholder layout items in blank.html and create mount point
        el.innerHTML = '<div id="portal-root"></div>';
        setContainer(el.querySelector('#portal-root'));
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Dynamic sidebar user profile binding
    if (user) {
      const displayName = user.firstName
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : user.userName || user.email || 'User Account';
      const email = user.email || '';
      const userImage = user.profilePicture || user.imageUrl || user.avatar || user.image || user.photoUrl;

      const sidebarUserNames = document.querySelectorAll('.sidebar-user-name');
      const sidebarUserEmails = document.querySelectorAll('.sidebar-user-email');
      const userContainers = document.querySelectorAll('.user-avatar-container');

      sidebarUserNames.forEach((el) => (el.textContent = displayName));
      sidebarUserEmails.forEach((el) => {
        el.textContent = email;
        el.style.color = '#94a3b8';
      });

      userContainers.forEach((containerEl) => {
        if (userImage) {
          containerEl.innerHTML = `<img src="${userImage}" alt="${displayName}" class="avatar avatar-md rounded-circle user-sidebar-avatar" style="width: 40px; height: 40px; object-fit: cover; border: 1.5px solid #10b981;" />`;
        } else {
          containerEl.innerHTML = `<span class="avatar avatar-md rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm" style="width: 40px; height: 40px; background-color: #081615; border: 1.5px solid #10b981;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-user"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" /></svg></span>`;
        }
      });
    }

    const cleanups = [];
    // Logout confirmation and theme toggles are handled globally by AppBootstrap event delegation

    // Sidebar toggles are handled globally by AppBootstrap event delegation

    // Direct Theme Mode Toggle (Light <-> Dark)
    const applyTheme = (theme) => {
      const targetTheme = theme === 'dark' ? 'dark' : 'light';
      localStorage.setItem('theme', targetTheme);
      document.documentElement.setAttribute('data-bs-theme', targetTheme);

      const themeIconActives = document.querySelectorAll('.theme-icon-active');
      themeIconActives.forEach((iconEl) => {
        if (targetTheme === 'dark') {
          iconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-moon text-info"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.446z" /></svg>`;
        } else {
          iconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-sun text-warning"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" /></svg>`;
        }
      });
    };

    const storedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(storedTheme);

    const themeBtns = document.querySelectorAll('.theme-toggle-btn, [data-bs-theme-value]');
    themeBtns.forEach((btn) => {
      const handleTheme = (e) => {
        e.preventDefault();
        const current = document.documentElement.getAttribute('data-bs-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      };
      btn.addEventListener('click', handleTheme);
      cleanups.push(() => btn.removeEventListener('click', handleTheme));
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [container, user, logout]);

  return (
    <>
      <HtmlPage html={blankHtml} title={title} scripts={blankScripts} />
      {container && createPortal(children, container)}
    </>
  );
}
