import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from './DashboardLayout.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  getAllUsersApi,
  updateUserApi,
  deleteUserApi,
  getRoleName,
  isAdmin as checkIsAdmin,
} from '../api/auth.js';

export default function AdminManagementPage() {
  const { user: currentAuthUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // User Details Modal state (viewing a record)
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Edit Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 0,
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete confirmation state
  const [userToDelete, setUserToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await getAllUsersApi();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load users from backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Open Details Modal on row click
  const handleRowClick = (userItem) => {
    setSelectedUser(userItem);
    setShowDetailsModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (userItem) => {
    setEditingUser(userItem);
    setEditFormData({
      firstName: userItem.firstName || '',
      lastName: userItem.lastName || '',
      email: userItem.email || '',
      phoneNumber: userItem.phoneNumber || '',
      role: userItem.role !== undefined ? Number(userItem.role) : 0,
    });
    setEditError('');
    setShowEditModal(true);
  };

  // Submit Edit / Update
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError('');

    if (!editFormData.firstName.trim() || !editFormData.lastName.trim()) {
      setEditError('First and last name are required.');
      return;
    }
    if (!editFormData.email.trim()) {
      setEditError('Email address is required.');
      return;
    }

    setIsUpdating(true);
    try {
      await updateUserApi(editingUser.id, {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        email: editFormData.email,
        phoneNumber: editFormData.phoneNumber,
        role: editFormData.role,
      });

      showToast(`User "${editingUser.userName || editFormData.email}" updated successfully.`);
      setShowEditModal(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      setEditError(err.message || 'Failed to update user.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete prompt
  const handlePromptDelete = (userItem) => {
    if (userItem.id === currentAuthUser?.id) {
      showToast('You cannot delete your own active Admin account.');
      return;
    }
    setUserToDelete(userItem);
    setShowDeleteConfirm(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUserApi(userToDelete.id);
      showToast(`User "${userToDelete.userName || userToDelete.email}" deleted successfully.`);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      await fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getUserInitials = (userItem) => {
    const name = `${userItem.firstName || ''} ${userItem.lastName || ''}`.trim() || userItem.userName || userItem.email || 'U';
    const parts = name.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getUserGradient = (idOrName) => {
    const gradients = [
      'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      'linear-gradient(135deg, #059669 0%, #047857 100%)',
      'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
      'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
    ];
    let hash = 0;
    const str = String(idOrName || 'user');
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return gradients[Math.abs(hash) % gradients.length];
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const roleName = getRoleName(u.role).toUpperCase();
    if (roleFilter !== 'ALL' && roleName !== roleFilter) return false;

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const userName = (u.userName || '').toLowerCase();
    const email = (u.email || '').toLowerCase();

    return fullName.includes(query) || userName.includes(query) || email.includes(query);
  });

  return (
    <DashboardLayout title="Admin Management | Dasher">
      <div className="container-fluid px-0">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
            <div className="toast show align-items-center text-bg-dark border-0 shadow-lg rounded-3" role="alert">
              <div className="d-flex">
                <div className="toast-body d-flex align-items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{toastMsg}</span>
                </div>
                <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToastMsg('')}></button>
              </div>
            </div>
          </div>
        )}

        {/* Top Header */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
          <div>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb small mb-1">
                <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Admin Management</li>
              </ol>
            </nav>
            <h1 className="h3 mb-0 fw-bold text-body-emphasis">Admin Management</h1>
            <p className="text-secondary small mb-0 mt-1">
              Manage, view details, edit, and delete system users and accounts.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1.5 px-3 py-2 rounded-2"
              onClick={fetchUsers}
              disabled={loading}
              title="Reload Users"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? 'animate-spin' : ''}>
                <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -5v5h5" />
                <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 5v-5h-5" />
              </svg>
              <span>Refresh</span>
            </button>

            <Link
              to="/pages/authentication/sign-up"
              className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2 px-3.5 py-2 rounded-2 shadow-xs fw-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add New Manager</span>
            </Link>
          </div>
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div className="alert alert-danger alert-dismissible fade show rounded-3 mb-4 d-flex align-items-center justify-content-between" role="alert">
            <div className="d-flex align-items-center gap-2">
              <i className="ti ti-alert-circle fs-5"></i>
              <span>{errorMsg}</span>
            </div>
            <button type="button" className="btn-close" onClick={() => setErrorMsg('')} aria-label="Close"></button>
          </div>
        )}

        {/* User Directory Table Card */}
        <div className="card border-0 shadow-sm rounded-3">
          {/* Card Filter & Search Bar */}
          <div className="card-header bg-transparent border-bottom p-3 p-md-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              {/* Role Filter Tabs */}
              <div className="btn-group btn-group-sm" role="group">
                <button
                  type="button"
                  className={`btn ${roleFilter === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setRoleFilter('ALL')}
                >
                  All Users ({users.length})
                </button>
                <button
                  type="button"
                  className={`btn ${roleFilter === 'MANAGER' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setRoleFilter('MANAGER')}
                >
                  Managers ({users.filter((u) => getRoleName(u.role) === 'Manager').length})
                </button>
                <button
                  type="button"
                  className={`btn ${roleFilter === 'ADMIN' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setRoleFilter('ADMIN')}
                >
                  Admins ({users.filter((u) => getRoleName(u.role) === 'Admin').length})
                </button>
              </div>

              {/* Search Box */}
              <div className="position-relative" style={{ minWidth: 260 }}>
                <input
                  type="search"
                  className="form-control form-control-sm ps-4"
                  placeholder="Search by name, username, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="position-absolute top-50 start-0 translate-middle-y ps-2 text-secondary opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="10" cy="10" r="7" />
                    <line x1="21" y1="21" x2="15" y2="15" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary spinner-border-sm mb-2" role="status">
                  <span className="visually-hidden">Loading users...</span>
                </div>
                <div className="small text-secondary">Loading registered users...</div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-5">
                <div className="avatar bg-body-secondary text-secondary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 48, height: 48 }}>
                  <i className="ti ti-users fs-4"></i>
                </div>
                <h6 className="fw-semibold text-body-emphasis mb-1">No users found</h6>
                <p className="text-secondary small mb-3">
                  {searchQuery ? `No user accounts matching "${searchQuery}"` : 'No registered users match the current filter.'}
                </p>
                <Link to="/pages/authentication/sign-up" className="btn btn-sm btn-primary rounded-2">
                  Add New Manager
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle text-nowrap mb-0 table-hover">
                  <thead className="table-light bg-body-tertiary">
                    <tr>
                      <th className="ps-4 text-body fw-bold">User</th>
                      <th className="text-body fw-bold">Email</th>
                      <th className="text-body fw-bold">Role</th>
                      <th className="text-body fw-bold">Phone</th>
                      <th className="text-body fw-bold">Status</th>
                      <th className="pe-4 text-end text-body fw-bold" style={{ minWidth: 140 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const isItemAdmin = checkIsAdmin(u);
                      const isCurrentActive = u.id === currentAuthUser?.id;
                      const roleLabel = getRoleName(u.role);
                      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.userName || 'User';

                      return (
                        <tr
                          key={u.id}
                          onClick={() => handleRowClick(u)}
                          style={{ cursor: 'pointer' }}
                          title="Click to view full user details"
                        >
                          <td className="ps-4">
                            <div className="d-flex align-items-center gap-3">
                              <div
                                className="d-flex align-items-center justify-content-center text-white fw-bold shadow-xs flex-shrink-0"
                                style={{
                                  width: 38,
                                  height: 38,
                                  borderRadius: 10,
                                  background: getUserGradient(u.id || u.userName),
                                  fontSize: '0.88rem',
                                }}
                              >
                                {getUserInitials(u)}
                              </div>
                              <div>
                                <div className="fw-bold text-body-emphasis d-flex align-items-center gap-1.5">
                                  <span>{fullName}</span>
                                  {isCurrentActive && (
                                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-1.5 py-0.5" style={{ fontSize: '0.65rem' }}>
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-secondary small" style={{ fontSize: '0.78rem' }}>
                                  @{u.userName || 'user'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="text-body small">{u.email || '-'}</span>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                isItemAdmin
                                  ? 'bg-purple-subtle text-purple border border-purple-subtle'
                                  : 'bg-success-subtle text-success-emphasis border border-success-subtle'
                              } px-2.5 py-1 rounded-pill fw-semibold`}
                              style={{
                                fontSize: '0.74rem',
                                backgroundColor: isItemAdmin ? 'rgba(124, 58, 237, 0.12)' : undefined,
                                color: isItemAdmin ? '#7c3aed' : undefined,
                              }}
                            >
                              {roleLabel}
                            </span>
                          </td>
                          <td>
                            <span className="text-secondary small">{u.phoneNumber || '-'}</span>
                          </td>
                          <td>
                            <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle rounded-pill px-2 py-0.5 fw-semibold d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                              <span className="d-inline-block rounded-circle bg-success" style={{ width: 5, height: 5 }}></span>
                              Active
                            </span>
                          </td>
                          <td className="pe-4 text-end">
                            <div className="d-inline-flex align-items-center gap-1.5">
                              {/* Edit Action */}
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary px-2.5 py-1 rounded-2 d-inline-flex align-items-center gap-1 shadow-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditModal(u);
                                }}
                                title="Edit User Details"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                  <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                                  <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                                  <path d="M16 5l3 3" />
                                </svg>
                                <span>Edit</span>
                              </button>

                              {/* Delete Action */}
                              {!isCurrentActive && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger px-2.5 py-1 rounded-2 d-inline-flex align-items-center gap-1 shadow-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePromptDelete(u);
                                  }}
                                  title="Delete User"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M4 7l16 0" />
                                    <path d="M10 11l0 6" />
                                    <path d="M14 11l0 6" />
                                    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                                    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                                  </svg>
                                  <span>Delete</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* User Details Modal (Triggered on Row Click) */}
        {showDetailsModal && selectedUser && (
          <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header border-bottom px-4 py-3 bg-body-tertiary">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="d-flex align-items-center justify-content-center text-white fw-bold shadow-xs"
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: getUserGradient(selectedUser.id || selectedUser.userName),
                        fontSize: '0.85rem',
                      }}
                    >
                      {getUserInitials(selectedUser)}
                    </div>
                    <div>
                      <h5 className="modal-title fw-bold text-body-emphasis mb-0">
                        {`${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() || selectedUser.userName}
                      </h5>
                      <small className="text-secondary">@{selectedUser.userName}</small>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedUser(null);
                    }}
                  ></button>
                </div>

                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-sm-6">
                      <div className="p-3 bg-body-tertiary rounded-3 border">
                        <small className="text-secondary d-block fw-semibold" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>User ID</small>
                        <span className="fw-mono small text-body font-monospace text-break" style={{ fontSize: '0.8rem' }}>{selectedUser.id}</span>
                      </div>
                    </div>

                    <div className="col-12 col-sm-6">
                      <div className="p-3 bg-body-tertiary rounded-3 border">
                        <small className="text-secondary d-block fw-semibold" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Account Role</small>
                        <span
                          className={`badge mt-1 ${
                            checkIsAdmin(selectedUser)
                              ? 'bg-purple-subtle text-purple border border-purple-subtle'
                              : 'bg-success-subtle text-success-emphasis border border-success-subtle'
                          } px-2.5 py-1 rounded-pill fw-semibold`}
                          style={{
                            fontSize: '0.74rem',
                            backgroundColor: checkIsAdmin(selectedUser) ? 'rgba(124, 58, 237, 0.12)' : undefined,
                            color: checkIsAdmin(selectedUser) ? '#7c3aed' : undefined,
                          }}
                        >
                          {getRoleName(selectedUser.role)}
                        </span>
                      </div>
                    </div>

                    <div className="col-12 col-sm-6">
                      <div className="p-3 bg-body-tertiary rounded-3 border">
                        <small className="text-secondary d-block fw-semibold" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>First Name</small>
                        <span className="fw-semibold text-body-emphasis">{selectedUser.firstName || '-'}</span>
                      </div>
                    </div>

                    <div className="col-12 col-sm-6">
                      <div className="p-3 bg-body-tertiary rounded-3 border">
                        <small className="text-secondary d-block fw-semibold" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Last Name</small>
                        <span className="fw-semibold text-body-emphasis">{selectedUser.lastName || '-'}</span>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="p-3 bg-body-tertiary rounded-3 border">
                        <small className="text-secondary d-block fw-semibold" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Email Address</small>
                        <span className="fw-semibold text-body-emphasis">{selectedUser.email || '-'}</span>
                      </div>
                    </div>

                    <div className="col-12 col-sm-6">
                      <div className="p-3 bg-body-tertiary rounded-3 border">
                        <small className="text-secondary d-block fw-semibold" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Phone Number</small>
                        <span className="text-body">{selectedUser.phoneNumber || 'Not provided'}</span>
                      </div>
                    </div>

                    <div className="col-12 col-sm-6">
                      <div className="p-3 bg-body-tertiary rounded-3 border">
                        <small className="text-secondary d-block fw-semibold" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>Status</small>
                        <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle rounded-pill px-2 py-0.5 fw-semibold d-inline-flex align-items-center gap-1 mt-1" style={{ fontSize: '0.72rem' }}>
                          <span className="d-inline-block rounded-circle bg-success" style={{ width: 5, height: 5 }}></span>
                          Active &amp; Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3 bg-body-tertiary d-flex justify-content-between">
                  <div>
                    {selectedUser.id !== currentAuthUser?.id && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger rounded-2 px-3"
                        onClick={() => {
                          const toDel = selectedUser;
                          setShowDetailsModal(false);
                          setSelectedUser(null);
                          handlePromptDelete(toDel);
                        }}
                      >
                        Delete User
                      </button>
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary rounded-2 px-3"
                      onClick={() => {
                        setShowDetailsModal(false);
                        setSelectedUser(null);
                      }}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary rounded-2 px-3.5 d-inline-flex align-items-center gap-1.5 fw-semibold"
                      onClick={() => {
                        const toEdit = selectedUser;
                        setShowDetailsModal(false);
                        setSelectedUser(null);
                        handleOpenEditModal(toEdit);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                        <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                        <path d="M16 5l3 3" />
                      </svg>
                      <span>Edit User</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header border-bottom px-4 py-3 bg-body-tertiary">
                  <div>
                    <h5 className="modal-title fw-bold text-body-emphasis mb-0">Edit User</h5>
                    <small className="text-secondary">Updating account: @{editingUser.userName}</small>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                    }}
                    disabled={isUpdating}
                  ></button>
                </div>

                <form onSubmit={handleUpdateSubmit}>
                  <div className="modal-body p-4">
                    {editError && (
                      <div className="alert alert-danger py-2 px-3 small rounded-2 mb-3 d-flex align-items-center gap-2">
                        <i className="ti ti-alert-circle"></i>
                        <span>{editError}</span>
                      </div>
                    )}

                    <div className="row g-3">
                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-semibold">First Name <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editFormData.firstName}
                          onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                          required
                          disabled={isUpdating}
                        />
                      </div>

                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-semibold">Last Name <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editFormData.lastName}
                          onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                          required
                          disabled={isUpdating}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-semibold">Email Address <span className="text-danger">*</span></label>
                        <input
                          type="email"
                          className="form-control form-control-sm"
                          value={editFormData.email}
                          onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                          required
                          disabled={isUpdating}
                        />
                      </div>

                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-semibold">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control form-control-sm"
                          placeholder="+1 (555) 000-0000"
                          value={editFormData.phoneNumber}
                          onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                          disabled={isUpdating}
                        />
                      </div>

                      <div className="col-12 col-sm-6">
                        <label className="form-label small fw-semibold">Account Role</label>
                        <select
                          className="form-select form-select-sm"
                          value={editFormData.role}
                          onChange={(e) => setEditFormData({ ...editFormData, role: Number(e.target.value) })}
                          disabled={isUpdating || editingUser.id === currentAuthUser?.id}
                        >
                          <option value={0}>Manager</option>
                          <option value={1}>Admin</option>
                        </select>
                        {editingUser.id === currentAuthUser?.id && (
                          <small className="text-secondary d-block mt-1" style={{ fontSize: '0.72rem' }}>
                            Your own role cannot be changed.
                          </small>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer border-top px-4 py-3 bg-body-tertiary">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary rounded-2 px-3"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingUser(null);
                      }}
                      disabled={isUpdating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-sm btn-primary rounded-2 px-4 d-inline-flex align-items-center gap-1.5 fw-semibold"
                      disabled={isUpdating}
                    >
                      {isUpdating && <span className="spinner-border spinner-border-sm" role="status"></span>}
                      <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete User Account"
          message={
            userToDelete
              ? `Are you sure you want to delete user "${userToDelete.userName || userToDelete.email}" (${userToDelete.email})? This action will revoke their access immediately.`
              : 'Are you sure you want to delete this user?'
          }
          confirmText={isDeleting ? 'Deleting...' : 'Delete User'}
          cancelText="Cancel"
          confirmVariant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setUserToDelete(null);
          }}
        />
      </div>
    </DashboardLayout>
  );
}
