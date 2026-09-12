import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from './DashboardLayout.jsx';
import { mockClients, mockReports } from '../mock/mockData.js';

export default function ReportsPage() {
  const [reports, setReports] = useState(mockReports);

  const [toastMsg, setToastMsg] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [newReport, setNewReport] = useState({
    title: '',
    client: mockClients[0]?.companyName || 'Acme Corporation',
    period: 'Last 30 Days',
    format: 'PDF',
  });

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!newReport.title.trim()) return;

    const rep = {
      id: `rep-${Date.now()}`,
      title: newReport.title.trim(),
      client: newReport.client,
      period: newReport.period,
      generatedDate: 'Just now',
      format: newReport.format,
      size: newReport.format === 'PDF' ? '2.8 MB' : '650 KB',
      status: 'Ready',
    };

    setReports([rep, ...reports]);
    setShowGenerateModal(false);
    setNewReport({ title: '', client: mockClients[0]?.companyName || '', period: 'Last 30 Days', format: 'PDF' });
    setToastMsg(`Report "${rep.title}" generated successfully!`);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleDownload = (title) => {
    setToastMsg(`Downloading report: "${title}"...`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleShare = (title) => {
    navigator.clipboard?.writeText(window.location.href);
    setToastMsg(`Shareable link copied for "${title}"`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <DashboardLayout title="Performance Reports & Exports | Dasher" pageTitle="Reports">
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
              Reports
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
          <div>
            <h1 className="h3 mb-0 fw-bold text-body-emphasis">Performance Reports &amp; Exports</h1>
            <p className="text-secondary small mb-0 mt-1">
              Generate, schedule, and export custom client reports and multi-channel audit files.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 rounded-2 shadow-xs fw-semibold"
              onClick={() => setShowGenerateModal(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Generate Report</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-body p-3 d-flex align-items-center gap-3">
                <div className="avatar bg-primary-subtle text-primary rounded-3 p-2.5 d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/><path d="M9 17l0 -5"/><path d="M12 17l0 -1"/><path d="M15 17l0 -3"/></svg>
                </div>
                <div>
                  <div className="text-secondary small fw-medium">Generated Reports</div>
                  <div className="fs-4 fw-bold text-body-emphasis">{reports.length} Reports</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-body p-3 d-flex align-items-center gap-3">
                <div className="avatar bg-success-subtle text-success rounded-3 p-2.5 d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <div className="text-secondary small fw-medium">Scheduled Automations</div>
                  <div className="fs-4 fw-bold text-success">6 Active Crons</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-body p-3 d-flex align-items-center gap-3">
                <div className="avatar bg-info-subtle text-info rounded-3 p-2.5 d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </div>
                <div>
                  <div className="text-secondary small fw-medium">Total Downloads</div>
                  <div className="fs-4 fw-bold text-info">142 Exports</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-3 h-100">
              <div className="card-body p-3 d-flex align-items-center gap-3">
                <div className="avatar bg-warning-subtle text-warning rounded-3 p-2.5 d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div>
                  <div className="text-secondary small fw-medium">Client Coverage</div>
                  <div className="fs-4 fw-bold text-warning-emphasis">100% Synced</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Table Card */}
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-header bg-transparent border-bottom p-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 className="mb-1 fw-bold text-body-emphasis">Recent Reports &amp; Exports</h5>
              <small className="text-secondary">Exported reports available for immediate download or sharing</small>
            </div>
            <span className="badge bg-body-tertiary text-body border px-2.5 py-1">{reports.length} Total Reports</span>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table align-middle text-nowrap mb-0 table-hover">
                <thead className="table-light bg-body-tertiary">
                  <tr>
                    <th className="ps-4 text-body fw-bold">Report Title</th>
                    <th className="text-body fw-bold">Client</th>
                    <th className="text-body fw-bold">Reporting Period</th>
                    <th className="text-body fw-bold">Format</th>
                    <th className="text-body fw-bold">Size</th>
                    <th className="text-body fw-bold">Generated</th>
                    <th className="pe-4 text-end text-body fw-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((rep) => (
                    <tr key={rep.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-2">
                          <span className={`badge p-1.5 rounded-2 ${rep.format === 'PDF' ? 'bg-danger-subtle text-danger' : rep.format === 'CSV' ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/></svg>
                          </span>
                          <span className="fw-semibold text-body-emphasis fs-6">{rep.title}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-body-secondary text-body fw-medium border px-2 py-1">
                          {rep.client}
                        </span>
                      </td>
                      <td className="text-secondary small">{rep.period}</td>
                      <td>
                        <span className={`badge fw-bold px-2 py-0.5 rounded-pill ${rep.format === 'PDF' ? 'bg-danger-subtle text-danger border border-danger-subtle' : rep.format === 'CSV' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-primary-subtle text-primary border border-primary-subtle'}`}>
                          {rep.format}
                        </span>
                      </td>
                      <td className="text-secondary small">{rep.size}</td>
                      <td className="text-secondary small">{rep.generatedDate}</td>
                      <td className="pe-4 text-end">
                        <div className="d-inline-flex align-items-center gap-1.5">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 px-2.5 py-1 rounded-2"
                            onClick={() => handleDownload(rep.title)}
                            title="Download Report"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            <span>Download</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center p-1.5 rounded-2"
                            onClick={() => handleShare(rep.title)}
                            title="Share Link"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
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

        {/* Generate Report Modal */}
        {showGenerateModal && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
            tabIndex="-1"
            onClick={() => setShowGenerateModal(false)}
          >
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content border-0 shadow-lg rounded-3">
                <div className="modal-header border-bottom p-4">
                  <h5 className="modal-title fw-bold text-body-emphasis">Generate New Report</h5>
                  <button type="button" className="btn-close" onClick={() => setShowGenerateModal(false)}></button>
                </div>
                <form onSubmit={handleGenerate}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Report Title</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Monthly Executive Growth Report"
                        required
                        value={newReport.title}
                        onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Select Client</label>
                      <select
                        className="form-select"
                        value={newReport.client}
                        onChange={(e) => setNewReport({ ...newReport, client: e.target.value })}
                      >
                        {mockClients.map((c) => (
                          <option key={c.id} value={c.companyName}>{c.companyName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="form-label fw-semibold small">Period</label>
                        <select
                          className="form-select"
                          value={newReport.period}
                          onChange={(e) => setNewReport({ ...newReport, period: e.target.value })}
                        >
                          <option value="Last 7 Days">Last 7 Days</option>
                          <option value="Last 30 Days">Last 30 Days</option>
                          <option value="Last 90 Days">Last 90 Days</option>
                          <option value="This Month">This Month</option>
                          <option value="Year to Date">Year to Date</option>
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-semibold small">Format</label>
                        <select
                          className="form-select"
                          value={newReport.format}
                          onChange={(e) => setNewReport({ ...newReport, format: e.target.value })}
                        >
                          <option value="PDF">PDF Report</option>
                          <option value="CSV">CSV Data Export</option>
                          <option value="Excel">Excel Spreadsheet</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-top p-3 d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-outline-secondary px-3" onClick={() => setShowGenerateModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary px-4 fw-semibold shadow-xs">
                      Generate &amp; Download
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
