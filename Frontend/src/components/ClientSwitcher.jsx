import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getClientLookupApi } from '../api/clients';

export default function ClientSwitcher({
  currentClientId,
  currentClientName,
  variant = 'topbar', // 'topbar' | 'breadcrumb'
  isActive = false,
  className = '',
  style = {},
}) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    getClientLookupApi()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setClients(data);
        }
      })
      .catch(() => { });
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectClient = (client) => {
    setIsOpen(false);
    if (client?.id && String(client.id) !== String(currentClientId)) {
      navigate(`/clients/${client.id}`);
    }
  };

  const isTopbar = variant === 'topbar';

  let triggerClasses = '';
  if (isTopbar) {
    triggerClasses = 'topbar-page-title';
  } else if (isActive) {
    triggerClasses = 'text-success fw-semibold small';
  } else {
    triggerClasses = 'text-secondary hover-primary fw-semibold small';
  }

  return (
    <div
      ref={dropdownRef}
      className={`position-relative d-inline-block text-start ${className}`}
      style={{ ...style }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`btn p-0 border-0 bg-transparent d-inline-flex align-items-center text-truncate ${triggerClasses}`}
        style={
          isTopbar
            ? {
              letterSpacing: '-0.025em',
              fontSize: '1.5rem',
              fontWeight: 700,
              lineHeight: 1.2,
              cursor: 'pointer',
              gap: '0.4rem',
              color: '#c4cdd5',
            }
            : {
              cursor: 'pointer',
              gap: '0.25rem',
            }
        }
        title={`Switch client (Current: ${currentClientName})`}
        aria-expanded={isOpen}
      >
        <span className="text-truncate" style={{ maxWidth: isTopbar ? '480px' : '220px' }}>
          {currentClientName}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={isTopbar ? 16 : 12}
          height={isTopbar ? 16 : 12}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isTopbar ? 'flex-shrink-0' : 'text-secondary flex-shrink-0'}
          style={{
            color: isTopbar ? '#c4cdd5' : undefined,
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <style>{`
            .client-switcher-menu {
              background-color: #1c252e !important;
              border: 1px solid rgba(255, 255, 255, 0.12) !important;
              box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3) !important;
              border-radius: 12px !important;
              padding: 6px !important;
              backdrop-filter: blur(12px);
            }
            .client-switcher-item {
              color: #cbd5e1 !important;
              border-radius: 8px !important;
              padding: 8px 12px !important;
              transition: background-color 0.15s ease, color 0.15s ease;
              background: transparent;
            }
            .client-switcher-item:hover, .client-switcher-item:focus {
              background-color: rgba(255, 255, 255, 0.08) !important;
              color: #ffffff !important;
            }
            .client-switcher-item.selected {
              background-color: rgba(16, 185, 129, 0.18) !important;
              color: #ffffff !important;
              font-weight: 600 !important;
            }
            .client-switcher-item.selected:hover {
              background-color: rgba(16, 185, 129, 0.25) !important;
            }
            .client-switcher-divider {
              border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
              margin: 5px 0 !important;
            }
            .client-switcher-footer-btn {
              color: #38bdf8 !important;
              border-radius: 8px !important;
              padding: 8px 12px !important;
              transition: all 0.15s ease;
            }
            .client-switcher-footer-btn:hover {
              background-color: rgba(255, 255, 255, 0.08) !important;
              color: #7dd3fc !important;
            }
            .client-switcher-scroll::-webkit-scrollbar {
              width: 5px;
            }
            .client-switcher-scroll::-webkit-scrollbar-track {
              background: transparent;
            }
            .client-switcher-scroll::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.15);
              border-radius: 4px;
            }
            .client-switcher-scroll::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.3);
            }
          `}</style>

          <div
            className="dropdown-menu show client-switcher-menu"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: isTopbar ? '50%' : '0',
              transform: isTopbar ? 'translateX(-50%)' : 'none',
              minWidth: '260px',
              maxWidth: '330px',
              zIndex: 1060,
            }}
          >
            {/* Client List */}
            <div className="client-switcher-scroll" style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {clients.length === 0 ? (
                <div className="px-3 py-2 text-secondary small text-center" style={{ color: '#94a3b8' }}>
                  No clients available
                </div>
              ) : (
                clients.map((client) => {
                  const clientName = client.companyName || client.name;
                  const isSelected =
                    String(client.id) === String(currentClientId) ||
                    clientName.toLowerCase() === String(currentClientName).toLowerCase();

                  return (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => handleSelectClient(client)}
                      className={`dropdown-item client-switcher-item d-flex align-items-center justify-content-between text-start w-100 border-0 ${isSelected ? 'selected' : ''
                        }`}
                      style={{ fontSize: '0.875rem' }}
                    >
                      <span className="text-truncate me-2" title={clientName}>
                        {clientName}
                      </span>
                      {isSelected && (
                        <span className="text-success fw-bold ms-auto flex-shrink-0" style={{ fontSize: '0.95rem', color: '#10b981' }}>
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Divider */}
            <div className="client-switcher-divider" />

            {/* Footer Action: View All Clients */}
            <Link
              to="/clients"
              onClick={() => setIsOpen(false)}
              className="dropdown-item client-switcher-item client-switcher-footer-btn d-flex align-items-center justify-content-between small fw-semibold text-decoration-none"
              style={{ fontSize: '0.82rem' }}
            >
              <span>View all clients</span>
              <span className="ms-1">&rarr;</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
