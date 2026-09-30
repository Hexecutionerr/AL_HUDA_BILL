import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styles from './Clients.module.css';
import { deleteClient, createClient } from '../../actions/clientActions';
import { useSnackbar } from 'react-simple-snackbar';
import AddClient from './AddClient';
import moment from 'moment';

// Material-UI Icons
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CloseIcon from '@material-ui/icons/Close';
import GetAppIcon from '@material-ui/icons/GetApp';
import PublishIcon from '@material-ui/icons/Publish';
import ViewListIcon from '@material-ui/icons/ViewList';
import ViewModuleIcon from '@material-ui/icons/ViewModule';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import InfoIcon from '@material-ui/icons/Info';
import CallIcon from '@material-ui/icons/Call';
import EmailIcon from '@material-ui/icons/Email';
import LanguageIcon from '@material-ui/icons/Language';
import PaymentIcon from '@material-ui/icons/Payment';
import ReceiptIcon from '@material-ui/icons/Receipt';
import TimelineIcon from '@material-ui/icons/Timeline';
import DescriptionIcon from '@material-ui/icons/Description';
import SendIcon from '@material-ui/icons/Send';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import BlockIcon from '@material-ui/icons/Block';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import PeopleIcon from '@material-ui/icons/People';

// Dialog for Confirmation
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

const Clients = ({ open, setOpen, currentId, setCurrentId, clients }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [openSnackbar] = useSnackbar();
  const fileInputRef = useRef(null);

  // Redux state for invoices
  const { invoices } = useSelector((state) => state.invoices);
  const isLoading = useSelector((state) => state.clients.isLoading);
  const user = JSON.parse(localStorage.getItem('profile'));

  // Component local states
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('name');
  const [viewType, setViewType] = useState('table'); // table or grid
  const [dateFilter, setDateFilter] = useState('all'); // all, month, year
  
  // Drawer & Action states
  const [selectedClient, setSelectedClient] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Country Flag Emoji Helper
  const getCountryFlagEmoji = (countryName) => {
    if (!countryName) return '🌐';
    const name = countryName.toLowerCase().trim();
    if (name.includes('india') || name === 'in') return '🇮🇳';
    if (name.includes('emirates') || name.includes('uae') || name === 'ae') return '🇦🇪';
    if (name.includes('saudi') || name.includes('ksa') || name === 'sa') return '🇸🇦';
    if (name.includes('qatar') || name === 'qa') return '🇶🇦';
    if (name.includes('united states') || name.includes('usa') || name === 'us') return '🇺🇸';
    if (name.includes('united kingdom') || name.includes('uk') || name === 'gb') return '🇬🇧';
    if (name.includes('oman') || name === 'om') return '🇴🇲';
    if (name.includes('kuwait') || name === 'kw') return '🇰🇼';
    if (name.includes('bahrain') || name === 'bh') return '🇧🇭';
    if (name.includes('germany') || name === 'de') return '🇩🇪';
    if (name.includes('france') || name === 'fr') return '🇫🇷';
    if (name.includes('canada') || name === 'ca') return '🇨🇦';
    if (name.includes('australia') || name === 'au') return '🇦🇺';
    if (name.includes('singapore') || name === 'sg') return '🇸🇬';
    return '🏳️';
  };

  // Helper to map and calculate client business data
  const getClientBusinessStats = (client) => {
    if (!invoices) return { totalOrders: 0, totalRevenue: 0, outstandingBalance: 0, lastOrderDate: null, status: 'Active' };

    const clientInvoices = invoices.filter((inv) => {
      const invEmail = inv.client?.email?.toLowerCase()?.trim();
      const cliEmail = client.email?.toLowerCase()?.trim();
      const invPhone = inv.client?.phone?.trim();
      const cliPhone = client.phone?.trim();
      const invName = inv.client?.name?.toLowerCase()?.trim();
      const cliName = client.name?.toLowerCase()?.trim();

      return (
        (invEmail && cliEmail && invEmail === cliEmail) ||
        (invPhone && cliPhone && invPhone === cliPhone) ||
        (invName && cliName && invName === cliName)
      );
    });

    const totalOrders = clientInvoices.length;
    const totalRevenue = clientInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    const totalAmountReceived = clientInvoices.reduce((sum, inv) => {
      const rec = inv.paymentRecords
        ? inv.paymentRecords.reduce((s, r) => s + Number(r.amountPaid || 0), 0)
        : 0;
      return sum + rec;
    }, 0);

    const outstandingBalance = totalRevenue - totalAmountReceived;
    
    // Last Order Date
    let lastOrderDate = null;
    if (clientInvoices.length > 0) {
      const dates = clientInvoices.map((inv) => new Date(inv.createdAt || inv.dueDate));
      lastOrderDate = new Date(Math.max(...dates));
    }

    // Determine status: if outstanding balance is high, label "Pending Payment"
    // If no orders at all, label "New". Else "Active".
    let status = 'Active';
    if (outstandingBalance > 0) status = 'Pending';
    else if (totalOrders === 0) status = 'New';

    return {
      totalOrders,
      totalRevenue,
      outstandingBalance,
      lastOrderDate,
      status
    };
  };

  // Handle Export Customers (CSV)
  const handleExport = () => {
    const headers = ['Name', 'Company', 'Email', 'Phone', 'WhatsApp', 'Address', 'Country', 'Currency', 'Payment Terms', 'Tax Number', 'GST', 'IEC', 'Trade License', 'Notes'];
    const rows = clients.map((c) => [
      c.name || '',
      c.companyName || '',
      c.email || '',
      c.phone || '',
      c.whatsapp || '',
      c.address || '',
      c.country || '',
      c.currency || 'INR',
      c.paymentTerms || 'Advance',
      c.taxNumber || '',
      c.gst || '',
      c.iec || '',
      c.tradeLicense || '',
      c.notes || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `erp_customers_export_${moment().format('YYYY-MM-DD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Import Customers (CSV)
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').map((l) => l.trim()).filter((l) => l);
        if (lines.length <= 1) return;

        const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

        let count = 0;
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.replace(/^["']|["']$/g, '').trim());
          const rowData = {};
          headers.forEach((header, index) => {
            rowData[header] = values[index] || '';
          });

          const newClient = {
            name: rowData.name || rowData['contact person'] || rowData['contact'] || 'Imported Customer',
            companyName: rowData.companyname || rowData.company || '',
            email: rowData.email || '',
            phone: rowData.phone || '',
            whatsapp: rowData.whatsapp || '',
            address: rowData.address || '',
            country: rowData.country || '',
            currency: rowData.currency || 'INR',
            paymentTerms: rowData['payment terms'] || rowData.paymentterms || 'Advance',
            taxNumber: rowData.taxnumber || rowData.tax || '',
            gst: rowData.gst || '',
            iec: rowData.iec || '',
            tradeLicense: rowData.tradelicense || '',
            notes: rowData.notes || '',
            userId: user?.result?._id || user?.result?.googleId ? [user?.result?._id || user?.result?.googleId] : []
          };
          dispatch(createClient(newClient, openSnackbar));
          count++;
        }
        openSnackbar(`Successfully imported ${count} customers!`);
      } catch (err) {
        console.error(err);
        openSnackbar("Failed to parse CSV file. Please verify schema.");
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Reset input file
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setCountryFilter('');
    setStatusFilter('');
    setDateFilter('all');
    setSortField('name');
  };

  // Open Edit Customer Dialog
  const handleEdit = (clientId) => {
    setCurrentId(clientId);
    setOpen(true);
  };

  // Open Delete Confirmation Modal
  const handleDeleteClick = (clientId) => {
    setConfirmDeleteId(clientId);
  };

  // Execute Deletion
  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      dispatch(deleteClient(confirmDeleteId, openSnackbar));
      if (selectedClient && selectedClient._id === confirmDeleteId) {
        setDrawerOpen(false);
      }
      setConfirmDeleteId(null);
    }
  };

  // Open Details Drawer
  const handleRowClick = (client) => {
    setSelectedClient(client);
    setDrawerOpen(true);
  };

  // Statistics Calculations
  const totalCustomers = clients ? clients.length : 0;
  
  const clientStatsList = clients ? clients.map((c) => ({
    client: c,
    stats: getClientBusinessStats(c)
  })) : [];

  const activeCustomers = clientStatsList.filter(item => item.stats.totalOrders > 0).length;
  
  const newCustomersThisMonth = clients ? clients.filter((c) => {
    const created = c.createdAt ? new Date(c.createdAt) : new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return created >= thirtyDaysAgo;
  }).length : 0;

  const totalPendingPayments = clientStatsList.reduce((sum, item) => sum + (item.stats.outstandingBalance > 0 ? 1 : 0), 0);
  
  const internationalCustomers = clients ? clients.filter((c) => {
    const country = c.country?.toLowerCase()?.trim();
    return country && country !== 'india' && country !== 'in';
  }).length : 0;

  // Top Customer
  let topCustomerName = 'N/A';
  let topCustomerRevenue = 0;
  if (clientStatsList.length > 0) {
    const sortedByRevenue = [...clientStatsList].sort((a, b) => b.stats.totalRevenue - a.stats.totalRevenue);
    if (sortedByRevenue[0]?.stats.totalRevenue > 0) {
      topCustomerName = sortedByRevenue[0].client.name;
      topCustomerRevenue = sortedByRevenue[0].stats.totalRevenue;
    }
  }

  // Filter & Sort Clients list
  const filteredClients = clientStatsList.filter((item) => {
    const matchSearch = 
      item.client.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.client.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      item.client.email?.toLowerCase().includes(search.toLowerCase()) ||
      item.client.phone?.toLowerCase().includes(search.toLowerCase());

    const matchCountry = !countryFilter || item.client.country?.toLowerCase() === countryFilter.toLowerCase();
    
    const matchStatus = !statusFilter || item.stats.status.toLowerCase() === statusFilter.toLowerCase();

    let matchDate = true;
    if (dateFilter === 'month') {
      const created = item.client.createdAt ? new Date(item.client.createdAt) : new Date();
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchDate = created >= monthAgo;
    } else if (dateFilter === 'year') {
      const created = item.client.createdAt ? new Date(item.client.createdAt) : new Date();
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      matchDate = created >= yearAgo;
    }

    return matchSearch && matchCountry && matchStatus && matchDate;
  }).sort((a, b) => {
    if (sortField === 'name') {
      return (a.client.name || '').localeCompare(b.client.name || '');
    }
    if (sortField === 'company') {
      return (a.client.companyName || '').localeCompare(b.client.companyName || '');
    }
    if (sortField === 'orders') {
      return b.stats.totalOrders - a.stats.totalOrders;
    }
    if (sortField === 'balance') {
      return b.stats.outstandingBalance - a.stats.outstandingBalance;
    }
    if (sortField === 'revenue') {
      return b.stats.totalRevenue - a.stats.totalRevenue;
    }
    return 0;
  });

  // Extract unique countries for filter list
  const uniqueCountries = clients
    ? [...new Set(clients.map((c) => c.country).filter((c) => c))]
    : [];

  return (
    <div className={styles.pageContainer}>
      {/* Add Client Dialog Component */}
      <AddClient
        open={open}
        setOpen={setOpen}
        currentId={currentId}
        setCurrentId={setCurrentId}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
      >
        <DialogTitle className={styles.confirmationModalTitle}>Confirm Deletion</DialogTitle>
        <DialogContent className={styles.confirmationModalContent}>
          Are you sure you want to delete customer <strong>{clients?.find(c => c._id === confirmDeleteId)?.name}</strong>? This action is permanent and cannot be undone.
        </DialogContent>
        <DialogActions className={styles.confirmationActions}>
          <Button onClick={() => setConfirmDeleteId(null)} style={{ color: '#64748b' }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} style={{ backgroundColor: '#ef4444', color: '#ffffff' }} variant="contained">
            Delete Customer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Header section */}
      <div className={styles.headerSection}>
        <div className={styles.headerLeft}>
          <h1 className={styles.headerTitle}>Customer Management</h1>
          <p className={styles.headerSubtitle}>Manage export customers, contacts, orders and outstanding payments.</p>
        </div>
        <div className={styles.headerActions}>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleImport}
            style={{ display: 'none' }}
          />
          <button className={styles.btnSecondary} onClick={() => fileInputRef.current.click()}>
            <PublishIcon fontSize="small" /> Import Customers
          </button>
          <button className={styles.btnSecondary} onClick={handleExport}>
            <GetAppIcon fontSize="small" /> Export (CSV)
          </button>
          <button className={styles.btnPrimary} onClick={() => { setCurrentId(null); setOpen(true); }}>
            <AddIcon fontSize="small" /> Add Customer
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className={styles.skeletonCard} />
          ))
        ) : (
          <>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statTitle}>Total Customers</span>
                <div className={`${styles.statIconContainer}`} style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                  <PeopleIcon fontSize="small" />
                </div>
              </div>
              <span className={styles.statValue}>{totalCustomers}</span>
              <div className={styles.statFooter}>
                <span className={styles.trendUp}>+4%</span>
                <span className={styles.statLabel}>from last month</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statTitle}>Active Customers</span>
                <div className={`${styles.statIconContainer}`} style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
                  <CheckCircleIcon fontSize="small" />
                </div>
              </div>
              <span className={styles.statValue}>{activeCustomers}</span>
              <div className={styles.statFooter}>
                <span className={styles.trendUp}>94%</span>
                <span className={styles.statLabel}>activity rate</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statTitle}>New This Month</span>
                <div className={`${styles.statIconContainer}`} style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>
                  <AddIcon fontSize="small" />
                </div>
              </div>
              <span className={styles.statValue}>{newCustomersThisMonth}</span>
              <div className={styles.statFooter}>
                <span className={styles.trendUp}>+12%</span>
                <span className={styles.statLabel}>growth velocity</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statTitle}>Pending Payments</span>
                <div className={`${styles.statIconContainer}`} style={{ backgroundColor: '#fffbeb', color: '#f59e0b' }}>
                  <PaymentIcon fontSize="small" />
                </div>
              </div>
              <span className={styles.statValue}>{totalPendingPayments}</span>
              <div className={styles.statFooter}>
                <span className={styles.trendDown}>Attention Required</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statTitle}>International Customers</span>
                <div className={`${styles.statIconContainer}`} style={{ backgroundColor: '#f0fdfa', color: '#0f766e' }}>
                  <LanguageIcon fontSize="small" />
                </div>
              </div>
              <span className={styles.statValue}>{internationalCustomers}</span>
              <div className={styles.statFooter}>
                <span className={styles.statLabel}>Global exports</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statTitle}>Top Customer</span>
                <div className={`${styles.statIconContainer}`} style={{ backgroundColor: '#fff1f2', color: '#f43f5e' }}>
                  <CheckCircleIcon fontSize="small" />
                </div>
              </div>
              <span className={styles.statValue} style={{ fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {topCustomerName}
              </span>
              <div className={styles.statFooter}>
                <span className={styles.trendUp}>₹{topCustomerRevenue.toLocaleString()}</span>
                <span className={styles.statLabel}>LTV</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Toolbar / Filters */}
      <div className={styles.toolbarCard}>
        <div className={styles.toolbarRow}>
          <div className={styles.searchWrapper}>
            <SearchIcon className={styles.searchIcon} fontSize="small" />
            <input
              type="text"
              placeholder="Search by customer name, company, email, phone..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <select
              className={styles.selectFilter}
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
            >
              <option value="">All Countries</option>
              {uniqueCountries.map((c, idx) => (
                <option key={idx} value={c}>{c}</option>
              ))}
            </select>

            <select
              className={styles.selectFilter}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending Payment</option>
              <option value="New">New Profile</option>
            </select>

            <select
              className={styles.selectFilter}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">Lifetime Registration</option>
              <option value="month">Registered Last 30 Days</option>
              <option value="year">Registered Last Year</option>
            </select>

            <select
              className={styles.selectFilter}
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="company">Sort by Company</option>
              <option value="orders">Sort by Orders</option>
              <option value="balance">Sort by Outstanding</option>
              <option value="revenue">Sort by Revenue</option>
            </select>

            <button className={styles.btnSecondary} onClick={handleResetFilters} title="Reset all filters">
              <RotateLeftIcon fontSize="small" />
            </button>

            <div className={styles.toggleGroup}>
              <button
                className={`${styles.toggleBtn} ${viewType === 'table' ? styles.toggleBtnActive : ''}`}
                onClick={() => setViewType('table')}
              >
                <ViewListIcon fontSize="small" />
              </button>
              <button
                className={`${styles.toggleBtn} ${viewType === 'grid' ? styles.toggleBtnActive : ''}`}
                onClick={() => setViewType('grid')}
              >
                <ViewModuleIcon fontSize="small" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      <div className={styles.contentWrapper}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className={styles.skeletonRow} />
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <div className={styles.emptyState}>
            <div style={{ fontSize: '64px' }}>📁</div>
            <h2 className={styles.emptyTitle}>No customers found</h2>
            <p className={styles.emptyText}>Adjust your filters or add a new customer to get started.</p>
            <button className={styles.btnPrimary} onClick={() => { setCurrentId(null); setOpen(true); }}>
              <AddIcon fontSize="small" /> Add Customer
            </button>
          </div>
        ) : viewType === 'table' ? (
          /* Table View */
          <div className={styles.tableContainer}>
            <table className={styles.enterpriseTable}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Company</th>
                  <th>Country</th>
                  <th>WhatsApp</th>
                  <th>Email</th>
                  <th style={{ textAlign: 'right' }}>Total Orders</th>
                  <th style={{ textAlign: 'right' }}>Outstanding Balance</th>
                  <th>Last Order</th>
                  <th>Status</th>
                  <th style={{ width: '60px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((item) => {
                  const client = item.client;
                  const stats = item.stats;
                  const hasDues = stats.outstandingBalance > 0;

                  return (
                    <tr key={client._id} className={styles.tableRow} onClick={() => handleRowClick(client)}>
                      <td>
                        <div className={styles.customerCell}>
                          <div className={styles.avatar}>
                            {client.name ? client.name.charAt(0) : 'C'}
                          </div>
                          <div className={styles.customerMeta}>
                            <span className={styles.customerName}>{client.name}</span>
                            <span className={styles.customerCompany}>{client.companyName || 'No Company'}</span>
                          </div>
                        </div>
                      </td>
                      <td>{client.companyName || '—'}</td>
                      <td>
                        <div className={styles.countryContainer}>
                          <span>{getCountryFlagEmoji(client.country)}</span>
                          <span>{client.country || 'Global'}</span>
                        </div>
                      </td>
                      <td>{client.whatsapp || client.phone || '—'}</td>
                      <td>{client.email || '—'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{stats.totalOrders}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`${styles.balanceDue} ${hasDues ? styles.balancePositive : styles.balanceZero}`}>
                          {client.currency || 'INR'} {stats.outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td>{stats.lastOrderDate ? moment(stats.lastOrderDate).format('DD MMM YYYY') : '—'}</td>
                      <td>
                        <span className={`${styles.badge} ${
                          stats.status === 'Active' ? styles.badgeActive : 
                          stats.status === 'Pending' ? styles.badgePending : styles.badgeNew
                        }`}>
                          {stats.status}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
                        <button
                          className={styles.actionBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === client._id ? null : client._id);
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </button>
                        
                        {activeMenuId === client._id && (
                          <div className={styles.dropdownMenu}>
                            <button className={styles.dropdownItem} onClick={() => handleEdit(client._id)}>
                              <EditIcon fontSize="small" style={{ color: '#0f766e' }} /> Edit
                            </button>
                            <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={() => handleDeleteClick(client._id)}>
                              <DeleteIcon fontSize="small" /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className={styles.customerGrid}>
            {filteredClients.map((item) => {
              const client = item.client;
              const stats = item.stats;
              const hasDues = stats.outstandingBalance > 0;

              return (
                <div key={client._id} className={styles.gridCard} onClick={() => handleRowClick(client)}>
                  <div className={styles.gridHeader}>
                    <div className={styles.gridProfile}>
                      <div className={styles.avatar}>
                        {client.name ? client.name.charAt(0) : 'C'}
                      </div>
                      <div>
                        <div className={styles.customerName}>{client.name}</div>
                        <div className={styles.customerCompany}>{client.companyName || 'No Company'}</div>
                      </div>
                    </div>
                    <span className={`${styles.badge} ${
                      stats.status === 'Active' ? styles.badgeActive : 
                      stats.status === 'Pending' ? styles.badgePending : styles.badgeNew
                    }`}>
                      {stats.status}
                    </span>
                  </div>

                  <div className={styles.gridBody}>
                    <div className={styles.gridBodyItem}>
                      <span className={styles.gridBodyLabel}>Country</span>
                      <span className={styles.gridBodyValue}>
                        {getCountryFlagEmoji(client.country)} {client.country || 'Global'}
                      </span>
                    </div>

                    <div className={styles.gridBodyItem}>
                      <span className={styles.gridBodyLabel}>WhatsApp</span>
                      <span className={styles.gridBodyValue}>{client.whatsapp || client.phone || '—'}</span>
                    </div>

                    <div className={styles.gridBodyItem}>
                      <span className={styles.gridBodyLabel}>Orders</span>
                      <span className={styles.gridBodyValue}>{stats.totalOrders}</span>
                    </div>

                    <div className={styles.gridBodyItem}>
                      <span className={styles.gridBodyLabel}>Outstanding</span>
                      <span className={`${styles.gridBodyValue} ${hasDues ? styles.balancePositive : styles.balanceZero}`}>
                        {client.currency || 'INR'} {stats.outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className={styles.gridFooter}>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Last order: {stats.lastOrderDate ? moment(stats.lastOrderDate).format('DD MMM YYYY') : 'Never'}
                    </span>
                    
                    <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
                      <button
                        className={styles.actionBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === client._id ? null : client._id);
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </button>

                      {activeMenuId === client._id && (
                        <div className={styles.dropdownMenu} style={{ right: 0, top: '100%' }}>
                          <button className={styles.dropdownItem} onClick={() => handleEdit(client._id)}>
                            <EditIcon fontSize="small" style={{ color: '#0f766e' }} /> Edit
                          </button>
                          <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={() => handleDeleteClick(client._id)}>
                            <DeleteIcon fontSize="small" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Side Drawer */}
      <div 
        className={`${styles.drawerOverlay} ${drawerOpen ? styles.drawerOverlayActive : ''}`}
        onClick={() => setDrawerOpen(false)}
      >
        <div className={`${styles.drawer} ${drawerOpen ? styles.drawerActive : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className={styles.drawerHeader}>
            <div className={styles.drawerTitleBlock}>
              <div className={styles.avatar}>
                {selectedClient?.name ? selectedClient.name.charAt(0) : 'C'}
              </div>
              <div>
                <h3 className={styles.customerName} style={{ fontSize: '16px' }}>{selectedClient?.name}</h3>
                <span className={styles.customerCompany}>{selectedClient?.companyName || 'No Company Details'}</span>
              </div>
            </div>
            <button className={styles.drawerCloseBtn} onClick={() => setDrawerOpen(false)}>
              <CloseIcon fontSize="small" />
            </button>
          </div>

          <div className={styles.drawerContent}>
            {/* Quick Actions */}
            <div className={styles.drawerSection}>
              <span className={styles.sectionTitle}>Quick Actions</span>
              <div className={styles.quickActionsGrid}>
                <div className={styles.actionCard} onClick={() => history.push(`/invoice`)}>
                  <ReceiptIcon style={{ color: '#0f766e' }} />
                  <span className={styles.actionCardTitle}>Generate Invoice</span>
                </div>
                <div className={styles.actionCard} onClick={() => history.push(`/invoice`)}>
                  <DescriptionIcon style={{ color: '#3b82f6' }} />
                  <span className={styles.actionCardTitle}>Create Order</span>
                </div>
                <div className={styles.actionCard} onClick={() => {
                  // Find the latest pending invoice
                  const cliInvs = invoices?.filter(i => i.client?.email === selectedClient?.email);
                  const pendingInv = cliInvs?.find(i => i.status?.toLowerCase() === 'unpaid');
                  if (pendingInv) {
                    history.push(`/invoice/${pendingInv._id}`);
                  } else {
                    openSnackbar("No pending unpaid invoices found for this client");
                  }
                }}>
                  <PaymentIcon style={{ color: '#f59e0b' }} />
                  <span className={styles.actionCardTitle}>Record Payment</span>
                </div>
                <a 
                  className={styles.actionCard} 
                  href={`mailto:${selectedClient?.email || ''}?subject=Business Inquiry - Al Huda Textiles`}
                  style={{ textDecoration: 'none' }}
                >
                  <SendIcon style={{ color: '#10b981' }} />
                  <span className={styles.actionCardTitle}>Send Email</span>
                </a>
              </div>
            </div>

            {/* Financial Overview */}
            {selectedClient && (() => {
              const stats = getClientBusinessStats(selectedClient);
              return (
                <div className={styles.drawerSection}>
                  <span className={styles.sectionTitle}>Financial Overview</span>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Lifetime Value (LTV)</span>
                      <span className={styles.infoValue} style={{ color: '#10b981' }}>
                        {selectedClient.currency || 'INR'} {stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Outstanding Balance</span>
                      <span className={styles.infoValue} style={{ color: stats.outstandingBalance > 0 ? '#ef4444' : '#10b981' }}>
                        {selectedClient.currency || 'INR'} {stats.outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Total Orders</span>
                      <span className={styles.infoValue}>{stats.totalOrders} orders</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Preferred Payment Terms</span>
                      <span className={styles.infoValue}>{selectedClient.paymentTerms || 'Advance'}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Customer Information */}
            <div className={styles.drawerSection}>
              <span className={styles.sectionTitle}>Customer Information</span>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Contact Person</span>
                  <span className={styles.infoValue}>{selectedClient?.name || '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Country</span>
                  <div className={styles.countryContainer} style={{ marginTop: '2px' }}>
                    <span>{getCountryFlagEmoji(selectedClient?.country)}</span>
                    <span className={styles.infoValue}>{selectedClient?.country || 'Global'}</span>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Phone Number</span>
                  <span className={styles.infoValue}>{selectedClient?.phone || '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>WhatsApp</span>
                  <span className={styles.infoValue}>{selectedClient?.whatsapp || selectedClient?.phone || '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Email</span>
                  <span className={styles.infoValue}>{selectedClient?.email || '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Preferred Currency</span>
                  <span className={styles.infoValue}>{selectedClient?.currency || 'INR'}</span>
                </div>
              </div>
            </div>

            {/* Document Compliance (VAT, GST, IEC, Trade license) */}
            <div className={styles.drawerSection}>
              <span className={styles.sectionTitle}>Documents & Compliance</span>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>GST Number (India)</span>
                  <span className={styles.infoValue} style={{ fontFamily: 'monospace' }}>{selectedClient?.gst || '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>IEC Code (Import Export)</span>
                  <span className={styles.infoValue} style={{ fontFamily: 'monospace' }}>{selectedClient?.iec || '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Trade License No.</span>
                  <span className={styles.infoValue} style={{ fontFamily: 'monospace' }}>{selectedClient?.tradeLicense || '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Tax VAT No.</span>
                  <span className={styles.infoValue} style={{ fontFamily: 'monospace' }}>{selectedClient?.taxNumber || '—'}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className={styles.drawerSection}>
              <span className={styles.sectionTitle}>Activity History</span>
              <div className={styles.timeline}>
                {selectedClient && (() => {
                  const clientInvoices = invoices?.filter((inv) => {
                    return (
                      (inv.client?.email && selectedClient.email && inv.client.email.toLowerCase() === selectedClient.email.toLowerCase()) ||
                      (inv.client?.phone && selectedClient.phone && inv.client.phone === selectedClient.phone) ||
                      (inv.client?.name && selectedClient.name && inv.client.name.toLowerCase() === selectedClient.name.toLowerCase())
                    );
                  }) || [];

                  if (clientInvoices.length === 0) {
                    return (
                      <div className={styles.timelineItem}>
                        <div className={styles.timelineDot} />
                        <div className={styles.timelineHeader}>
                          <span className={styles.timelineTitle}>Profile Created</span>
                          <span className={styles.timelineTime}>
                            {selectedClient.createdAt ? moment(selectedClient.createdAt).format('DD MMM YYYY') : '—'}
                          </span>
                        </div>
                        <span className={styles.timelineDesc}>Customer profile registered in Accountill ERP.</span>
                      </div>
                    );
                  }

                  return (
                    <>
                      {clientInvoices.slice(0, 3).map((inv, idx) => (
                        <div key={idx} className={styles.timelineItem}>
                          <div className={styles.timelineDot} />
                          <div className={styles.timelineHeader}>
                            <span className={styles.timelineTitle}>Invoice Generated #{inv.invoiceNumber}</span>
                            <span className={styles.timelineTime}>{moment(inv.createdAt || inv.dueDate).format('DD MMM YYYY')}</span>
                          </div>
                          <span className={styles.timelineDesc}>
                            Created a {inv.type || 'Invoice'} of total value {inv.currency || 'INR'} {inv.total?.toLocaleString()} with status: {inv.status}
                          </span>
                        </div>
                      ))}
                      <div className={styles.timelineItem}>
                        <div className={styles.timelineDot} />
                        <div className={styles.timelineHeader}>
                          <span className={styles.timelineTitle}>Profile Initialized</span>
                          <span className={styles.timelineTime}>
                            {selectedClient.createdAt ? moment(selectedClient.createdAt).format('DD MMM YYYY') : '—'}
                          </span>
                        </div>
                        <span className={styles.timelineDesc}>Initial import / registration completed.</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Notes & Tags */}
            <div className={styles.drawerSection}>
              <span className={styles.sectionTitle}>Internal Notes</span>
              <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', lineHeight: 1.5, color: '#334155' }}>
                {selectedClient?.notes || 'No private notes logged for this customer.'}
              </div>
            </div>

            {/* Tags display */}
            <div className={styles.drawerSection}>
              <span className={styles.sectionTitle}>Tags</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {selectedClient?.tags && selectedClient.tags.length > 0 ? (
                  selectedClient.tags.map((tag, idx) => (
                    <span key={idx} className={`${styles.badge} ${styles.badgeVIP}`}>
                      {tag}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>No tags assigned.</span>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Clients;