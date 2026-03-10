import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Bell, Check, X, Eye,
  FileSpreadsheet, FileText,
  Calendar, Clock, CheckCircle, XCircle,
  Search, Loader2,
} from 'lucide-react';

import styles from '../../utils/leaveFormStyles';
import { fetchAllLeaves, approveLeaveApi, rejectLeaveApi } from '../../utils/api';

const CHART_COLORS = ['#047857', '#9b1c31', '#3b82f6', '#f97316', '#8b5cf6'];

const LeaveForm = () => {
  const [leaveData, setLeaveData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // id of leave being acted on
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    department: '',
    leaveType: '',
    status: '',
  });

  // Fetch all leaves on mount
  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAllLeaves();
      setLeaveData(res.leaves || []);
    } catch (err) {
      console.error('Failed to load leaves:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toISOString().split('T')[0] : '';

  const getDuration = (from, to) => {
    if (!from || !to) return '';
    // Strip time portion to avoid timezone precision issues
    const fStr = new Date(from).toISOString().split('T')[0];
    const tStr = new Date(to).toISOString().split('T')[0];

    // Parse strictly as midnight UTC
    const f = new Date(`${fStr}T00:00:00Z`);
    const t = new Date(`${tStr}T00:00:00Z`);

    const days = Math.round((t - f) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  const getLeaveTypeLabel = (type) => {
    const map = { 'Casual': 'Casual Leave', 'Sick': 'Sick Leave', 'Duty': 'On Duty (OD)' };
    return map[type] || type;
  };

  // Filter data
  const filteredData = leaveData.filter((item) => {
    const facultyName = item.faculty?.name || '';
    const dept = item.faculty?.department || '';
    const matchesSearch =
      facultyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !filters.department || dept === filters.department;
    const matchesType = !filters.leaveType || getLeaveTypeLabel(item.type) === filters.leaveType;
    const matchesStatus = !filters.status || item.status === filters.status;
    return matchesSearch && matchesDept && matchesType && matchesStatus;
  });

  // Handle approve
  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await approveLeaveApi(id);
      await loadLeaves();
    } catch (err) {
      alert(`Approve failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle reject
  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await rejectLeaveApi(id);
      await loadLeaves();
    } catch (err) {
      alert(`Reject failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Stats
  const totalRequests = leaveData.length;
  const pendingCount = leaveData.filter(l => l.status === 'Pending').length;
  const approvedCount = leaveData.filter(l => l.status === 'Approved').length;
  const rejectedCount = leaveData.filter(l => l.status === 'Rejected').length;

  // Get unique departments for filter
  const departments = [...new Set(leaveData.map(l => l.faculty?.department).filter(Boolean))];

  // Chart data
  const typeChartData = [
    { name: 'Casual Leave', value: leaveData.filter(l => l.type === 'Casual').length },
    { name: 'Sick Leave', value: leaveData.filter(l => l.type === 'Sick').length },
    { name: 'On Duty', value: leaveData.filter(l => l.type === 'Duty').length },
  ].filter(d => d.value > 0);

  const statusChartData = [
    { name: 'Approved', value: approvedCount },
    { name: 'Pending', value: pendingCount },
    { name: 'Rejected', value: rejectedCount },
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: '#9b1c31' }} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>Leave Form Approval</h1>
          <div style={styles.breadcrumbs}>
            <span>Home</span>
            <span>&gt;</span>
            <span style={{ color: '#9b1c31', fontWeight: '600' }}>Leave Requests</span>
          </div>
        </div>
        <div style={styles.userProfile}>
          <div style={styles.notificationBell}>
            <Bell size={24} />
            {pendingCount > 0 && <span style={styles.notificationDot}>{pendingCount}</span>}
          </div>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', padding: '1rem 1.5rem', marginBottom: '1.5rem', color: '#991b1b', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Stats Section */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, ...styles.statCardTotal }}>
          <div style={{ ...styles.statIcon, ...styles.statIconTotal }}>
            <Calendar size={24} />
          </div>
          <div>
            <span style={styles.statCount}>{totalRequests}</span>
            <span style={styles.statLabel}>Total Requests</span>
          </div>
        </div>
        <div style={{ ...styles.statCard, ...styles.statCardPending }}>
          <div style={{ ...styles.statIcon, ...styles.statIconPending }}>
            <Clock size={24} />
          </div>
          <div>
            <span style={styles.statCount}>{pendingCount}</span>
            <span style={styles.statLabel}>Pending Approval</span>
          </div>
        </div>
        <div style={{ ...styles.statCard, ...styles.statCardApproved }}>
          <div style={{ ...styles.statIcon, ...styles.statIconApproved }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <span style={styles.statCount}>{approvedCount}</span>
            <span style={styles.statLabel}>Approved</span>
          </div>
        </div>
        <div style={{ ...styles.statCard, ...styles.statCardRejected }}>
          <div style={{ ...styles.statIcon, ...styles.statIconRejected }}>
            <XCircle size={24} />
          </div>
          <div>
            <span style={styles.statCount}>{rejectedCount}</span>
            <span style={styles.statLabel}>Rejected</span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div style={styles.filtersSection}>
        <div style={styles.searchRow}>
          <div style={styles.searchBar}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by Faculty Name, Department..."
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div style={styles.filterRow}>
          <select
            style={styles.filterInput}
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            style={styles.filterInput}
            value={filters.leaveType}
            onChange={(e) => setFilters({ ...filters, leaveType: e.target.value })}
          >
            <option value="">Leave Type</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="On Duty (OD)">On Duty (OD)</option>
          </select>
          <select
            style={styles.filterInput}
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div style={styles.tableContainer} className="no-scrollbar">
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>Faculty</th>
              <th style={styles.th}>Department</th>
              <th style={styles.th}>Leave Type</th>
              <th style={styles.th}>From</th>
              <th style={styles.th}>To</th>
              <th style={styles.th}>Duration</th>
              <th style={styles.th}>Reason</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ ...styles.td, textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
                  {leaveData.length === 0 ? 'No leave requests in the database yet.' : 'No results match your filters.'}
                </td>
              </tr>
            ) : (
              filteredData.map((item) => {
                let statusStyle = styles.statusPending;
                if (item.status === 'Approved') statusStyle = styles.statusApproved;
                if (item.status === 'Rejected') statusStyle = styles.statusRejected;
                const isActing = actionLoading === item._id;

                return (
                  <tr key={item._id}>
                    <td style={styles.td}>
                      <div style={styles.facultyCell}>
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.faculty?.name || 'U')}&background=d32f2f&color=fff&size=44`}
                          alt={item.faculty?.name}
                          style={styles.facultyImg}
                        />
                        <span style={{ fontWeight: '600' }}>{item.faculty?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{item.faculty?.department || '—'}</td>
                    <td
                      style={{
                        ...styles.td,
                        color: item.type === 'Sick' ? '#9b1c31' : '#047857',
                        fontWeight: '500',
                      }}
                    >
                      {getLeaveTypeLabel(item.type)}
                    </td>
                    <td style={styles.td}>{formatDate(item.fromDate)}</td>
                    <td style={styles.td}>{formatDate(item.toDate)}</td>
                    <td style={styles.td}>{getDuration(item.fromDate, item.toDate)}</td>
                    <td style={{ ...styles.td, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.reason || '—'}
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusBadge, ...statusStyle }}>{item.status}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionBtns}>
                        <button
                          style={{ ...styles.btnTable, ...styles.btnApprove, opacity: item.status !== 'Pending' || isActing ? 0.4 : 1 }}
                          onClick={() => handleApprove(item._id)}
                          disabled={item.status !== 'Pending' || isActing}
                        >
                          {isActing && actionLoading === item._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={16} />
                          )}
                          Approve
                        </button>
                        <button
                          style={{ ...styles.btnTable, ...styles.btnReject, opacity: item.status !== 'Pending' || isActing ? 0.4 : 1 }}
                          onClick={() => handleReject(item._id)}
                          disabled={item.status !== 'Pending' || isActing}
                        >
                          <X size={16} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div style={styles.pagination}>
          <span>
            Showing {filteredData.length} of {leaveData.length} entries
          </span>
        </div>
      </div>

      {/* Reports Section */}
      {leaveData.length > 0 && (
        <>
          <h2 style={{ marginBottom: '1.5rem', color: '#212121' }}>Leave Summary Reports</h2>
          <div style={styles.reportsGrid}>
            {/* Status Distribution Chart */}
            <div style={styles.reportCard}>
              <h3 style={styles.reportTitle}>Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#047857', '#f59e0b', '#dc2626'][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Leave Types Distribution Chart */}
            <div style={styles.reportCard}>
              <h3 style={styles.reportTitle}>Leave Types Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={typeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {typeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Download Report */}
            <div style={styles.reportCard}>
              <h3 style={styles.reportTitle}>Download Report</h3>
              <div style={styles.downloadReport}>
                <button style={{ ...styles.btnDownload, color: '#047857', borderColor: '#047857' }}>
                  <FileSpreadsheet size={18} /> Excel
                </button>
                <button style={{ ...styles.btnDownload, color: '#9b1c31', borderColor: '#9b1c31' }}>
                  <FileText size={18} /> PDF
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LeaveForm;
