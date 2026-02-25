import React, { useState } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Bell, Plus, Funnel, Check, X, Eye, FileXls, FilePdf, CalendarBlank, Clock, CheckCircle, XCircle, MagnifyingGlass, CaretDoubleLeft, CaretLeft, CaretRight, CaretDoubleRight } from 'lucide-react';

const LeaveForm = () => {
  const [facultyData, setFacultyData] = useState([
    { id: 'F-101', name: 'Dr. Rajesh Khanna', dept: 'Computer Science', type: 'Casual Leave', from: '25-Apr-2024', to: '27-Apr-2024', duration: '3 Days', status: 'Pending', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80', substitute: 'Prof. Naveen' },
    { id: 'F-102', name: 'Prof. Amit Sharma', dept: 'Mechanical', type: 'Earned Leave', from: '20-Apr-2024', to: '25-Apr-2024', duration: '6 Days', status: 'Approved', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80', substitute: 'Dr. Sandeep' },
    { id: 'F-103', name: 'Dr. Priya Verma', dept: 'Electronics', type: 'Sick Leave', from: '22-Apr-2024', to: '22-Apr-2024', duration: '1 Day', status: 'Pending', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&q=80', substitute: 'Prof. Megha' },
    { id: 'F-104', name: 'Prof. Suresh Iyer', dept: 'Civil', type: 'Maternity Leave', from: '01-May-2024', to: '30-Jul-2024', duration: '90 Days', status: 'Pending', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&q=80', substitute: 'Dr. Aruna' },
    { id: 'F-105', name: 'Dr. Ananya Reddy', dept: 'Chemistry', type: 'Medical Leave', from: '18-Apr-2024', to: '20-Apr-2024', duration: '3 Days', status: 'Rejected', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&q=80', substitute: 'Prof. Karthik' },
    { id: 'F-106', name: 'Prof. Vikram Singh', dept: 'Mathematics', type: 'Earned Leave', from: '15-May-2024', to: '20-May-2024', duration: '6 Days', status: 'Pending', avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&h=150&fit=crop&q=80', substitute: 'Dr. Kavita' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    leaveType: '',
    status: ''
  });

  // Compute filtered data without state
  const filteredData = facultyData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !filters.department || item.dept === filters.department;
    const matchesType = !filters.leaveType || item.type === filters.leaveType;
    const matchesStatus = !filters.status || item.status === filters.status;
    return matchesSearch && matchesDept && matchesType && matchesStatus;
  });

  const pendingRequests = [
    { dept: 'Computer Science', count: 8 }
  ];

  const trendChartData = [
    { name: 'Mon', 'Leaves Taken': 12, 'Approvals': 7 },
    { name: 'Tue', 'Leaves Taken': 19, 'Approvals': 11 },
    { name: 'Wed', 'Leaves Taken': 3, 'Approvals': 5 },
    { name: 'Thu', 'Leaves Taken': 5, 'Approvals': 8 },
    { name: 'Fri', 'Leaves Taken': 2, 'Approvals': 3 },
    { name: 'Sat', 'Leaves Taken': 3, 'Approvals': 7 }
  ];

  const typeChartData = [
    { name: 'Earned', value: 40 },
    { name: 'Casual', value: 30 },
    { name: 'Sick', value: 20 },
    { name: 'Others', value: 10 }
  ];

  const COLORS = ['#2196f3', '#ffc107', '#d32f2f', '#757575'];

  const handleStatusChange = (index, newStatus) => {
    const updated = [...facultyData];
    updated[index].status = newStatus;
    setFacultyData(updated);
  };

  const handleApprove = (index) => {
    handleStatusChange(index, 'Approved');
  };

  const handleReject = (index) => {
    handleStatusChange(index, 'Rejected');
  };

  const getStatsCount = (status) => {
    return facultyData.filter(item => item.status === status).length;
  };

  const totalRequests = facultyData.length;
  const pendingCount = getStatsCount('Pending');
  const approvedCount = getStatsCount('Approved');
  const rejectedCount = getStatsCount('Rejected');

  const styles = {
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor: '#fafafa',
      minHeight: '100vh',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem'
    },
    titleSection: {
      flex: 1
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: '700',
      color: '#d32f2f',
      marginBottom: '0.5rem'
    },
    breadcrumbs: {
      display: 'flex',
      gap: '0.5rem',
      color: '#757575',
      fontSize: '0.9rem'
    },
    userProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    notificationBell: {
      position: 'relative',
      cursor: 'pointer',
      fontSize: '1.5rem'
    },
    notificationDot: {
      position: 'absolute',
      top: '-5px',
      right: '-5px',
      background: '#d32f2f',
      color: 'white',
      borderRadius: '50%',
      width: '18px',
      height: '18px',
      fontSize: '0.7rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    adminName: {
      fontWeight: '700',
      display: 'block'
    },
    adminRole: {
      fontSize: '0.8rem',
      color: '#757575'
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    statCard: {
      background: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      borderLeft: '5px solid',
      transition: 'transform 0.2s, box-shadow 0.2s'
    },
    statCardTotal: { borderColor: '#2196f3' },
    statCardPending: { borderColor: '#ffc107' },
    statCardApproved: { borderColor: '#2e7d32' },
    statCardRejected: { borderColor: '#d32f2f' },
    statIcon: {
      width: '50px',
      height: '50px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem'
    },
    statIconTotal: { background: '#e3f2fd', color: '#2196f3' },
    statIconPending: { background: '#fff8e1', color: '#ffc107' },
    statIconApproved: { background: '#e8f5e9', color: '#2e7d32' },
    statIconRejected: { background: '#ffebee', color: '#d32f2f' },
    statCount: {
      fontSize: '1.5rem',
      fontWeight: '800',
      display: 'block'
    },
    statLabel: {
      fontSize: '0.9rem',
      color: '#757575'
    },
    filtersSection: {
      background: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      marginBottom: '1.5rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    searchRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '1rem',
      gap: '1rem'
    },
    searchBar: {
      flex: 1,
      position: 'relative'
    },
    searchInput: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 2.5rem',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      outline: 'none',
      fontFamily: 'inherit'
    },
    searchIcon: {
      position: 'absolute',
      left: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#757575'
    },
    filterRow: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      alignItems: 'center'
    },
    filterInput: {
      padding: '0.6rem 1rem',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      outline: 'none',
      minWidth: '150px',
      fontFamily: 'inherit'
    },
    btnFilter: {
      background: '#ffc107',
      color: '#212121',
      padding: '0.6rem 1.5rem',
      borderRadius: '8px',
      border: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    tableContainer: {
      background: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      marginBottom: '2rem'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    thead: {
      background: '#f8f9fa',
      borderBottom: '1px solid #e0e0e0'
    },
    th: {
      textAlign: 'left',
      padding: '1rem',
      fontSize: '0.85rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      color: '#757575'
    },
    td: {
      padding: '1rem',
      borderBottom: '1px solid #e0e0e0',
      verticalAlign: 'middle'
    },
    facultyCell: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    facultyImg: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      objectFit: 'cover',
      background: '#eee'
    },
    statusBadge: {
      padding: '0.4rem 0.8rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600',
      display: 'inline-block'
    },
    statusPending: { background: '#fff8e1', color: '#ef6c00', border: '1px solid #ffe082' },
    statusApproved: { background: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7' },
    statusRejected: { background: '#ffebee', color: '#d32f2f', border: '1px solid #ef9a9a' },
    actionBtns: {
      display: 'flex',
      gap: '0.5rem'
    },
    btnTable: {
      padding: '0.4rem 0.8rem',
      borderRadius: '6px',
      border: '1px solid #e0e0e0',
      background: 'white',
      cursor: 'pointer',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.3rem',
      transition: 'all 0.2s'
    },
    btnApprove: { color: '#2e7d32', borderColor: '#2e7d32' },
    btnReject: { color: '#d32f2f', borderColor: '#d32f2f' },
    pagination: {
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.9rem',
      borderTop: '1px solid #e0e0e0'
    },
    reportsGrid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr 1fr',
      gap: '1.5rem',
      marginTop: '2rem'
    },
    reportCard: {
      background: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    reportTitle: {
      fontSize: '1.1rem',
      marginBottom: '1rem',
      color: '#212121',
      fontWeight: '600'
    },
    pendingList: {
      listStyle: 'none'
    },
    pendingListItem: {
      padding: '0.5rem 0',
      borderBottom: '1px solid #f0f0f0',
      fontSize: '0.9rem'
    },
    downloadReport: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    btnDownload: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.75rem',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      background: 'white',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }
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
            <span style={{ color: '#d32f2f', fontWeight: '600' }}>Leave Requests</span>
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
          <img src="https://ui-avatars.com/api/?name=Srinivasan&background=d32f2f&color=fff" alt="Admin" style={styles.avatar} />
        </div>
      </header>

      {/* Stats Section */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, ...styles.statCardTotal }}>
          <div style={{ ...styles.statIcon, ...styles.statIconTotal }}>
            <CalendarBlank size={24} />
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
            <MagnifyingGlass size={18} style={styles.searchIcon} />
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
      <div style={styles.tableContainer}>
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
              const originalIndex = facultyData.findIndex(f => f.id === item.id);
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
                  <td style={{ ...styles.td, color: (item.type === 'Sick Leave' || item.type === 'Maternity Leave') ? '#d32f2f' : '#2e7d32', fontWeight: '500' }}>
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
          <span>Showing 1 to {filteredData.length} of {facultyData.length} entries</span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button style={styles.btnTable}><CaretDoubleLeft size={16} /></button>
            <button style={styles.btnTable}><CaretLeft size={16} /></button>
            <button style={{ ...styles.btnTable, background: '#d32f2f', color: 'white' }}>1</button>
            <button style={styles.btnTable}>2</button>
            <button style={styles.btnTable}>3</button>
            <button style={styles.btnTable}><CaretRight size={16} /></button>
            <button style={styles.btnTable}><CaretDoubleRight size={16} /></button>
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
              <Line type="monotone" dataKey="Leaves Taken" stroke="#ffc107" strokeWidth={2} />
              <Line type="monotone" dataKey="Approvals" stroke="#2e7d32" strokeDasharray="5 5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Leave Types Distribution Chart */}
        <div style={styles.reportCard}>
          <h3 style={styles.reportTitle}>Leave Types Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={typeChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                {typeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Pending Requests */}
        <div style={styles.reportCard}>
          <h3 style={styles.reportTitle}>Pending Requests</h3>
          <ul style={styles.pendingList}>
            {pendingRequests.map((item, idx) => (
              <li key={idx} style={styles.pendingListItem}>
                • {item.dept} - <span style={{ fontWeight: '700', color: '#d32f2f' }}>{item.count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Download Report */}
        <div style={styles.reportCard}>
          <h3 style={styles.reportTitle}>Download Report</h3>
          <div style={styles.downloadReport}>
            <button style={{ ...styles.btnDownload, color: '#2e7d32', borderColor: '#2e7d32' }}>
              <FileXls size={18} /> Excel
            </button>
            <button style={{ ...styles.btnDownload, color: '#d32f2f', borderColor: '#d32f2f' }}>
              <FilePdf size={18} /> PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveForm;
