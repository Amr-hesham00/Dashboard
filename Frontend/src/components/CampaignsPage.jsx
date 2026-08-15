import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import {
  getCampaignsApi,
  createCampaignApi,
  updateCampaignApi,
  deleteCampaignApi,
} from '../api/campaigns';
import { getPlatformsApi } from '../api/platforms';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    objective: 0, // Awareness=0, Traffic=1, Engagement=2, Leads=3, Sales=4
    status: 0, // Active=0, Paused=1, Completed=2, Draft=3
    spend: 0,
    revenue: 0,
    roas: 0,
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
    platformId: '',
  });

  const objectiveNames = ['Awareness', 'Traffic', 'Engagement', 'Leads', 'Sales'];
  const statusNames = ['Active', 'Paused', 'Completed', 'Draft'];

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [campData, platData] = await Promise.all([
        getCampaignsApi().catch(() => []),
        getPlatformsApi().catch(() => []),
      ]);
      setCampaigns(campData);
      setPlatforms(platData);
    } catch (err) {
      setError(err.message || 'Failed to load campaigns data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCampaign(null);
    setFormData({
      name: '',
      objective: 0,
      status: 0,
      spend: 0,
      revenue: 0,
      roas: 0,
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
      platformId: platforms[0]?.id || '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (camp) => {
    setEditingCampaign(camp);
    setFormData({
      name: camp.name || '',
      objective: typeof camp.objective === 'number' ? camp.objective : 0,
      status: typeof camp.status === 'number' ? camp.status : 0,
      spend: camp.spend || 0,
      revenue: camp.revenue || 0,
      roas: camp.roas || 0,
      startDate: camp.startDate ? camp.startDate.substring(0, 10) : '',
      endDate: camp.endDate ? camp.endDate.substring(0, 10) : '',
      platformId: camp.platformId || platforms[0]?.id || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        objective: parseInt(formData.objective, 10),
        status: parseInt(formData.status, 10),
        spend: parseFloat(formData.spend) || 0,
        revenue: parseFloat(formData.revenue) || 0,
        roas: parseFloat(formData.roas) || 0,
        platformId: parseInt(formData.platformId, 10) || (platforms[0]?.id || 1),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      if (editingCampaign) {
        await updateCampaignApi(editingCampaign.id, payload);
      } else {
        await createCampaignApi(payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Error saving campaign.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaignApi(id);
        fetchData();
      } catch (err) {
        alert(err.message || 'Failed to delete campaign.');
      }
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      c.status === parseInt(statusFilter, 10) ||
      statusNames[c.status]?.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate KPIs
  const totalSpend = campaigns.reduce((acc, curr) => acc + (curr.spend || 0), 0);
  const totalRevenue = campaigns.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const avgRoas = campaigns.length
    ? (campaigns.reduce((acc, curr) => acc + (curr.roas || 0), 0) / campaigns.length).toFixed(2)
    : 0;

  const getPlatformName = (pId) => {
    const found = platforms.find((p) => p.id === pId);
    return found ? found.name : `Platform #${pId}`;
  };

  const getStatusBadge = (statusVal) => {
    const idx = typeof statusVal === 'number' ? statusVal : 0;
    switch (idx) {
      case 0:
        return <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">Active</span>;
      case 1:
        return <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1">Paused</span>;
      case 2:
        return <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1">Completed</span>;
      default:
        return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1">Draft</span>;
    }
  };

  return (
    <DashboardLayout title="Campaigns Management | Dasher">
      <div className="container-fluid px-0">
        {/* Header Title & Actions */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
          <div>
            <h2 className="h4 mb-1 fw-bold text-dark">Campaigns</h2>
            <p className="text-secondary mb-0">Track and manage marketing campaign performance across platforms.</p>
          </div>
          <button onClick={handleOpenAddModal} className="btn btn-primary d-inline-flex align-items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Campaign
          </button>
        </div>

        {/* KPI Metrics Summary */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-3 p-3">
              <span className="text-secondary small fw-medium">Total Campaigns</span>
              <h3 className="h4 mb-0 fw-bold mt-2">{campaigns.length}</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-3 p-3">
              <span className="text-secondary small fw-medium">Total Spend</span>
              <h3 className="h4 mb-0 fw-bold mt-2 text-danger">${totalSpend.toLocaleString()}</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-3 p-3">
              <span className="text-secondary small fw-medium">Total Revenue</span>
              <h3 className="h4 mb-0 fw-bold mt-2 text-success">${totalRevenue.toLocaleString()}</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-3 p-3">
              <span className="text-secondary small fw-medium">Average ROAS</span>
              <h3 className="h4 mb-0 fw-bold mt-2 text-primary">{avgRoas}x</h3>
            </div>
          </div>
        </div>

        {/* Toolbar (Search & Filters) */}
        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-body p-3">
            <div className="row g-3 align-items-center">
              <div className="col-12 col-md-6 col-lg-4">
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Search campaigns..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-12 col-md-4 col-lg-3 me-auto">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="0">Active</option>
                  <option value="1">Paused</option>
                  <option value="2">Completed</option>
                  <option value="3">Draft</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-0">
            {loading ? (
              <div className="p-5 text-center text-secondary">
                <div className="spinner-border text-primary me-2" role="status"></div>
                Loading campaigns...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-danger">{error}</div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="p-5 text-center text-secondary">No campaigns found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Campaign Name</th>
                      <th>Platform</th>
                      <th>Objective</th>
                      <th>Status</th>
                      <th>Spend</th>
                      <th>Revenue</th>
                      <th>ROAS</th>
                      <th>Start Date</th>
                      <th className="pe-4 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCampaigns.map((camp) => (
                      <tr key={camp.id}>
                        <td className="ps-4 fw-semibold text-dark">{camp.name}</td>
                        <td className="text-secondary">{getPlatformName(camp.platformId)}</td>
                        <td>
                          <span className="badge bg-light text-dark border px-2 py-1">
                            {objectiveNames[camp.objective] || 'Awareness'}
                          </span>
                        </td>
                        <td>{getStatusBadge(camp.status)}</td>
                        <td className="fw-medium">${(camp.spend || 0).toLocaleString()}</td>
                        <td className="fw-medium text-success">${(camp.revenue || 0).toLocaleString()}</td>
                        <td className="fw-bold text-primary">{(camp.roas || 0).toFixed(2)}x</td>
                        <td className="text-secondary small">
                          {camp.startDate ? new Date(camp.startDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="pe-4 text-end">
                          <button
                            onClick={() => handleOpenEditModal(camp)}
                            className="btn btn-sm btn-outline-secondary me-2"
                            title="Edit Campaign"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(camp.id)}
                            className="btn btn-sm btn-outline-danger"
                            title="Delete Campaign"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Create / Edit Modal */}
        {showModal && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-3">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">
                    {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label fw-medium">Campaign Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Summer Sales Q3"
                      />
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="form-label fw-medium">Platform *</label>
                        <select
                          className="form-select"
                          required
                          value={formData.platformId}
                          onChange={(e) => setFormData({ ...formData, platformId: e.target.value })}
                        >
                          {platforms.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-medium">Objective</label>
                        <select
                          className="form-select"
                          value={formData.objective}
                          onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                        >
                          {objectiveNames.map((name, idx) => (
                            <option key={idx} value={idx}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="form-label fw-medium">Status</label>
                        <select
                          className="form-select"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                          {statusNames.map((name, idx) => (
                            <option key={idx} value={idx}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-medium">Spend ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={formData.spend}
                          onChange={(e) => setFormData({ ...formData, spend: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="form-label fw-medium">Revenue ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={formData.revenue}
                          onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-medium">ROAS</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={formData.roas}
                          onChange={(e) => setFormData({ ...formData, roas: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="row g-3">
                      <div className="col-6">
                        <label className="form-label fw-medium">Start Date</label>
                        <input
                          type="date"
                          className="form-control"
                          required
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-medium">End Date</label>
                        <input
                          type="date"
                          className="form-control"
                          required
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer px-4 py-3 bg-light">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingCampaign ? 'Save Changes' : 'Create Campaign'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
