import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import moment from 'moment';
import { deleteInvoice, getInvoicesByUser } from '../../actions/invoiceActions';
import NoData from '../svgIcons/NoData';
import Spinner from '../Spinner/Spinner';
import { useSnackbar } from 'react-simple-snackbar';
import styles from './Invoices.module.css';

const ROWS_PER_PAGE = 10;

// ── helpers ─────────────────────────────────────────
const toCommas = (v) => Number(v).toLocaleString('en-IN');

const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const getBadgeClass = (status, s) => {
  if (status === 'Paid')    return s.badgePaid;
  if (status === 'Partial') return s.badgePartial;
  return s.badgeUnpaid;
};

const getCurrencySymbol = (code) => {
  const map = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' };
  return map[code] || code;
};

// ── component ────────────────────────────────────────
const Invoices = () => {
  const dispatch     = useDispatch();
  const location     = useLocation();
  const history      = useHistory();
  const user         = JSON.parse(localStorage.getItem('profile'));
  const rows         = useSelector((s) => s.invoices.invoices);
  const isLoading    = useSelector((s) => s.invoices.isLoading);
  const [openSnackbar] = useSnackbar();

  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('All');
  const [page,      setPage]      = useState(0);

  useEffect(() => {
    dispatch(
      getInvoicesByUser({ search: user?.result?._id || user?.result?.googleId })
    );
    // eslint-disable-next-line
  }, [location]);

  if (!user) { history.push('/login'); return null; }

  // ── derived data ──
  const filtered = rows.filter((r) => {
    const matchSearch =
      r.invoiceNumber?.toString().includes(search) ||
      r.client?.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || r.status === filter;
    return matchSearch && matchFilter;
  });

  const totalPages  = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated   = filtered.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE);

  const totalAmount = rows.reduce((s, r) => s + (Number(r.total) || 0), 0);
  const unpaidCount = rows.filter((r) => r.status === 'Unpaid').length;
  const paidCount   = rows.filter((r) => r.status === 'Paid').length;

  // ── handlers ──
  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(0); };
  const handleFilterChange = (e) => { setFilter(e.target.value); setPage(0); };

  // ── loading / empty ──
  if (isLoading) {
    return (
      <div className={styles.spinnerWrap}><Spinner /></div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className={styles.emptyState}>
        <NoData />
        <h3>No invoices yet</h3>
        <p>Click the + button to create your first invoice</p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Invoices</h1>
          <p>{rows.length} invoice{rows.length !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.teal}`}>₹</div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Total Billed</p>
            <p className={styles.statValue}>₹ {toCommas(totalAmount)}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.amber}`}>⚡</div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Unpaid</p>
            <p className={styles.statValue}>{unpaidCount}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.blue}`}>✓</div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Paid</p>
            <p className={styles.statValue}>{paidCount}</p>
          </div>
        </div>
      </div>

      {/* ── Search + Filter ── */}
      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            placeholder="Search by invoice # or client name…"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={filter}
          onChange={handleFilterChange}
        >
          <option value="All">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partial">Partial</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableCard}>
        <div className={styles.tableInner}>

          {/* Header */}
          <div className={styles.tableHeader}>
            <span className={styles.th}>#</span>
            <span className={styles.th}>Client</span>
            <span className={`${styles.th} ${styles.right}`}>Amount</span>
            <span className={`${styles.th} ${styles.right}`}>Due Date</span>
            <span className={`${styles.th} ${styles.center}`}>Status</span>
            <span className={`${styles.th} ${styles.right}`}>Actions</span>
          </div>

          {/* Rows */}
          {paginated.length === 0 ? (
            <div className={styles.emptyState} style={{ padding: '50px 24px' }}>
              <p>No invoices match your search.</p>
            </div>
          ) : paginated.map((row) => {
            const isOverdue =
              row.status !== 'Paid' && moment(row.dueDate).isBefore(moment());

            return (
              <div
                key={row._id}
                className={styles.tableRow}
                onClick={() => history.push(`/invoice/${row._id}`)}
              >
                {/* Invoice Number */}
                <span className={styles.invoiceNum}>
                  #{row.invoiceNumber}
                </span>

                {/* Client */}
                <div className={styles.clientCell}>
                  <div className={styles.avatar}>
                    {getInitials(row.client?.name)}
                  </div>
                  <span className={styles.clientName}>
                    {row.client?.name}
                  </span>
                </div>

                {/* Amount */}
                <span className={styles.amountCell}>
                  <span className={styles.currencyTag}>
                    {getCurrencySymbol(row.currency)}
                  </span>
                  {toCommas(row.total)}
                </span>

                {/* Due Date */}
                <span
                  className={`${styles.dateCell} ${isOverdue ? styles.dateOverdue : ''}`}
                >
                  {isOverdue ? '⚠ ' : ''}{moment(row.dueDate).fromNow()}
                </span>

                {/* Status */}
                <div className={styles.statusCell}>
                  <span className={`${styles.badge} ${getBadgeClass(row.status, styles)}`}>
                    {row.status}
                  </span>
                </div>

                {/* Actions */}
                <div
                  className={styles.actionsCell}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className={styles.actionBtn}
                    title="Edit"
                    onClick={() => history.push(`/edit/invoice/${row._id}`)}
                  >
                    ✏️
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.delete}`}
                    title="Delete"
                    onClick={() => dispatch(deleteInvoice(row._id, openSnackbar))}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <span className={styles.pageInfo}>
                Showing {page * ROWS_PER_PAGE + 1}–{Math.min((page + 1) * ROWS_PER_PAGE, filtered.length)} of {filtered.length}
              </span>
              <div className={styles.pageButtons}>
                <button
                  className={styles.pageBtn}
                  disabled={page === 0}
                  onClick={() => setPage(0)}
                >«</button>
                <button
                  className={styles.pageBtn}
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >‹</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`${styles.pageBtn} ${i === page ? styles.pageBtnActive : ''}`}
                    onClick={() => setPage(i)}
                  >{i + 1}</button>
                ))}
                <button
                  className={styles.pageBtn}
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >›</button>
                <button
                  className={styles.pageBtn}
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(totalPages - 1)}
                >»</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Invoices;