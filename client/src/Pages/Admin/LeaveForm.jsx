import React, { useState } from 'react';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Bell, Plus, Funnel, Check, X, Eye,
  FileSpreadsheet, FileText,
  Calendar, Clock, CheckCircle, XCircle,
  Search,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
} from 'lucide-react';

import styles from '../../utils/leaveFormStyles';
import {
  initialFacultyData,
  pendingRequests,
  trendChartData,
  typeChartData,
  CHART_COLORS,
} from '../../utils/leaveFormData';

const LeaveForm = () => {
  const [facultyData, setFacultyData] = useState(initialFacultyData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    leaveType: '',
    status: '',
  });

  // Compute filtered data without state
  const filteredData = facultyData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !filters.department || item.dept === filters.department;
    const matchesType = !filters.leaveType || item.type === filters.leaveType;
    const matchesStatus = !filters.status || item.status === filters.status;
    return matchesSearch && matchesDept && matchesType && matchesStatus;
  });

  const handleStatusChange = (index, newStatus) => {
    const updated = [...facultyData];
    updated[index].status = newStatus;
    setFacultyData(updated);
  };

  const handleApprove = (index) => handleStatusChange(index, 'Approved');
  const handleReject = (index) => handleStatusChange(index, 'Rejected');

  const getStatsCount = (status) =>
    facultyData.filter((item) => item.status === status).length;

  const totalRequests = facultyData.length;
  const pendingCount = getStatsCount('Pending');
  const approvedCount = getStatsCount('Approved');
  const rejectedCount = getStatsCount('Rejected');

  const exportToCSV = () => {
    const headers = ['Faculty ID', 'Name', 'Department', 'Leave Type', 'From Date', 'To Date', 'Duration', 'Status', 'Substitute'];
    const rows = filteredData.map(item => [
      item.id, item.name, item.dept, item.type, item.from, item.to, item.duration, item.status, item.substitute
    ]);
    const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leave_requests_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const rows = filteredData.map(item => `
      <tr>
        <td>${item.id}</td><td>${item.name}</td><td>${item.dept}</td>
        <td>${item.type}</td><td>${item.from}</td><td>${item.to}</td>
        <td>${item.duration}</td><td>${item.status}</td><td>${item.substitute}</td>
      </tr>`).join('');
    const html = `<html><head><title>Leave Requests</title>
      <style>body{font-family:sans-serif;padding:20px}h2{color:#9b1c31}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{border:1px solid #ddd;padding:6px 10px;text-align:left}
      th{background:#9b1c31;color:white}</style></head>
      <body><h2>Leave Requests Report</h2>
      <p>Generated: ${new Date().toLocaleString()}</p>
      <table><thead><tr>
        <th>ID</th><th>Name</th><th>Dept</th><th>Type</th>
        <th>From</th><th>To</th><th>Duration</th><th>Status</th><th>Substitute</th>
      </tr></thead><tbody>${rows}</tbody></table></body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.print();
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>Leave Form Approval - Faculties</h1>
          <div style={styles.breadcrumbs}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Home</a>
            <span>&gt;</span>
            <span style={{ color: '#9b1c31', fontWeight: '600' }}>Leave Requests</span>
          </div>
        </div>
        <div style={styles.userProfile}>
          <div style={styles.notificationBell}>
            <Bell size={24} />
            <span style={styles.notificationDot}>3</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={styles.adminName}>Srinivasan</span>
            <span style={styles.adminRole}>Super Admin</span>
          </div>
          <img
            src="https://ui-avatars.com/api/?name=Srinivasan&background=d32f2f&color=fff"
            alt="Admin"
            style={styles.avatar}
          />
        </div>
      </header>

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
              placeholder="Search by Faculty Name, ID..."
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
            <option value="">Department</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Electronics">Electronics</option>
            <option value="Civil">Civil</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Mathematics">Mathematics</option>
          </select>
          <select
            style={styles.filterInput}
            value={filters.leaveType}
            onChange={(e) => setFilters({ ...filters, leaveType: e.target.value })}
          >
            <option value="">Leave Type</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Earned Leave">Earned Leave</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Maternity Leave">Maternity Leave</option>
            <option value="Medical Leave">Medical Leave</option>
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
          <button style={styles.btnFilter}>
            <Funnel size={18} /> Filter
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div style={styles.tableContainer} className="no-scrollbar">
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>Faculty ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Department</th>
              <th style={styles.th}>Leave Type</th>
              <th style={styles.th}>From Date</th>
              <th style={styles.th}>To Date</th>
              <th style={styles.th}>Duration</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Substitute</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, idx) => {
              const originalIndex = facultyData.findIndex((f) => f.id === item.id);
              let statusStyle = styles.statusPending;
              if (item.status === 'Approved') statusStyle = styles.statusApproved;
              if (item.status === 'Rejected') statusStyle = styles.statusRejected;

              return (
                <tr key={idx}>
                  <td style={{ ...styles.td, fontWeight: '600', color: '#757575' }}>{item.id}</td>
                  <td style={styles.td}>
                    <div style={styles.facultyCell}>
                      <img src={item.avatar} alt={item.name} style={styles.facultyImg} />
                      <span style={{ fontWeight: '600' }}>{item.name}</span>
                    </div>
                  </td>
                  <td style={styles.td}>{item.dept}</td>
                  <td
                    style={{
                      ...styles.td,
                      color:
                        item.type === 'Sick Leave' || item.type === 'Maternity Leave'
                          ? '#9b1c31'
                          : '#047857',
                      fontWeight: '500',
                    }}
                  >
                    {item.type}
                  </td>
                  <td style={styles.td}>{item.from}</td>
                  <td style={styles.td}>{item.to}</td>
                  <td style={styles.td}>{item.duration}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.statusBadge, ...statusStyle }}>{item.status}</span>
                  </td>
                  <td style={{ ...styles.td, fontWeight: '500', color: '#555' }}>{item.substitute}</td>
                  <td style={styles.td}>
                    <div style={styles.actionBtns}>
                      <button
                        style={{ ...styles.btnTable, ...styles.btnApprove }}
                        onClick={() => handleApprove(originalIndex)}
                        disabled={item.status !== 'Pending'}
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button
                        style={{ ...styles.btnTable, ...styles.btnReject }}
                        onClick={() => handleReject(originalIndex)}
                        disabled={item.status !== 'Pending'}
                      >
                        <X size={16} /> Reject
                      </button>
                      <button style={styles.btnTable}>
                        <Eye size={16} /> View
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={styles.pagination}>
          <span>
            Showing 1 to {filteredData.length} of {facultyData.length} entries
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button style={styles.btnTable}><ChevronsLeft size={16} /></button>
            <button style={styles.btnTable}><ChevronLeft size={16} /></button>
            <button style={{ ...styles.btnTable, background: '#9b1c31', color: 'white' }}>1</button>
            <button style={styles.btnTable}>2</button>
            <button style={styles.btnTable}>3</button>
            <button style={styles.btnTable}><ChevronRight size={16} /></button>
            <button style={styles.btnTable}><ChevronsRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Reports Section */}
      <h2 style={{ marginBottom: '1.5rem', color: '#212121' }}>Leave Summary Reports</h2>
      <div style={styles.reportsGrid}>
        {/* Monthly Leave Trends Chart */}
        <div style={styles.reportCard}>
          <h3 style={styles.reportTitle}>Monthly Leave Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Leaves Taken" stroke="#ffcc00" strokeWidth={2} />
              <Line type="monotone" dataKey="Approvals" stroke="#047857" strokeDasharray="5 5" strokeWidth={2} />
            </LineChart>
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
            <button onClick={exportToCSV} style={{ ...styles.btnDownload, color: '#047857', borderColor: '#047857' }}>
              <FileSpreadsheet size={18} /> Excel
            </button>
            <button onClick={exportToPDF} style={{ ...styles.btnDownload, color: '#9b1c31', borderColor: '#9b1c31' }}>
              <FileText size={18} /> PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveForm;
