import { useEffect, useState, useRef } from 'react';
import HtmlPage from './HtmlPage';
import indexHtml from '../content/index.html?raw';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardSummary } from '../api/dashboard';

const indexScripts = [
  '/vendor/bootstrap/dist/js/bootstrap.bundle.min.js',
  '/vendor/simplebar/dist/simplebar.min.js',
  '/assets/js/main.js',
  '/assets/js/vendors/sidebarnav.js',
  '/vendor/jsvectormap/dist/js/jsvectormap.min.js',
  '/vendor/jsvectormap/dist/maps/world.js',
  '/vendor/jsvectormap/dist/maps/world-merc.js',
  '/vendor/apexcharts/dist/apexcharts.min.js',
  '/assets/js/vendors/chart.js',
  '/vendor/choices.js/public/assets/scripts/choices.min.js',
  '/assets/js/vendors/choice.js',
  '/vendor/swiper/swiper-bundle.min.js',
  '/assets/js/vendors/swiper.js',
];

export default function DashboardOverview() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const result = await fetchDashboardSummary();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load dashboard data.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const root = wrapperRef.current;

    // Logout confirmation, sidebar toggles, and theme toggles are handled globally by AppBootstrap event delegation

    // Sidebar user profile binding
    if (user) {
      const displayName = user.firstName
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : user.userName || user.email || 'User Account';
      const email = user.email || '';
      const userImage = user.profilePicture || user.imageUrl || user.avatar || user.image || user.photoUrl;

      const sidebarUserNames = root.querySelectorAll('.sidebar-user-name');
      const sidebarUserEmails = root.querySelectorAll('.sidebar-user-email');
      const userContainers = root.querySelectorAll('.user-avatar-container');

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

    const toggleHandlers = [];

    // Direct Theme Mode Toggle (Light <-> Dark)
    const applyTheme = (theme) => {
      const targetTheme = theme === 'dark' ? 'dark' : 'light';
      localStorage.setItem('theme', targetTheme);
      document.documentElement.setAttribute('data-bs-theme', targetTheme);

      const themeIconActives = root.querySelectorAll('.theme-icon-active');
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

    const themeBtns = root.querySelectorAll('.theme-toggle-btn, [data-bs-theme-value]');
    themeBtns.forEach((btn) => {
      const handler = (e) => {
        e.preventDefault();
        const current = document.documentElement.getAttribute('data-bs-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      };
      btn.addEventListener('click', handler);
      toggleHandlers.push({ btn, handler });
    });

    // Topbar profile dropdown bindings can be handled here if needed

    // Bind Add Client Form
    const addClientForm = root.querySelector('#addClientForm');
    if (addClientForm) {
      const handleAddClient = (e) => {
        e.preventDefault();
        const name = root.querySelector('#clientNameInput')?.value;
        const emailVal = root.querySelector('#clientEmailInput')?.value;

        if (name && emailVal) {
          alert(`Client "${name}" (${emailVal}) added successfully!`);
          addClientForm.reset();
          const modalEl = root.querySelector('#addClientModal');
          if (modalEl && window.bootstrap) {
            const modalInstance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
            modalInstance.hide();
          }
        }
      };
      addClientForm.addEventListener('submit', handleAddClient);
      toggleHandlers.push({ btn: addClientForm, handler: handleAddClient });
    }

    if (!data) return;

    // Update KPI Cards
    const kpiCards = root.querySelectorAll('.row-cols-xl-2 .card-body');
    if (kpiCards.length >= 2) {
      // Card 1: Total Revenue
      const card1Title = kpiCards[0].querySelector('div:nth-child(1) div:last-child');
      const card1Value = kpiCards[0].querySelector('.fs-3.fw-bold');
      if (card1Title) card1Title.textContent = 'Total Revenue';
      if (card1Value) card1Value.textContent = data.kpis.totalRevenue;

      // Card 2: Avg ROAS
      const card2Title = kpiCards[1].querySelector('div:nth-child(1) div:last-child');
      const card2Value = kpiCards[1].querySelector('.fs-3.fw-bold');
      if (card2Title) card2Title.textContent = 'Average ROAS';
      if (card2Value) card2Value.textContent = data.kpis.avgRoas;
    }

    // Update Total Income vs Total Expenses tab labels
    const totalIncomeEl = root.querySelector('#current-week-tab .fs-3');
    const totalExpensesEl = root.querySelector('#past-week-tab .fs-3');
    if (totalIncomeEl) totalIncomeEl.textContent = data.kpis.totalRevenue;
    if (totalExpensesEl) totalExpensesEl.textContent = data.kpis.totalSpend;

    // Populate Recent Campaigns Table if campaigns exist
    const recentTableBody = root.querySelector('.table-responsive table tbody');
    if (recentTableBody && data.campaigns && data.campaigns.length > 0) {
      recentTableBody.innerHTML = '';
      data.campaigns.slice(0, 5).forEach((camp) => {
        const tr = document.createElement('tr');
        const statusBadgeClass =
          camp.status === 'Active' || camp.status === 0
            ? 'badge text-success-emphasis bg-success-subtle'
            : camp.status === 'Completed' || camp.status === 2
              ? 'badge text-info-emphasis bg-info-subtle'
              : 'badge text-warning-emphasis bg-warning-subtle';

        const spendFormatted = (camp.spend || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        const revFormatted = (camp.revenue || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

        tr.innerHTML = `
          <td>#CMP-${camp.id}</td>
          <td><strong>${camp.name || 'Campaign'}</strong></td>
          <td>${spendFormatted}</td>
          <td>${revFormatted}</td>
          <td><span class="${statusBadgeClass}">${camp.status ?? 'Active'}</span></td>
          <td><a href="/campaigns" data-internal-link="true" class="btn btn-white btn-sm">View</a></td>
        `;
        recentTableBody.appendChild(tr);
      });
    }

    return () => {
      toggleHandlers.forEach(({ btn, handler }) => {
        btn.removeEventListener('click', handler);
      });
    };
  }, [data, user, logout]);

  return (
    <div ref={wrapperRef} className="position-relative">
      {loading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75"
          style={{ zIndex: 9999 }}
        >
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading dashboard data...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-warning alert-dismissible fade show m-4" role="alert">
          <strong>Backend Data Notice:</strong> {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}

      <HtmlPage html={indexHtml} title="Dasher - E-commerce Admin Dashboard" scripts={indexScripts} />
    </div>
  );
}
