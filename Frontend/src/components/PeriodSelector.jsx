import React, { useState, useEffect, useRef } from 'react';

const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <rect x="4" y="5" width="16" height="16" rx="2" />
    <line x1="16" y1="3" x2="16" y2="7" />
    <line x1="8" y1="3" x2="8" y2="7" />
    <line x1="4" y1="11" x2="20" y2="11" />
  </svg>
);

const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const PRESET_DATE_RANGES = [
  'Last 7 Days',
  'Last 30 Days',
  'This Month',
  'This Year',
];

export function getDaysForPreset(range) {
  switch (range) {
    case 'Last 7 Days': return 7;
    case 'Last 30 Days': return 30;
    case 'This Month': return 31;
    case 'This Year': return 243;
    case 'Year to Date': return 243;
    default: return 30;
  }
}

export function formatDDMMYY(dateInput) {
  if (!dateInput) return '';
  const d = new Date(String(dateInput).includes('T') ? dateInput : `${dateInput}T00:00:00`);
  if (isNaN(d.getTime())) return String(dateInput);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

export default function PeriodSelector({
  value = 'Last 30 Days',
  onChange,
  className = '',
  defaultStartDate = '2026-08-01',
  defaultEndDate = '2026-08-31',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [isCustomActive, setIsCustomActive] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSelectPreset = (preset) => {
    setIsCustomActive(false);
    setShowCustom(false);
    setIsOpen(false);
    if (onChange) {
      const days = getDaysForPreset(preset);
      let presetStartDate = null;
      let presetEndDate = '2026-08-31';
      if (preset === 'Last 7 Days') {
        presetStartDate = '2026-08-25';
      } else if (preset === 'Last 30 Days') {
        presetStartDate = '2026-08-02';
      } else if (preset === 'This Month') {
        presetStartDate = '2026-08-01';
      } else if (preset === 'This Year') {
        presetStartDate = '2026-01-01';
      }
      onChange({
        label: preset,
        days,
        isCustom: false,
        startDate: presetStartDate,
        endDate: presetEndDate,
      });
    }
  };

  const handleApplyCustom = () => {
    if (!startDate || !endDate || startDate > endDate) return;
    const startObj = new Date(startDate + 'T00:00:00');
    const endObj = new Date(endDate + 'T00:00:00');
    const startFormatted = formatDDMMYY(startDate);
    const endFormatted = formatDDMMYY(endDate);
    const label = startFormatted === endFormatted ? startFormatted : `${startFormatted} – ${endFormatted}`;
    const diffMs = endObj.getTime() - startObj.getTime();
    const days = Math.max(1, Math.round(diffMs / 86400000) + 1);

    setIsCustomActive(true);
    setIsOpen(false);
    if (onChange) {
      onChange({
        label,
        days,
        isCustom: true,
        startDate,
        endDate,
      });
    }
  };

  const handleReset = () => {
    setIsCustomActive(false);
    setShowCustom(false);
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
    handleSelectPreset('Last 30 Days');
  };

  return (
    <div className={`position-relative date-dropdown-container ${className}`} ref={containerRef}>
      <button
        type="button"
        className={`btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2 px-3 ${isCustomActive ? 'border-primary text-primary fw-semibold' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Select date period"
      >
        <IconCalendar />
        <span className="d-none d-md-inline">{value}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="dropdown-menu show position-absolute end-0 mt-1 shadow-lg border p-2 bg-body rounded-3"
          style={{ zIndex: 1060, minWidth: 280 }}
        >
          {/* Preset list */}
          <div className="d-flex flex-column gap-0.5 mb-2">
            {PRESET_DATE_RANGES.map((preset) => {
              const isActive = value === preset && !isCustomActive;
              return (
                <button
                  key={preset}
                  type="button"
                  className={`dropdown-item small px-2.5 py-1.5 rounded-2 d-flex align-items-center justify-content-between ${isActive ? 'fw-bold text-primary bg-primary-subtle' : ''}`}
                  onClick={() => handleSelectPreset(preset)}
                >
                  <span>{preset}</span>
                  {isActive && <IconCheck />}
                </button>
              );
            })}
          </div>

          <div className="dropdown-divider my-1 opacity-50" />

          {/* Custom Date Range Section */}
          <div className="p-1">
            <button
              type="button"
              className={`btn btn-sm w-100 d-flex align-items-center justify-content-between px-2.5 py-1.5 rounded-2 border-0 ${isCustomActive || showCustom ? 'text-primary bg-primary-subtle fw-bold' : 'text-body-secondary'}`}
              onClick={() => setShowCustom(!showCustom)}
            >
              <span className="d-flex align-items-center gap-2 small">
                <IconCalendar /> Custom Date Range
              </span>
              <span className="small">{showCustom ? '▲' : '▼'}</span>
            </button>

            {(showCustom || isCustomActive) && (
              <div className="mt-2 pt-2 border-top">
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label text-secondary mb-1" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      From
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-secondary mb-1" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      To
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>


                {startDate && endDate && startDate > endDate && (
                  <div className="text-danger small mb-2" style={{ fontSize: '0.72rem' }}>
                    'To' date must be after 'From' date
                  </div>
                )}

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary flex-grow-1"
                    onClick={handleApplyCustom}
                    disabled={!startDate || !endDate || startDate > endDate}
                  >
                    Apply Range
                  </button>
                  {isCustomActive && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={handleReset}
                      title="Reset to Last 30 Days"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
