import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from './DashboardLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { mockUsers, mockClients, mockTeamMembers } from '../mock/mockData.js';

export default function TeamPage() {
  const { user, isAdmin } = useAuth();
  const [teamMembers, setTeamMembers] = useState(mockTeamMembers);

  const [toastMsg, setToastMsg] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'Growth Specialist & Media Buyer',
    skills: 'Meta Ads, Google Ads',
  });

  const getMemberInitials = (name) => {
    if (!name) return 'TM';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getMemberGradient = (name) => {
    const gradients = [
      'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      'linear-gradient(135deg, #059669 0%, #047857 100%)',
      'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
      'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return gradients[Math.abs(hash) % gradients.length];
  };

  const handleInvite = (e) => {
    e.preventDefault();
    if (!newMember.name.trim() || !newMember.email.trim()) return;

    const member = {
      id: `usr-${Date.now()}`,
      name: newMember.name.trim(),
      email: newMember.email.trim(),
      role: newMember.role,
      skills: newMember.skills.split(',').map((s) => s.trim()).filter(Boolean),
      assignedClients: [],
      rating: 5.0,
      status: 'Active',
    };

    setTeamMembers([...teamMembers, member]);
    setShowInviteModal(false);
    setNewMember({ name: '', email: '', role: 'Growth Specialist & Media Buyer', skills: 'Meta Ads, Google Ads' });
    setToastMsg(`Invitation sent to ${member.email}!`);
    setTimeout(() => setToastMsg(''), 3500);
  };

  return (
    <DashboardLayout title="Team & Specialists | Dasher" pageTitle="Team">
      <div className="container-fluid px-0">
        {/* Toast */}
        {toastMsg && (
          <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
            <div className="toast show align-items-center text-bg-dark border-0 shadow-lg" role="alert">
              <div className="d-flex">
                <div className="toast-body d-flex align-items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {toastMsg}
                </div>
                <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToastMsg('')}></button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Breadcrumb ─── */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb mb-0 py-0 bg-transparent small align-items-center">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none fw-semibold text-secondary hover-primary">
                Dashboard
              </Link>
            </li>
            <li className="breadcrumb-item active text-success fw-semibold" aria-current="page">
              Team
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
          <div>
            <h1 className="h3 mb-0 fw-bold text-body-emphasis">Team Members &amp; Specialists</h1>
            <p className="text-secondary small mb-0 mt-1">
              Manage agency media buyers, campaign managers, and client portfolio allocations.
            </p>
          </div>

          {isAdmin && (
            <div className="d-flex align-items-center gap-2">
              <Link
                to="/pages/authentication/sign-up"
                className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 rounded-2 shadow-xs fw-semibold"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>Register New Manager</span>
              </Link>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-body p-3 d-flex align-items-center gap-3">
                <div className="avatar bg-primary-subtle text-primary rounded-3 p-2.5 d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div>
                  <div className="text-secondary small fw-medium">Active Specialists</div>
                  <div className="fs-4 fw-bold text-body-emphasis">{teamMembers.length} Members</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-body p-3 d-flex align-items-center gap-3">
                <div className="avatar bg-success-subtle text-success rounded-3 p-2.5 d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </div>
                <div>
                  <div className="text-secondary small fw-medium">Managed Clients</div>
                  <div className="fs-4 fw-bold text-success">{mockClients.length} Accounts</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-body p-3 d-flex align-items-center gap-3">
                <div className="avatar bg-warning-subtle text-warning rounded-3 p-2.5 d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <div>
                  <div className="text-secondary small fw-medium">Avg Performance Rating</div>
                  <div className="fs-4 fw-bold text-warning-emphasis">4.90 / 5.0 ⭐</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-body p-3 d-flex align-items-center gap-3">
                <div className="avatar bg-info-subtle text-info rounded-3 p-2.5 d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div>
                  <div className="text-secondary small fw-medium">Portfolio Allocation</div>
                  <div className="fs-4 fw-bold text-info">100% Assigned</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Table Card */}
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-header bg-transparent border-bottom p-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 className="mb-1 fw-bold text-body-emphasis">Team Directory</h5>
              <small className="text-secondary">Specialists with active client management responsibilities</small>
            </div>
            <span className="badge bg-body-tertiary text-body border px-2.5 py-1">{teamMembers.length} Members Active</span>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table align-middle text-nowrap mb-0 table-hover">
                <thead className="table-light bg-body-tertiary">
                  <tr>
                    <th className="ps-4 text-body fw-bold">Team Member</th>
                    <th className="text-body fw-bold">Role &amp; Title</th>
                    <th className="text-body fw-bold">Specializations</th>
                    <th className="text-body fw-bold">Assigned Clients</th>
                    <th className="text-body fw-bold">Rating</th>
                    <th className="text-body fw-bold">Status</th>
                    <th className="pe-4 text-end text-body fw-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((tm) => (
                    <tr key={tm.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="d-flex align-items-center justify-content-center text-white fw-bold shadow-xs flex-shrink-0"
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 10,
                              background: getMemberGradient(tm.name),
                              fontSize: '0.95rem',
                            }}
                          >
                            {getMemberInitials(tm.name)}
                          </div>
                          <div>
                            <div className="fw-bold text-body-emphasis">{tm.name}</div>
                            <div className="text-secondary small" style={{ fontSize: '0.78rem' }}>{tm.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="fw-semibold text-body-emphasis small">{tm.role}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1 flex-wrap" style={{ maxWidth: 220 }}>
                          {tm.skills.map((s, idx) => (
                            <span key={idx} className="badge bg-body-secondary text-body-secondary border px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {tm.assignedClients.length > 0 ? (
                          <div className="d-flex align-items-center gap-1 flex-wrap">
                            {tm.assignedClients.map((c, idx) => (
                              <span key={idx} className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-0.5" style={{ fontSize: '0.72rem' }}>
                                {c}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-secondary small fst-italic">No accounts assigned</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <span className="fw-bold text-body-emphasis">{tm.rating.toFixed(2)}</span>
                          <span className="text-warning small">★</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle rounded-pill px-2.5 py-0.5 fw-semibold d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                          <span className="d-inline-block rounded-circle bg-success" style={{ width: 5, height: 5 }}></span>
                          {tm.status}
                        </span>
                      </td>
                      <td className="pe-4 text-end">
                        <div className="d-inline-flex align-items-center gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary px-2.5 py-1 rounded-2 small"
                            onClick={() => {
                              setToastMsg(`Profile options opened for ${tm.name}`);
                              setTimeout(() => setToastMsg(''), 2500);
                            }}
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Invite Member Modal */}
        {showInviteModal && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
            tabIndex="-1"
            onClick={() => setShowInviteModal(false)}
          >
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content border-0 shadow-lg rounded-3">
                <div className="modal-header border-bottom p-4">
                  <h5 className="modal-title fw-bold text-body-emphasis">Invite Team Member</h5>
                  <button type="button" className="btn-close" onClick={() => setShowInviteModal(false)}></button>
                </div>
                <form onSubmit={handleInvite}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Jordan Miller"
                        required
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="jordan.m@agency.com"
                        required
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Role / Position</label>
                      <select
                        className="form-select"
                        value={newMember.role}
                        onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                      >
                        <option value="Senior Media Buyer & Growth Specialist">Senior Media Buyer &amp; Growth Specialist</option>
                        <option value="PPC & Search Specialist">PPC &amp; Search Specialist</option>
                        <option value="Account Director & Client Lead">Account Director &amp; Client Lead</option>
                        <option value="Creative Strategist & UGC Manager">Creative Strategist &amp; UGC Manager</option>
                        <option value="Data & Tracking Engineer">Data &amp; Tracking Engineer</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Specializations (comma-separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Meta Ads, Google Ads, TikTok, CRO"
                        value={newMember.skills}
                        onChange={(e) => setNewMember({ ...newMember, skills: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="modal-footer border-top p-3 d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-outline-secondary px-3" onClick={() => setShowInviteModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary px-4 fw-semibold shadow-xs">
                      Send Invitation
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
