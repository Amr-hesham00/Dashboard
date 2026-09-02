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

    // Populate Client Performance Table from mock data
    const clientTableBody = root.querySelector('#clientPerformanceTable tbody');
    if (clientTableBody && data.clients && data.clients.length > 0) {
      clientTableBody.innerHTML = '';
      data.clients.forEach((client, idx) => {
        const tr = document.createElement('tr');
        const clientCampaigns = (data.campaigns || []).filter(
          (c) => c.clientId === client.id || String(c.clientName || '').toLowerCase() === String(client.companyName || client.name || '').toLowerCase()
        );
        const activeCount = clientCampaigns.filter((c) => c.status === 0 || c.status === 'Active').length || (client.activeCampaignsCount || 2);
        const totalSpend = clientCampaigns.reduce((acc, c) => acc + (c.spend || 0), 0);
        const totalRev = clientCampaigns.reduce((acc, c) => acc + (c.revenue || 0), 0);
        const roasVal = totalSpend > 0 ? (totalRev / totalSpend).toFixed(2) : (client.roas ? Number(client.roas).toFixed(2) : '3.50');
        const curConv = client.conversions != null ? client.conversions : 250;
        const tgtConv = client.targetConversions != null ? client.targetConversions : 300;
        const convPercent = Math.round((curConv / Math.max(1, tgtConv)) * 100);
        const convTrendIcon =
          convPercent >= 100
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-success"><polyline points="18 15 12 9 6 15"/></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-danger"><polyline points="6 9 12 15 18 9"/></svg>';

        const targetPercent = client.targetAchievement != null ? client.targetAchievement : convPercent;
        const trafficClass = targetPercent >= 85 ? 'progress-traffic-green' : targetPercent >= 50 ? 'progress-traffic-yellow' : 'progress-traffic-red';
        const textColor = targetPercent >= 85 ? 'text-success' : targetPercent >= 50 ? 'text-warning' : 'text-danger';
        const gradients = [
          'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          'linear-gradient(135deg, #059669 0%, #047857 100%)',
          'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
          'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
        ];
        const clientGradient = gradients[idx % gradients.length];
        const clientId = client.id || `cli-10${idx + 1}`;
        const initials = (client.companyName || client.name || 'CL').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

        tr.innerHTML = `
          <td class="ps-4">
            <a href="/clients/${clientId}" data-internal-link="true" class="d-flex align-items-center gap-3 text-decoration-none group-client-hover" title="View ${client.companyName || client.name} details">
              <div class="avatar text-white fw-bold rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style="width: 42px; height: 42px; background: ${clientGradient}; font-size: 0.95rem; letter-spacing: 0.5px;">
                ${initials}
              </div>
              <div>
                <div class="fw-bold text-body-emphasis client-name-hover">${client.companyName || client.name}</div>
                <small class="text-secondary">${client.category || 'General'}</small>
              </div>
            </a>
          </td>
          <td>
            <span class="fw-semibold text-body">${activeCount} Active</span>
          </td>
          <td>
            <span class="badge ${client.status === 'Active' ? 'bg-success-subtle text-success-emphasis' : 'bg-warning-subtle text-warning-emphasis'} rounded-pill px-2.5 py-1 fw-semibold">
              ${client.status || 'Active'}
            </span>
          </td>
          <td>
            <span class="fw-bold text-body-emphasis">${roasVal}x</span>
          </td>
          <td>
            <div class="d-flex align-items-center gap-1.5">
              <span class="fw-semibold text-body">${curConv} / ${tgtConv}</span>
              <span class="text-secondary small fw-medium">(${convPercent}%)</span>
              ${convTrendIcon}
            </div>
          </td>
          <td class="pe-4">
            <div class="d-flex align-items-center gap-2" style="min-width: 140px;">
              <div class="progress flex-grow-1 progress-traffic-track">
                <div class="progress-bar ${trafficClass}" role="progressbar" style="width: ${Math.min(targetPercent, 100)}%;"></div>
              </div>
              <span class="small fw-bold ${textColor}">${targetPercent}%</span>
            </div>
          </td>
        `;
        clientTableBody.appendChild(tr);
      });
    }

    return () => {
      toggleHandlers.forEach(({ btn, handler }) => {
        btn.removeEventListener('click', handler);
      });
    };
  }, [data, user, logout]);

  return (
    <div ref={wrapperRef} className="position-relative min-vh-100 d-flex flex-column">
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
