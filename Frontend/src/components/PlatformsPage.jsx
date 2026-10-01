import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { getClientsApi } from '../api/clients';
import {
  getPlatformsApi,
  createPlatformApi,
  updatePlatformApi,
  deletePlatformApi,
  getPlatformTypesApi,
  getPlatformStatusesApi,
  getPlatformCurrenciesApi,
} from '../api/platforms';

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState([]);
  const [clients, setClients] = useState([]);
  const [types, setTypes] = useState(['GoogleAds', 'FacebookAds', 'TikTokAds', 'LinkedInAds', 'InstagramAds']);
  const [statuses, setStatuses] = useState(['Active', 'Inactive', 'Pending']);
  const [currencies, setCurrencies] = useState(['USD', 'EUR', 'EGP', 'GBP', 'CAD', 'AUD', 'AED', 'SAR']);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editPlatform, setEditPlatform] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    platformType: 0,
    status: 0,
    currency: 0,
    clientId: '',
  });

  // Delete State
  const [platformToDelete, setPlatformToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const getCurrencySymbol = (curr) => {
    if (!curr && curr !== 0) return '$';
    const c = typeof curr === 'number' ? (currencies[curr] || 'USD') : String(curr);
    switch (c.toUpperCase()) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'AED': return 'AED ';
      case 'SAR': return 'SAR ';
      case 'CAD': return 'C$';
      case 'AUD': return 'A$';
      case 'EGP': return 'EGP ';
      default: return '$';
    }
  };

  const getCurrencyCode = (curr) => {
    if (typeof curr === 'number') return currencies[curr] || 'USD';
    return String(curr || 'USD');
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [platList, clientList, typeList, statusList, currencyList] = await Promise.all([
        getPlatformsApi(),
        getClientsApi(),
        getPlatformTypesApi(),
        getPlatformStatusesApi(),
        getPlatformCurrenciesApi(),
      ]);

      setPlatforms(platList || []);
      setClients(clientList || []);
      if (Array.isArray(typeList) && typeList.length) setTypes(typeList);
      if (Array.isArray(statusList) && statusList.length) setStatuses(statusList);
      if (Array.isArray(currencyList) && currencyList.length) setCurrencies(currencyList);
    } catch (err) {
      setError(err.message || 'Failed to load platforms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditPlatform(null);
    setFormData({
      platformType: 0,
      status: 0,
      currency: 0,
      clientId: clients[0]?.id || '',
    });
    setModalError('');
    setShowModal(true);
  };

  const openEditModal = (plat) => {
    setEditPlatform(plat);
    const typeIdx = typeof plat.platformType === 'number' ? plat.platformType : types.indexOf(plat.platformType);
    const statusIdx = typeof plat.status === 'number' ? plat.status : statuses.indexOf(plat.status);
    const currIdx = typeof plat.currency === 'number' ? plat.currency : currencies.indexOf(plat.currency);
    
    setFormData({
      platformType: typeIdx >= 0 ? typeIdx : 0,
      status: statusIdx >= 0 ? statusIdx : 0,
      currency: currIdx >= 0 ? currIdx : 0,
      clientId: plat.clientId || '',
    });
    setModalError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.clientId) {
      setModalError('Please assign a client to this platform.');
      return;
    }

    setModalLoading(true);
    try {
      const payload = {
        platformType: Number(formData.platformType),
        status: Number(formData.status),
        currency: Number(formData.currency),
        clientId: Number(formData.clientId),
      };

      if (editPlatform) {
        await updatePlatformApi(editPlatform.id, payload);
      } else {
        await createPlatformApi(payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setModalError(err.message || 'Failed to save platform.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!platformToDelete) return;
    setDeleteLoading(true);
    try {
      await deletePlatformApi(platformToDelete.id);
      setPlatformToDelete(null);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete platform.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.companyName : `Client ID: ${clientId}`;
  };

  // Filter logic
  const filteredPlatforms = platforms.filter((plat) => {
    const clientName = getClientName(plat.clientId).toLowerCase();
    const platTypeStr = typeof plat.platformType === 'number' ? types[plat.platformType] : String(plat.platformType || plat.name || '');
    
    const matchesSearch =
      clientName.includes(searchQuery.toLowerCase()) ||
      platTypeStr.toLowerCase().includes(searchQuery.toLowerCase());

    const platStatusStr = typeof plat.status === 'number' ? statuses[plat.status] : String(plat.status || '');
    const matchesStatus = statusFilter === 'All' || platStatusStr === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout title="Platforms | Dasher">
      <div className="container-fluid px-0">
        {/* ─── Breadcrumb ─── */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb mb-0 py-0 bg-transparent small align-items-center">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none fw-semibold text-secondary hover-primary">
                Dashboard
              </Link>
            </li>
            <li className="breadcrumb-item active text-success fw-semibold" aria-current="page">
              Platforms
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h1 className="h2 mb-1">Advertising Platforms</h1>
            <p className="text-secondary mb-0">Connect and manage marketing channels for your client portfolios.</p>
          </div>
          <div>
            <button className="btn btn-primary d-inline-flex align-items-center gap-2 shadow-sm rounded-3 px-3 py-2" onClick={openCreateModal}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Add Platform</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        {/* Search & Filter Controls */}
        <div className="card mb-6 border-0 shadow-sm rounded-3">
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-md-8 col-12">
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Search platforms by client company or channel type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-4 col-12">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Platforms Table Card */}
        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="table-responsive">
            <table className="table align-middle text-nowrap mb-0 table-hover">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="ps-4">Client Portfolio</th>
                  <th scope="col">Platform Channel</th>
                  <th scope="col">Currency</th>
                  <th scope="col">Status</th>
                  <th scope="col">Connected On</th>
                  <th scope="col" className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPlatforms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-secondary">
                      No platform connections found.
                    </td>
                  </tr>
                ) : (
                  filteredPlatforms.map((plat) => {
                    const typeName =
                      typeof plat.platformType === 'number'
                        ? types[plat.platformType] || 'Unknown'
                        : plat.name || String(plat.platformType || 'GoogleAds');

                    const statusName =
                      typeof plat.status === 'number'
                        ? statuses[plat.status] || 'Active'
                        : String(plat.status || 'Active');

                    const badgeClass =
                      statusName === 'Active' || statusName === '0'
                        ? 'badge text-success-emphasis bg-success-subtle'
                        : statusName === 'Inactive' || statusName === '1'
                        ? 'badge text-secondary-emphasis bg-secondary-subtle'
                        : 'badge text-warning-emphasis bg-warning-subtle';

                    return (
                      <tr key={plat.id}>
                        <td className="ps-4">
                          <Link to={`/clients/${plat.clientId}`} className="fw-semibold text-decoration-none text-dark">
                            {getClientName(plat.clientId)}
                          </Link>
                        </td>
                        <td>
                          <span className="fw-medium">{typeName}</span>
                        </td>
                        <td>
                          <span className="badge bg-primary-subtle text-primary-emphasis border border-primary-subtle px-2.5 py-1 fw-semibold">
                            {getCurrencyCode(plat.currency)} ({getCurrencySymbol(plat.currency).trim()})
                          </span>
                        </td>
                        <td>
                          <span className={badgeClass}>{statusName}</span>
                        </td>
                        <td>
                          <span>{new Date(plat.createdAt || Date.now()).toLocaleDateString()}</span>
                        </td>
                        <td className="text-end pe-4">
                          <div className="d-inline-flex align-items-center gap-1">
                            <button
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 px-2 py-1"
                              onClick={() => openEditModal(plat)}
                              title="Edit Platform"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"/>
                                <path d="M13.5 6.5l4 4"/>
                              </svg>
                              <span className="d-none d-md-inline small">Edit</span>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 px-2 py-1"
                              onClick={() => setPlatformToDelete(plat)}
                              title="Delete Platform"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <line x1="4" y1="7" x2="20" y2="7"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                                <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/>
                                <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>
                              </svg>
                              <span className="d-none d-md-inline small">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create / Edit Modal */}
        {showModal && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            tabIndex="-1"
            onClick={() => setShowModal(false)}
          >
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content border-0 shadow-lg rounded-3">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">{editPlatform ? 'Edit Platform Configuration' : 'Connect New Platform'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleSave}>
                  <div className="modal-body p-4">
                    {modalError && <div className="alert alert-danger mb-3">{modalError}</div>}

                    <div className="d-flex flex-column gap-3">
                      <div>
                        <label className="form-label fw-medium">Client Portfolio Assignment *</label>
                        <select
                          className="form-select"
                          value={formData.clientId}
                          onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                          required
                        >
                          <option value="">Select a Client...</option>
                          {clients.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.companyName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="form-label fw-medium">Platform Type / Channel</label>
                        <select
                          className="form-select"
                          value={formData.platformType}
                          onChange={(e) => setFormData({ ...formData, platformType: e.target.value })}
                        >
                          {types.map((tp, idx) => (
                            <option key={tp || idx} value={idx}>
                              {tp}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="form-label fw-medium">Platform Currency</label>
                        <select
                          className="form-select"
                          value={formData.currency}
                          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        >
                          {currencies.map((curr, idx) => (
                            <option key={curr || idx} value={idx}>
                              {curr} ({getCurrencySymbol(curr).trim()})
                            </option>
                          ))}
                        </select>
                        <small className="text-secondary" style={{ fontSize: '0.74rem' }}>
                          Operating currency used for ad spend, budgets, and billing on this platform.
                        </small>
                      </div>

                      <div>
                        <label className="form-label fw-medium">Status Connection</label>
                        <select
                          className="form-select"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                          {statuses.map((st, idx) => (
                            <option key={st || idx} value={idx}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                      {modalLoading ? 'Connecting...' : 'Save Configuration'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {platformToDelete && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            tabIndex="-1"
            onClick={() => setPlatformToDelete(null)}
          >
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content border-0 shadow-lg rounded-3">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Disconnect Platform</h5>
                  <button type="button" className="btn-close" onClick={() => setPlatformToDelete(null)}></button>
                </div>
                <div className="modal-body p-4">
                  <p className="mb-0">
                    Are you sure you want to disconnect platform <strong>#PLT-{platformToDelete.id}</strong> (Client: {getClientName(platformToDelete.clientId)})? This will remove all associated campaigns.
                  </p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setPlatformToDelete(null)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleteLoading}>
                    {deleteLoading ? 'Disconnecting...' : 'Disconnect'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
