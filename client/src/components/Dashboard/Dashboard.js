import React, { useEffect, useState } from 'react'
import { toCommas } from '../../utils/utils'
import styles from './Dashboard.module.css'
import { useHistory, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getInvoicesByUser } from '../../actions/invoiceActions'
import Empty from '../svgIcons/Empty'
import Chart from './Chart'
import moment from 'moment'
import { Check, Pie, Bag, Card, Clock, Frown } from './Icons'
import Spinner from '../Spinner/Spinner'
import Modal from '../Payments/Modal'

const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const getBadgeClass = (status, s) => {
  if (status === 'Paid')    return s.badgePaid;
  if (status === 'Partial') return s.badgePartial;
  return s.badgeUnpaid;
};

const Dashboard = () => {
    const location = useLocation()
    const history = useHistory()
    const dispatch = useDispatch()
    const user = JSON.parse(localStorage.getItem('profile'))
    const { invoices, isLoading } = useSelector((state) => state?.invoices)
    const overDue = invoices?.filter((invoice) => invoice.dueDate <= new Date().toISOString())
    const [openModal, setOpenModal] = useState(false)
    const [selectedInvoice, setSelectedInvoice] = useState(null)

    let paymentHistory = []
    for(let i = 0; i < invoices.length; i++) {
        let history = []
        if(invoices[i].paymentRecords !== undefined) {
            history = [...paymentHistory, invoices[i].paymentRecords]
            paymentHistory = [].concat.apply([], history);
        }
    }

    const sortHistoryByDate = paymentHistory.sort(function(a, b) {
        var c = new Date(a.datePaid);
        var d = new Date(b.datePaid);
        return d - c;
    });
    
    let totalPaid = 0
    for(let i = 0; i < invoices.length; i++) {
        if(invoices[i].totalAmountReceived !== undefined) {
            totalPaid += invoices[i].totalAmountReceived
        }
    }

    let totalAmount = 0
    for(let i = 0; i < invoices.length; i++) {
        totalAmount += invoices[i].total
    }
   
    useEffect(() => {
        dispatch(getInvoicesByUser({search: user?.result._id || user?.result?.googleId}));
        // eslint-disable-next-line
    }, [location, dispatch]);

    const unpaidInvoice = invoices?.filter((invoice) => invoice.status === 'Unpaid')
    const paid = invoices?.filter((invoice) => invoice.status === 'Paid')
    const partial = invoices?.filter((invoice) => invoice.status === 'Partial')
    const unpaidOrPartialInvoices = invoices?.filter((invoice) => invoice.status === 'Unpaid' || invoice.status === 'Partial')
    
    if(!user) {
        history.push('/login')
        return null;
    }

    if(isLoading) {
        return (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px'}}>
                <Spinner />
            </div>
        )
    }

    if(invoices.length === 0) {
        return (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '80px 24px'}}>
                <Empty />
                <p style={{padding: '20px', color: 'gray'}}>Nothing to display. Click the plus icon in the menu to start creating.</p>
            </div>
        )
    }

    return (
        <div className={styles.pageContainer}>
            {selectedInvoice && (
                <Modal open={openModal} setOpen={setOpenModal} invoice={selectedInvoice} />
            )}
           
            {/* ── Hero Banner ── */}
            <div className={styles.hero}>
                <div>
                    <h1>Dashboard</h1>
                    <p>Overview of your business financials & invoice statuses</p>
                </div>
            </div>
    
            {/* ── Stats Grid ── */}
            <section className={styles.statSection}>
                <ul className={styles.autoGrid}>
                    <li className={`${styles.listItem} ${styles.receivedCard}`}>
                        <div className={styles.listItemInfo}>
                            <h2>Received</h2>
                            <p>₹ {toCommas(totalPaid)}</p>
                        </div>
                        <div className={styles.iconWrap}>
                            <Check />
                        </div>
                    </li>

                    <li className={styles.listItem} style={{ cursor: 'pointer' }} onClick={() => history.push('/invoices')}>
                        <div className={styles.listItemInfo}>
                            <h2>Pending Amount</h2>
                            <p>₹ {toCommas(totalAmount - totalPaid)}</p>
                        </div>
                        <div className={`${styles.iconWrap} ${styles.amberIcon}`}>
                            <Pie />
                        </div>
                    </li>

                    <li className={styles.listItem} style={{ cursor: 'pointer' }} onClick={() => history.push('/invoices')}>
                        <div className={styles.listItemInfo}>
                            <h2>Total Amount</h2>
                            <p>₹ {toCommas(totalAmount)}</p>
                        </div>
                        <div className={`${styles.iconWrap} ${styles.blueIcon}`}>
                            <Bag />
                        </div>
                    </li>

                    <li className={styles.listItem} style={{ cursor: 'pointer' }} onClick={() => history.push('/invoices')}>
                        <div className={styles.listItemInfo}>
                            <h2>Total Invoices</h2>
                            <p>{invoices.length}</p>
                        </div>
                        <div className={`${styles.iconWrap} ${styles.emeraldIcon}`}>
                            <Card />
                        </div>
                    </li>

                    <li className={`${styles.listItem} ${styles.paidCard}`} style={{ cursor: 'pointer' }} onClick={() => history.push('/invoices')}>
                        <div className={styles.listItemInfo}>
                            <h2>Paid Invoices</h2>
                            <p>{paid.length}</p>
                        </div>
                        <div className={styles.iconWrap}>
                            <Check />
                        </div>
                    </li>

                    <li className={styles.listItem} style={{ cursor: 'pointer' }} onClick={() => history.push('/invoices')}>
                        <div className={styles.listItemInfo}>
                            <h2>Partially Paid</h2>
                            <p>{partial.length}</p>
                        </div>
                        <div className={`${styles.iconWrap} ${styles.blueIcon}`}>
                            <Pie />
                        </div>
                    </li>

                    <li className={styles.listItem} style={{ cursor: 'pointer' }} onClick={() => history.push('/invoices')}>
                        <div className={styles.listItemInfo}>
                            <h2>Unpaid Invoices</h2>
                            <p>{unpaidInvoice.length}</p>
                        </div>
                        <div className={`${styles.iconWrap} ${styles.roseIcon}`}>
                            <Frown />
                        </div>
                    </li>

                    <li className={styles.listItem} style={{ cursor: 'pointer' }} onClick={() => history.push('/invoices')}>
                        <div className={styles.listItemInfo}>
                            <h2>Overdue</h2>
                            <p>{overDue.length}</p>
                        </div>
                        <div className={`${styles.iconWrap} ${styles.roseIcon}`}>
                            <Clock />
                        </div>
                    </li>
                </ul>
            </section>

            {/* ── Content Grid ── */}
            <div className={styles.dashboardGrid}>
                {/* 1. Invoices Awaiting Payment Section */}
                {unpaidOrPartialInvoices.length !== 0 && (
                    <div className={styles.dashboardCard}>
                        <div className={styles.cardHeader}>
                            <h3>Invoices Awaiting Payment</h3>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.tableContainer}>
                                <table className={styles.customTable}>
                                    <thead>
                                        <tr>
                                            <th>Invoice No.</th>
                                            <th>Customer</th>
                                            <th>Due Date</th>
                                            <th style={{ textAlign: 'right' }}>Amount</th>
                                            <th style={{ textAlign: 'right' }}>Balance Due</th>
                                            <th style={{ textAlign: 'center' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {unpaidOrPartialInvoices.map((invoice) => {
                                            const balance = Number(invoice.total) - Number(invoice.totalAmountReceived || 0);
                                            return (
                                                <tr key={invoice._id} style={{ cursor: 'pointer' }} onClick={() => history.push(`/invoice/${invoice._id}`)}>
                                                    <td style={{ fontWeight: 'bold' }}>#{invoice.invoiceNumber}</td>
                                                    <td>
                                                        <div className={styles.avatarWrap}>
                                                            <div className={`${styles.avatar} ${styles.avatarBlue}`}>
                                                                {getInitials(invoice?.client?.name)}
                                                            </div>
                                                            <span>{invoice?.client?.name}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={invoice.dueDate <= new Date().toISOString() ? styles.overdueText : ''}>
                                                            {moment(invoice.dueDate).format('MMM Do YYYY')} ({moment(invoice.dueDate).fromNow()})
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'right', fontWeight: '600' }}>₹ {toCommas(invoice.total)}</td>
                                                    <td style={{ textAlign: 'right' }} className={styles.balanceText}>₹ {toCommas(balance)}</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <button 
                                                            className={styles.recordBtn}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedInvoice(invoice);
                                                                setOpenModal(true);
                                                            }}
                                                        >
                                                            Record Payment
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Recent Payments List Section */}
                <div className={styles.dashboardCard}>
                    <div className={styles.cardHeader}>
                        <h3>{paymentHistory.length ? 'Recent Payments' : 'No Payments Received Yet'}</h3>
                    </div>
                    <div className={styles.cardBody}>
                        {paymentHistory.length !== 0 ? (
                            <div className={styles.tableContainer}>
                                <table className={styles.customTable}>
                                    <thead>
                                        <tr>
                                            <th>Paid By</th>
                                            <th>Date Paid</th>
                                            <th style={{ textAlign: 'right' }}>Amount Paid</th>
                                            <th>Payment Method</th>
                                            <th>Note</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortHistoryByDate.slice(-10).map((record) => (
                                            <tr key={record._id}>
                                                <td>
                                                    <div className={styles.avatarWrap}>
                                                        <div className={styles.avatar}>
                                                            {getInitials(record.paidBy)}
                                                        </div>
                                                        <span style={{ fontWeight: '500' }}>{record.paidBy}</span>
                                                    </div>
                                                </td>
                                                <td>{moment(record.datePaid).format('MMMM Do YYYY')}</td>
                                                <td style={{ textAlign: 'right', color: '#10b981', fontWeight: '700', fontSize: '14px' }}>
                                                    + ₹ {toCommas(record.amountPaid)}
                                                </td>
                                                <td>
                                                    <span className={`${styles.badge} ${styles.badgePartial}`}>
                                                        {record.paymentMethod}
                                                    </span>
                                                </td>
                                                <td style={{ color: '#64748b', fontStyle: 'italic' }}>{record.note || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                                Unpaid or partial invoices recorded will show up here as payment activities.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
