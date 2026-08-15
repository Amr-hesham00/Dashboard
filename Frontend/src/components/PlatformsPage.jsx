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
} from '../api/platforms';

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState([]);
  const [clients, setClients] = useState([]);
  const [types, setTypes] = useState(['GoogleAds', 'FacebookAds', 'TikTokAds', 'LinkedInAds', 'InstagramAds']);
  const [statuses, setStatuses] = useState(['Active', 'Inactive', 'Pending']);
  
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
    clientId: '',
  });

  // Delete State
  const [platformToDelete, setPlatformToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [platList, clientList, typeList, statusList] = await Promise.all([
        getPlatformsApi(),
        getClientsApi(),
        getPlatformTypesApi(),
        getPlatformStatusesApi(),
      ]);

      setPlatforms(platList || []);
      setClients(clientList || []);
      if (Array.isArray(typeList) && typeList.length) setTypes(typeList);
      if (Array.isArray(statusList) && statusList.length) setStatuses(statusList);
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
      clientId: clients[0]?.id || '',
    });
    setModalError('');
    setShowModal(true);
  };

  const openEditModal = (plat) => {
    setEditPlatform(plat);
    const typeIdx = typeof plat.platformType === 'number' ? plat.platformType : types.indexOf(plat.platformType);
    const statusIdx = typeof plat.status === 'number' ? plat.status : statuses.indexOf(plat.status);
    
    setFormData({
      platformType: typeIdx >= 0 ? typeIdx : 0,
      status: statusIdx >= 0 ? statusIdx : 0,
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
    const platTypeStr = typeof plat.platformType === 'number' ? types[plat.platformType] : String(plat.platformType);
    
    const matchesSearch =
      clientName.includes(searchQuery.toLowerCase()) ||
      platTypeStr?.toLowerCase().includes(searchQuery.toLowerCase());

    const platStatusStr = typeof plat.status === 'number' ? statuses[plat.status] : String(plat.status);
    const matchesStatus = statusFilter === 'All' || platStatusStr === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout title="Platforms | Dasher">
      <div id="content" className="position-relative h-100 p-4">
        <div className="custom-container">
          
          {/* Header */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-6 gap-3">
            <div>
              <h1 className="h2 mb-1">Advertising Platforms</h1>
              <p className="text-secondary mb-0">Connect and manage marketing channels for your client portfolios.</p>
            </div>
            <div>
              <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openCreateModal}>
                <i className="ti ti-plus"></i> Add Platform
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
          <div className="card mb-6">
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-8 col-12">
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className="ti ti-search text-secondary"></i>
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
                    {statuses.map((st, idx) => (
                      <option key={st || idx} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="card card-lg">
            <div className="card-header border-bottom-0 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">All Channels ({filteredPlatforms.length})</h5>
            </div>

            <div className="table-responsive">
              <table className="table text-nowrap mb-0 table-centered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Platform ID</th>
                    <th>Client Portfolio</th>
                    <th>Platform Type</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPlatforms.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-secondary">
                        No advertising platforms found.
                      </td>
                    </tr>
                  ) : (
                    filteredPlatforms.map((plat) => {
                      const typeName =
                        typeof plat.platformType === 'number'
                          ? types[plat.platformType] || 'Unknown'
                          : String(plat.platformType);

                      const statusName =
                        typeof plat.status === 'number'
                          ? statuses[plat.status] || 'Active'
                          : String(plat.status);

                      const badgeClass =
                        statusName === 'Active' || statusName === '0'
                          ? 'badge text-success-emphasis bg-success-subtle'
                          : statusName === 'Inactive' || statusName === '1'
                          ? 'badge text-secondary-emphasis bg-secondary-subtle'
                          : 'badge text-info-emphasis bg-info-subtle';

                      return (
                        <tr key={plat.id}>
                          <td>
                            <code className="text-secondary">#PLT-{plat.id}</code>
                          </td>
                          <td>
                            <Link to={`/clients/${plat.clientId}`} className="fw-semibold text-inherit">
                              {getClientName(plat.clientId)}
                            </Link>
                          </td>
                          <td>
                            <span className="fw-medium">{typeName}</span>
                          </td>
                          <td>
                            <span className={badgeClass}>{statusName}</span>
                          </td>
                          <td>
                            <span>{new Date(plat.createdAt).toLocaleDateString()}</span>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-ghost btn-icon btn-sm rounded-circle me-1"
                              onClick={() => openEditModal(plat)}
                              title="Edit Platform"
                            >
                              <i className="ti ti-edit fs-5 text-secondary"></i>
                            </button>
                            <button
                              className="btn btn-ghost btn-icon btn-sm rounded-circle text-danger"
                              onClick={() => setPlatformToDelete(plat)}
                              title="Delete Platform"
                            >
                              <i className="ti ti-trash fs-5"></i>
                            </button>
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
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabindex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{editPlatform ? 'Edit Platform Configuration' : 'Connect New Platform'}</h5>
                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                  </div>
                  <form onSubmit={handleSave}>
                    <div className="modal-body p-4">
                      {modalError && <div className="alert alert-danger mb-3">{modalError}</div>}

                      <div className="d-flex flex-column gap-3">
                        <div>
                          <label className="form-label">Client Portfolio Assignment</label>
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
                          <label className="form-label">Platform Type / Channel</label>
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
                          <label className="form-label">Status Connection</label>
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
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabindex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Disconnect Platform</h5>
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
      </div>
    </DashboardLayout>
  );
}
