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
  'Today',
  'Last 7 Days',
  'Last 30 Days',
  'This Month',
  'This Year',
];

export function formatPresetSublabel(preset, customNow) {
  const dates = getPresetDates(preset, customNow);
  if (!dates.startDate || !dates.endDate) return '';
  const startObj = new Date(dates.startDate + 'T00:00:00');
  const endObj = new Date(dates.endDate + 'T00:00:00');

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formatShort = (d, includeYear = false) => {
    const day = d.getDate();
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    return includeYear ? `${day} ${month} ${year}` : `${day} ${month}`;
  };

  if (dates.startDate === dates.endDate) {
    return formatShort(startObj, true);
  }

  const sameYear = startObj.getFullYear() === endObj.getFullYear();
  if (sameYear) {
    return `${formatShort(startObj)} – ${formatShort(endObj, true)}`;
  }
  return `${formatShort(startObj, true)} – ${formatShort(endObj, true)}`;
}

export function getPresetDates(preset, customNow) {
  const now = customNow || new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const formatYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = formatYMD(today);
  const yesterdayStr = formatYMD(yesterday);

  if (preset === 'Today') {
    return {
      label: 'Today',
      startDate: todayStr,
      endDate: todayStr,
      days: 1,
      isCustom: false,
    };
  }

  if (preset === 'Last 7 Days') {
    // 7 completed days ending yesterday (e.g. Nov 1 to Nov 7 when today is Nov 8)
    const start = new Date(yesterday);
    start.setDate(yesterday.getDate() - 6);
    return {
      label: 'Last 7 Days',
      startDate: formatYMD(start),
      endDate: yesterdayStr,
      days: 7,
      isCustom: false,
    };
  }

  if (preset === 'Last 30 Days') {
    // 30 completed days ending yesterday (e.g. Oct 9 to Nov 7 when today is Nov 8)
    const start = new Date(yesterday);
    start.setDate(yesterday.getDate() - 29);
    return {
      label: 'Last 30 Days',
      startDate: formatYMD(start),
      endDate: yesterdayStr,
      days: 30,
      isCustom: false,
    };
  }

  if (preset === 'This Month') {
    // 1st of current month up to yesterday (or today if today is the 1st of the month)
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = today.getDate() === 1 ? today : yesterday;
    const diffMs = end.getTime() - start.getTime();
    const days = Math.max(1, Math.round(diffMs / 86400000) + 1);
    return {
      label: 'This Month',
      startDate: formatYMD(start),
      endDate: formatYMD(end),
      days,
      isCustom: false,
    };
  }

  if (preset === 'This Year') {
    // Jan 1st of current year up to yesterday (or today if Jan 1st)
    const start = new Date(today.getFullYear(), 0, 1);
    const isJanFirst = today.getMonth() === 0 && today.getDate() === 1;
    const end = isJanFirst ? today : yesterday;
    const diffMs = end.getTime() - start.getTime();
    const days = Math.max(1, Math.round(diffMs / 86400000) + 1);
    return {
      label: 'This Year',
      startDate: formatYMD(start),
      endDate: formatYMD(end),
      days,
      isCustom: false,
    };
  }

  return {
    label: preset,
    startDate: formatYMD(new Date(today.getFullYear(), today.getMonth(), 1)),
    endDate: yesterdayStr,
    days: Math.max(1, today.getDate() - 1),
    isCustom: false,
  };
}

export function getDaysForPreset(range) {
  return getPresetDates(range).days;
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
  defaultStartDate,
  defaultEndDate,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const defaultDates = getPresetDates(value || 'Last 30 Days');
  const [startDate, setStartDate] = useState(defaultStartDate || defaultDates.startDate);
  const [endDate, setEndDate] = useState(defaultEndDate || defaultDates.endDate);
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
      const cfg = getPresetDates(preset);
      onChange(cfg);
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
    const def = getPresetDates('Last 30 Days');
    setStartDate(def.startDate);
    setEndDate(def.endDate);
    handleSelectPreset('Last 30 Days');
  };

  return (
    <div className={`position-relative date-dropdown-container ${className}`} ref={containerRef}>
      <button
        type="button"
        className={`btn btn-sm d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-2 shadow-2xs period-selector-btn ${
          isCustomActive ? 'border-primary text-primary fw-semibold' : ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
        title={!isCustomActive && PRESET_DATE_RANGES.includes(value) ? `${value} (${formatPresetSublabel(value)})` : 'Select date period'}
      >
        <span className="text-primary d-inline-flex align-items-center">
          <IconCalendar />
        </span>
        <span className="d-none d-md-inline">{value}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-75">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="dropdown-menu show position-absolute end-0 mt-1 shadow-lg border p-2 rounded-3 period-dropdown-menu"
          style={{ zIndex: 1060, minWidth: 310 }}
        >
          {/* Header */}
          <div className="px-2 pt-1 pb-2 mb-1 d-flex align-items-center justify-content-between border-bottom border-opacity-25">
            <span className="text-uppercase fw-bold text-body-secondary" style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}>
              Select Time Period
            </span>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-1.5 py-0.5 fw-semibold" style={{ fontSize: '0.66rem' }}>
              {value}
            </span>
          </div>

          {/* Preset list */}
          <div className="d-flex flex-column mb-1">
            {PRESET_DATE_RANGES.map((preset) => {
              const isActive = value === preset && !isCustomActive;
              const subtext = formatPresetSublabel(preset);
              return (
                <button
                  key={preset}
                  type="button"
                  className={`date-item-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectPreset(preset)}
                >
                  <div className="d-flex flex-column text-start">
                    <span className="date-item-title">{preset}</span>
                    <span className="date-item-subtitle">{subtext}</span>
                  </div>
                  {isActive ? (
                    <span className="badge bg-white text-primary rounded-circle p-1 d-inline-flex align-items-center justify-content-center shadow-xs">
                      <IconCheck />
                    </span>
                  ) : (
                    <span className="text-secondary opacity-50 pe-1" style={{ fontSize: '0.8rem' }}>
                      ›
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="dropdown-divider my-1 opacity-50" />

          {/* Custom Date Range Section */}
          <div className="p-1">
            <button
              type="button"
              className={`btn btn-sm w-100 d-flex align-items-center justify-content-between px-2.5 py-1.5 rounded-2 border ${
                isCustomActive || showCustom
                  ? 'btn-primary text-white fw-bold shadow-xs'
                  : 'bg-body-secondary text-body-emphasis fw-semibold border-secondary-subtle'
              }`}
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
