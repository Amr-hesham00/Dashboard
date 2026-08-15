import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { getClientByIdApi, getUsersApi } from '../api/clients';
import { getAuthHeaders } from '../api/auth';

export default function ClientDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [manager, setManager] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadClientDetails() {
      try {
        setLoading(true);
        setError('');
        
        // Fetch client details
        const clientData = await getClientByIdApi(id);
        setClient(clientData);

        // Fetch users to locate assigned manager
        const usersList = await getUsersApi();
        const foundManager = usersList.find((u) => u.id === clientData.managerId);
        setManager(foundManager || { id: clientData.managerId, userName: 'System Admin', email: 'admin@dashboard.com' });

        // Fetch platforms and campaigns to perform client-side relational joining
        const headers = getAuthHeaders();
        const [platformsRes, campaignsRes] = await Promise.all([
          fetch('/api/Platform', { headers }),
          fetch('/api/Campaign', { headers }),
        ]);

        const platformList = platformsRes.ok ? await platformsRes.json() : [];
        const campaignList = campaignsRes.ok ? await campaignsRes.json() : [];

        // Filter platforms for this client
        const clientPlatforms = platformList.filter((p) => p.clientId === Number(id));
        setPlatforms(clientPlatforms);

        // Filter campaigns belonging to this client's platforms
        const clientPlatformIds = clientPlatforms.map((p) => p.id);
        const clientCampaigns = campaignList.filter((c) => clientPlatformIds.includes(c.platformId));
        setCampaigns(clientCampaigns);

      } catch (err) {
        setError(err.message || 'Failed to load client details.');
      } finally {
        setLoading(false);
      }
    }
    loadClientDetails();
  }, [id]);

  const getStatusBadge = (status) => {
    const statuses = ['Active', 'Inactive', 'Lead', 'Archived'];
    const statusName = typeof status === 'number' ? statuses[status] || 'Active' : String(status);
    
    const badgeClass =
      statusName === 'Active' || statusName === '0'
        ? 'badge text-success-emphasis bg-success-subtle'
        : statusName === 'Inactive' || statusName === '1'
        ? 'badge text-secondary-emphasis bg-secondary-subtle'
        : 'badge text-info-emphasis bg-info-subtle';

    return <span className={`${badgeClass} fs-6`}>{statusName}</span>;
  };

  const getCurrencyName = (curr) => {
    const currencies = ['USD', 'EUR', 'GBP'];
    return typeof curr === 'number' ? currencies[curr] || 'USD' : String(curr);
  };

  if (loading) {
    return (
      <DashboardLayout title="Loading Client Details... | Dasher">
        <div className="d-flex align-items-center justify-content-center py-10 w-100">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !client) {
    return (
      <DashboardLayout title="Error | Dasher">
        <div className="p-4">
          <div className="alert alert-danger" role="alert">
            {error || 'Client details not found.'}
          </div>
          <button className="btn btn-outline-primary" onClick={() => navigate('/clients')}>
            Back to Clients List
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`${client.companyName} Details | Dasher`}>
      <div id="content" className="position-relative h-100 p-4">
        {/* Breadcrumb Navigation */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Dashboard</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/clients">Clients</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {client.companyName} Details
            </li>
          </ol>
        </nav>

        {/* Action Header */}
        <div className="d-flex justify-content-between align-items-center mb-6">
          <div className="d-flex align-items-center gap-3">
            <div className="avatar avatar-lg bg-primary-subtle text-primary rounded-3 d-flex align-items-center justify-content-center fw-bold fs-4">
              {client.companyName ? client.companyName.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <h1 className="h2 mb-0">{client.companyName}</h1>
              <p className="text-secondary mb-0">Client Portfolio Management Dashboard</p>
            </div>
          </div>
          <button className="btn btn-outline-secondary" onClick={() => navigate('/clients')}>
            <i className="ti ti-arrow-left"></i> Back
          </button>
        </div>

        <div className="row g-6">
          {/* Left Column (8-col) */}
          <div className="col-xl-8 col-lg-7 col-12">
            <div className="d-flex flex-column gap-6">
              
              {/* Company Info Details Card */}
              <div className="card">
                <div className="card-header border-dashed-bottom">
                  <h5 className="mb-0">Company Information</h5>
                </div>
                <div className="card-body">
                  <div className="row g-4">
                    <div className="col-md-6 col-12">
                      <small className="text-secondary d-block">Website</small>
                      <a
                        href={client.website?.startsWith('http') ? client.website : `https://${client.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="fw-semibold text-primary"
                      >
                        {client.website}
                      </a>
                    </div>
                    <div className="col-md-6 col-12">
                      <small className="text-secondary d-block">Email Address</small>
                      <span className="fw-semibold">{client.email}</span>
                    </div>
                    <div className="col-md-6 col-12">
                      <small className="text-secondary d-block">Phone Number</small>
                      <span className="fw-semibold">{client.phone}</span>
                    </div>
                    <div className="col-md-6 col-12">
                      <small className="text-secondary d-block">Country Location</small>
                      <span className="fw-semibold">{client.country}</span>
                    </div>
                    <div className="col-md-6 col-12">
                      <small className="text-secondary d-block">Client Currency</small>
                      <span className="badge bg-light text-dark border">{getCurrencyName(client.currency)}</span>
                    </div>
                    <div className="col-md-6 col-12">
                      <small className="text-secondary d-block">Created On</small>
                      <span className="fw-semibold">{new Date(client.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Card */}
              <div className="card">
                <div className="card-header border-dashed-bottom">
                  <h5 className="mb-0">Client Portfolio Notes</h5>
                </div>
                <div className="card-body">
                  <p className="mb-0 text-dark bg-light p-4 rounded-3 border-start border-primary border-4 text-justify" style={{ whiteSpace: 'pre-wrap' }}>
                    {client.notes || 'No notes available for this client portfolio.'}
                  </p>
                </div>
              </div>

              {/* Platforms & Campaigns Table Card */}
              <div className="card">
                <div className="card-header border-dashed-bottom">
                  <h5 className="mb-0">Linked Platforms & Campaigns</h5>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table text-nowrap mb-0 table-centered">
                      <thead className="table-light">
                        <tr>
                          <th>Campaign Name</th>
                          <th>Spend</th>
                          <th>Revenue</th>
                          <th>ROAS</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-5 text-secondary">
                              No campaigns linked to this client yet.
                            </td>
                          </tr>
                        ) : (
                          campaigns.map((camp) => (
                            <tr key={camp.id}>
                              <td>
                                <div>
                                  <h6 className="mb-0">{camp.name}</h6>
                                  <small className="text-secondary">Platform: {platforms.find(p => p.id === camp.platformId)?.platformType ?? 'Digital Ad'}</small>
                                </div>
                              </td>
                              <td>{camp.spend?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                              <td>{camp.revenue?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                              <td><span className="fw-bold">{camp.roas?.toFixed(2)}x</span></td>
                              <td>
                                <span className={camp.status === 'Active' || camp.status === 0 ? 'badge text-success-emphasis bg-success-subtle' : 'badge text-secondary-emphasis bg-secondary-subtle'}>
                                  {camp.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column (4-col) */}
          <div className="col-xl-4 col-lg-5 col-12">
            <div className="d-flex flex-column gap-6">
              
              {/* Status Display Card */}
              <div className="card text-center py-5 px-4">
                <div className="card-body d-flex flex-column align-items-center gap-3">
                  <span className="text-secondary small uppercase fw-bold tracking-wider">Client Status</span>
                  {getStatusBadge(client.status)}
                </div>
              </div>

              {/* Manager Card */}
              {manager && (
                <div className="card">
                  <div className="card-header border-dashed-bottom">
                    <h5 className="mb-0">Assigned Account Manager</h5>
                  </div>
                  <div className="card-body text-center py-6">
                    <div className="avatar avatar-xl bg-info-subtle text-info rounded-circle d-flex align-items-center justify-content-center fw-bold fs-3 mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
                      {manager.firstName ? manager.firstName.charAt(0).toUpperCase() : manager.userName.charAt(0).toUpperCase()}
                    </div>
                    <h5 className="mb-1">{manager.firstName ? `${manager.firstName} ${manager.lastName || ''}`.trim() : manager.userName}</h5>
                    <span className="badge bg-info-subtle text-info-emphasis mb-4">
                      {manager.role === 0 ? 'Administrator' : manager.role === 1 ? 'Manager' : 'User'}
                    </span>
                    
                    <hr className="my-4 border-dashed" />
                    
                    <div className="text-start d-flex flex-column gap-3">
                      <div>
                        <small className="text-secondary d-block">Email Address</small>
                        <span className="fw-semibold text-break">{manager.email}</span>
                      </div>
                      <div>
                        <small className="text-secondary d-block">Phone Number</small>
                        <span className="fw-semibold">{manager.phoneNumber || 'N/A'}</span>
                      </div>
                      <div>
                        <small className="text-secondary d-block">User Account ID</small>
                        <code className="small text-secondary">{manager.id}</code>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
