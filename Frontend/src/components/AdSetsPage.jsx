import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import {
  getAdSetsApi,
  createAdSetApi,
  updateAdSetApi,
  deleteAdSetApi,
} from '../api/adsets';
import { getCampaignsApi } from '../api/campaigns';

export default function AdSetsPage() {
  const [adSets, setAdSets] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingAdSet, setEditingAdSet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    audienceType: 'Lookalike',
    ageRange: '25-54',
    gender: 0, // All=0, Male=1, Female=2
    location: 'United States',
    status: 0, // Active=0, Paused=1, Completed=2, Draft=3
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
    campaignId: '',
  });

  const genderNames = ['All', 'Male', 'Female'];
  const statusNames = ['Active', 'Paused', 'Completed', 'Draft'];

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [adSetData, campData] = await Promise.all([
        getAdSetsApi().catch(() => []),
        getCampaignsApi().catch(() => []),
      ]);
      setAdSets(adSetData);
      setCampaigns(campData);
    } catch (err) {
      setError(err.message || 'Failed to load ad sets data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingAdSet(null);
    setFormData({
      name: '',
      audienceType: 'Lookalike',
      ageRange: '25-54',
      gender: 0,
      location: 'United States',
      status: 0,
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
      campaignId: campaigns[0]?.id || '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (adSet) => {
    setEditingAdSet(adSet);
    setFormData({
      name: adSet.name || '',
      audienceType: adSet.audienceType || 'Lookalike',
      ageRange: adSet.ageRange || '25-54',
      gender: typeof adSet.gender === 'number' ? adSet.gender : 0,
      location: adSet.location || '',
      status: typeof adSet.status === 'number' ? adSet.status : 0,
      startDate: adSet.startDate ? adSet.startDate.substring(0, 10) : '',
      endDate: adSet.endDate ? adSet.endDate.substring(0, 10) : '',
      campaignId: adSet.campaignId || campaigns[0]?.id || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        gender: parseInt(formData.gender, 10),
        status: parseInt(formData.status, 10),
        campaignId: parseInt(formData.campaignId, 10) || (campaigns[0]?.id || 1),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      if (editingAdSet) {
        await updateAdSetApi(editingAdSet.id, payload);
      } else {
        await createAdSetApi(payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Error saving ad set.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ad set?')) {
      try {
        await deleteAdSetApi(id);
        fetchData();
      } catch (err) {
        alert(err.message || 'Failed to delete ad set.');
      }
    }
  };

  const filteredAdSets = adSets.filter((a) => {
    const matchesSearch =
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.audienceType?.toLowerCase().includes(search.toLowerCase()) ||
      a.location?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      a.status === parseInt(statusFilter, 10) ||
      statusNames[a.status]?.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeAdSetsCount = adSets.filter((a) => a.status === 0).length;

  const getCampaignName = (cId) => {
    const found = campaigns.find((c) => c.id === cId);
    return found ? found.name : `Campaign #${cId}`;
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
    <DashboardLayout title="AdSets Management | Dasher">
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
              Ad Sets
            </li>
          </ol>
        </nav>

        {/* Header Title & Actions */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
          <div>
            <h2 className="h4 mb-1 fw-bold text-dark">Ad Sets</h2>
            <p className="text-secondary mb-0">Manage target audiences, demographics, and campaign ad sets.</p>
          </div>
          <button onClick={handleOpenAddModal} className="btn btn-primary d-inline-flex align-items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New AdSet
          </button>
        </div>

        {/* KPI Metrics Summary */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-3 p-3">
              <span className="text-secondary small fw-medium">Total AdSets</span>
              <h3 className="h4 mb-0 fw-bold mt-2">{adSets.length}</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-3 p-3">
              <span className="text-secondary small fw-medium">Active AdSets</span>
              <h3 className="h4 mb-0 fw-bold mt-2 text-success">{activeAdSetsCount}</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-3 p-3">
              <span className="text-secondary small fw-medium">Associated Campaigns</span>
              <h3 className="h4 mb-0 fw-bold mt-2 text-primary">{campaigns.length}</h3>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-3 p-3">
              <span className="text-secondary small fw-medium">Audience Types</span>
              <h3 className="h4 mb-0 fw-bold mt-2 text-info">
                {new Set(adSets.map((a) => a.audienceType)).size || 1}
              </h3>
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
                    placeholder="Search ad sets, audiences..."
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
                Loading ad sets...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-danger">{error}</div>
            ) : filteredAdSets.length === 0 ? (
              <div className="p-5 text-center text-secondary">No ad sets found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">AdSet Name</th>
                      <th>Campaign</th>
                      <th>Audience Type</th>
                      <th>Age Range</th>
                      <th>Gender</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th className="pe-4 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdSets.map((adSet) => (
                      <tr key={adSet.id}>
                        <td className="ps-4">
                          <Link
                            to={`/Adsets/${adSet.id}`}
                            className="fw-semibold text-body-emphasis text-decoration-none hover-primary"
                            title={`View ad set details for ${adSet.name}`}
                          >
                            {adSet.name}
                          </Link>
                        </td>
                        <td>
                          <Link
                            to={`/Campaigns/${adSet.campaignId || 1}`}
                            className="text-secondary text-decoration-none hover-primary small fw-medium"
                            title={`View campaign details`}
                          >
                            {getCampaignName(adSet.campaignId)}
                          </Link>
                        </td>
                        <td>
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                            {adSet.audienceType}
                          </span>
                        </td>
                        <td className="fw-medium text-dark">{adSet.ageRange}</td>
                        <td className="text-secondary">{genderNames[adSet.gender] || 'All'}</td>
                        <td className="text-secondary">{adSet.location || 'Global'}</td>
                        <td>{getStatusBadge(adSet.status)}</td>
                        <td className="pe-4 text-end">
                          <div className="d-inline-flex align-items-center gap-1">
                            <button
                              onClick={() => handleOpenEditModal(adSet)}
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 px-2 py-1"
                              title="Edit AdSet"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"/>
                                <path d="M13.5 6.5l4 4"/>
                              </svg>
                              <span className="d-none d-md-inline small">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(adSet.id)}
                              className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 px-2 py-1"
                              title="Delete AdSet"
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                  <h5 className="modal-title fw-bold">
                    {editingAdSet ? 'Edit AdSet' : 'Create New AdSet'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label fw-medium">AdSet Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. US - Retargeting - 25-45"
                      />
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="form-label fw-medium">Campaign *</label>
                        <select
                          className="form-select"
                          required
                          value={formData.campaignId}
                          onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
                        >
                          {campaigns.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-medium">Audience Type</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={formData.audienceType}
                          onChange={(e) => setFormData({ ...formData, audienceType: e.target.value })}
                          placeholder="e.g. Lookalike 1%"
                        />
                      </div>
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="form-label fw-medium">Age Range</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={formData.ageRange}
                          onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                          placeholder="e.g. 18-35"
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-medium">Gender</label>
                        <select
                          className="form-select"
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        >
                          {genderNames.map((name, idx) => (
                            <option key={idx} value={idx}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="form-label fw-medium">Location</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="e.g. California, US"
                        />
                      </div>
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
                      {editingAdSet ? 'Save Changes' : 'Create AdSet'}
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
