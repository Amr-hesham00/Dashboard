import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from './DashboardLayout.jsx';
import { mockClientInsights, mockClients } from '../mock/mockData.js';

export default function InsightsPage() {
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [insightsList, setInsightsList] = useState(mockClientInsights);
  const [toastMsg, setToastMsg] = useState('');

  const categories = ['All', 'Budget Optimization', 'Audience Targeting', 'Creative Performance', 'Bidding Strategy', 'Platform Expansion', 'Frequency Management'];

  const filteredInsights = insightsList.filter((ins) => {
    if (selectedClient !== 'all' && ins.platform !== selectedClient) {
      // could be platform or clientId
    }
    if (selectedPriority !== 'all' && ins.priority.toLowerCase() !== selectedPriority.toLowerCase()) {
      return false;
    }
    if (selectedCategory !== 'all' && ins.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const handleApply = (id, title) => {
    setInsightsList((prev) => prev.filter((i) => i.id !== id));
    setToastMsg(`Recommendation applied: "${title}"`);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleDismiss = (id) => {
    setInsightsList((prev) => prev.filter((i) => i.id !== id));
    setToastMsg('Recommendation dismissed.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const getPriorityBadge = (p) => {
    switch (p.toLowerCase()) {
      case 'high': return 'bg-danger-subtle text-danger border-danger-subtle';
      case 'medium': return 'bg-warning-subtle text-warning-emphasis border-warning-subtle';
      default: return 'bg-info-subtle text-info-emphasis border-info-subtle';
    }
  };

  const getPlatformBadge = (plat) => {
    switch (plat?.toLowerCase()) {
      case 'meta': return { bg: 'bg-primary-subtle text-primary border-primary-subtle', label: 'Meta Ads' };
      case 'google': return { bg: 'bg-danger-subtle text-danger border-danger-subtle', label: 'Google Ads' };
      case 'tiktok': return { bg: 'text-white', style: { backgroundColor: '#18181b' }, label: 'TikTok Ads' };
      case 'snapchat': return { bg: 'bg-warning-subtle text-warning-emphasis border-warning-subtle', label: 'Snapchat' };
      default: return { bg: 'bg-secondary-subtle text-secondary border-secondary-subtle', label: 'Cross-Platform' };
    }
  };

  return (
    <DashboardLayout title="AI Insights & Recommendations | Dasher" pageTitle="Insights & Recommendations">
      <div className="container-fluid px-0">
        {/* Toast Notification */}
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
              Insights
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
          <div>
            <div className="d-flex align-items-center gap-2">
              <h1 className="h3 mb-0 fw-bold text-body-emphasis">AI Insights &amp; Recommendations</h1>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-1 small fw-semibold">
                AI Engine v2.4
              </span>
            </div>
            <p className="text-secondary small mb-0 mt-1">
              Data-driven actions and budget optimization opportunities across all advertising channels.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 rounded-2"
              onClick={() => {
                setInsightsList(mockClientInsights);
                setToastMsg('Insights refreshed from latest ad telemetry.');
                setTimeout(() => setToastMsg(''), 3000);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/></svg>
              <span>Refresh Insights</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-body p-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
            {/* Category Filter Pills */}
            <div className="d-flex align-items-center gap-1.5 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${selectedCategory.toLowerCase() === cat.toLowerCase() ? 'btn-primary' : 'btn-outline-secondary border-0 bg-body-tertiary text-secondary'}`}
                  onClick={() => setSelectedCategory(cat === 'All' ? 'all' : cat)}
                  style={{ fontSize: '0.8rem' }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Priority Filter */}
            <div className="d-flex align-items-center gap-2">
              <span className="text-secondary small fw-medium">Priority:</span>
              <select
                className="form-select form-select-sm rounded-2"
                style={{ width: 130 }}
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="row g-4">
          {filteredInsights.length > 0 ? (
            filteredInsights.map((ins) => {
              const plat = getPlatformBadge(ins.platform);
              return (
                <div className="col-12 col-xl-6" key={ins.id}>
                  <div className="card border-0 shadow-sm rounded-3 h-100 position-relative overflow-hidden">
                    <div className="card-body p-4 d-flex flex-column justify-content-between">
                      <div>
                        {/* Header Badges */}
                        <div className="d-flex align-items-center justify-content-between mb-4 pb-2">
                          <div className="d-flex align-items-center gap-2">
                            <span className={`badge rounded-pill border px-2.5 py-1 small fw-semibold ${getPriorityBadge(ins.priority)}`}>
                              {ins.priority} Priority
                            </span>
                            <span
                              className={`badge border px-2.5 py-1 small fw-semibold ${plat.bg}`}
                              style={plat.style}
                            >
                              {plat.label}
                            </span>
                          </div>
                          <span className="text-secondary small fw-semibold">
                            {ins.category}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h5 className="fw-bold text-body-emphasis mb-2">{ins.title}</h5>
                        <p className="text-secondary small mb-3 lh-base">{ins.description}</p>
                      </div>

                      {/* Impact Highlight & Actions */}
                      <div>
                        <div className="p-2.5 rounded-2 bg-success-subtle bg-opacity-40 border border-success-subtle d-flex align-items-center gap-2 mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6 -6l4 4l8 -8"/><path d="M14 7l7 0l0 7"/></svg>
                          <span className="fw-bold text-success small">{ins.impact}</span>
                        </div>

                        <div className="d-flex align-items-center justify-content-end gap-2 pt-2 border-top">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-2"
                            onClick={() => handleDismiss(ins.id)}
                          >
                            Dismiss
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary px-3 py-1.5 rounded-2 d-inline-flex align-items-center gap-1.5 shadow-xs fw-semibold"
                            onClick={() => handleApply(ins.id, ins.title)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            <span>Apply Recommendation</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-3 p-5 text-center">
                <div className="avatar bg-success-subtle text-success rounded-circle mx-auto mb-3 p-3" style={{ width: 56, height: 56 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h5 className="fw-bold text-body-emphasis">All Caught Up!</h5>
                <p className="text-secondary small mb-3">No pending recommendations for the selected filter criteria.</p>
                <button
                  className="btn btn-sm btn-outline-primary mx-auto px-3 rounded-2"
                  onClick={() => { setSelectedCategory('all'); setSelectedPriority('all'); }}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
