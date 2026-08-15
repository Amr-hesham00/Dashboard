import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from './DashboardLayout';
import {
  getClientsApi,
  createClientApi,
  updateClientApi,
  deleteClientApi,
  getClientStatusesApi,
  getClientCurrenciesApi,
  getUsersApi,
} from '../api/clients';

export default function ClientsPage() {
  const { user, logout } = useAuth();

  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [statuses, setStatuses] = useState(['Active', 'Inactive', 'Lead', 'Archived']);
  const [currencies, setCurrencies] = useState(['USD', 'EUR', 'GBP']);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState(null); // null if creating
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    email: '',
    phone: '',
    country: '',
    currency: 0, // Enum or string
    status: 0,   // Enum or string
    notes: '',
    managerId: '',
    logo: '',
  });

  // Delete State
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [clientList, userList, statusList, currList] = await Promise.all([
        getClientsApi(),
        getUsersApi(),
        getClientStatusesApi(),
        getClientCurrenciesApi(),
      ]);

      setClients(clientList || []);
      setUsers(userList || []);
      if (Array.isArray(statusList) && statusList.length) setStatuses(statusList);
      if (Array.isArray(currList) && currList.length) setCurrencies(currList);
    } catch (err) {
      setError(err.message || 'Failed to load client records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditClient(null);
    setFormData({
      companyName: '',
      website: '',
      email: '',
      phone: '',
      country: 'United States',
      currency: 0,
      status: 0,
      notes: '',
      managerId: users[0]?.id || user?.id || '',
      logo: '',
    });
    setModalError('');
    setShowModal(true);
  };

  const openEditModal = (client) => {
    setEditClient(client);
    setFormData({
      companyName: client.companyName || '',
      website: client.website || '',
      email: client.email || '',
      phone: client.phone || '',
      country: client.country || '',
      currency: typeof client.currency === 'number' ? client.currency : currencies.indexOf(client.currency) >= 0 ? currencies.indexOf(client.currency) : 0,
      status: typeof client.status === 'number' ? client.status : statuses.indexOf(client.status) >= 0 ? statuses.indexOf(client.status) : 0,
      notes: client.notes || '',
      managerId: client.managerId || user?.id || '',
      logo: client.logo || '',
    });
    setModalError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.companyName || !formData.email || !formData.phone || !formData.website) {
      setModalError('Please fill in all required fields.');
      return;
    }

    setModalLoading(true);
    try {
      const payload = {
        ...formData,
        currency: Number(formData.currency),
        status: Number(formData.status),
      };

      if (editClient) {
        await updateClientApi(editClient.id, payload);
      } else {
        await createClientApi(payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setModalError(err.message || 'Failed to save client details.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteClientApi(clientToDelete.id);
      setClientToDelete(null);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete client.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Search and Filter Logic
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery);

    const clientStatusStr = typeof c.status === 'number' ? statuses[c.status] : String(c.status);
    const matchesStatus = statusFilter === 'All' || clientStatusStr === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout title="Client Portfolios | Dasher">
      <div id="content" className="position-relative h-100 p-4">
      <div className="custom-container">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-6 gap-3">
          <div>
            <h1 className="h2 mb-1">Client Portfolios</h1>
            <p className="text-secondary mb-0">Manage active clients, contact information, and assigned managers.</p>
          </div>
          <div>
            <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openCreateModal}>
              <i className="ti ti-plus"></i> Add Client
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close"></button>
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
                    placeholder="Search clients by company name, email, phone, or country..."
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

        {/* Client Table Card */}
        <div className="card card-lg">
          <div className="card-header border-bottom-0 d-flex justify-content-between align-items-center">
            <h5 className="mb-0">All Clients ({filteredClients.length})</h5>
          </div>

          <div className="table-responsive">
            <table className="table text-nowrap mb-0 table-centered table-hover">
              <thead className="table-light">
                <tr>
                  <th>Company</th>
                  <th>Contact Info</th>
                  <th>Location & Currency</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading clients...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-secondary">
                      No client records found.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => {
                    const statusName =
                      typeof client.status === 'number'
                        ? statuses[client.status] || 'Active'
                        : String(client.status);

                    const badgeClass =
                      statusName === 'Active' || statusName === '0'
                        ? 'badge text-success-emphasis bg-success-subtle'
                        : statusName === 'Inactive' || statusName === '1'
                        ? 'badge text-secondary-emphasis bg-secondary-subtle'
                        : 'badge text-info-emphasis bg-info-subtle';

                    const currencyName =
                      typeof client.currency === 'number'
                        ? currencies[client.currency] || 'USD'
                        : String(client.currency);

                    return (
                      <tr key={client.id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="avatar avatar-md bg-light rounded d-flex align-items-center justify-content-center fw-bold text-primary">
                              {client.companyName ? client.companyName.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <div>
                              <h6 className="mb-0 fs-6">{client.companyName}</h6>
                              <a
                                href={client.website?.startsWith('http') ? client.website : `https://${client.website}`}
                                target="_blank"
                                rel="noreferrer"
                                className="small text-secondary"
                              >
                                {client.website}
                              </a>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div>{client.email}</div>
                            <small className="text-secondary">{client.phone}</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div>{client.country}</div>
                            <span className="badge bg-light text-dark border ms-0 mt-1">{currencyName}</span>
                          </div>
                        </td>
                        <td>
                          <span className={badgeClass}>{statusName}</span>
                        </td>
                        <td className="text-end">
                          <Link
                            to={`/clients/${client.id}`}
                            className="btn btn-ghost btn-icon btn-sm rounded-circle me-1"
                            title="View Details"
                          >
                            <i className="ti ti-eye fs-5 text-secondary"></i>
                          </Link>
                          <button
                            className="btn btn-ghost btn-icon btn-sm rounded-circle me-1"
                            onClick={() => openEditModal(client)}
                            title="Edit Client"
                          >
                            <i className="ti ti-edit fs-5 text-secondary"></i>
                          </button>
                          <button
                            className="btn btn-ghost btn-icon btn-sm rounded-circle text-danger"
                            onClick={() => setClientToDelete(client)}
                            title="Delete Client"
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
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editClient ? 'Edit Client' : 'Create New Client'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleSave}>
                  <div className="modal-body p-4">
                    {modalError && <div className="alert alert-danger mb-3">{modalError}</div>}

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">
                          Company Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          placeholder="e.g. Acme Corp"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          Website <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          placeholder="https://acme.com"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          Email <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="contact@acme.com"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          Phone <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 555-0199"
                          required
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">
                          Country <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          placeholder="United States"
                          required
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Currency</label>
                        <select
                          className="form-select"
                          value={formData.currency}
                          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        >
                          {currencies.map((curr, idx) => (
                            <option key={curr || idx} value={idx}>
                              {curr}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Status</label>
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

                      <div className="col-md-12">
                        <label className="form-label">Assigned Manager</label>
                        <select
                          className="form-select"
                          value={formData.managerId}
                          onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                        >
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.userName} ({u.email})
                            </option>
                          ))}
                          {users.length === 0 && <option value={user?.id || 'admin'}>Current Account User</option>}
                        </select>
                      </div>

                      <div className="col-md-12">
                        <label className="form-label">Notes</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Additional notes about client..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                      {modalLoading ? 'Saving...' : 'Save Client'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {clientToDelete && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabindex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Delete Client</h5>
                  <button type="button" className="btn-close" onClick={() => setClientToDelete(null)}></button>
                </div>
                <div className="modal-body p-4">
                  <p className="mb-0">
                    Are you sure you want to delete client <strong>{clientToDelete.companyName}</strong>? This action cannot be undone.
                  </p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setClientToDelete(null)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleteLoading}>
                    {deleteLoading ? 'Deleting...' : 'Delete'}
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
