import React, { useState, useEffect } from 'react'
import styles from './Invoice.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useHistory, useLocation } from 'react-router-dom'
import moment from 'moment'
import { toCommas } from '../../utils/utils'
import { saveAs } from 'file-saver'
import axios from 'axios'

import IconButton from '@material-ui/core/IconButton'
import DeleteOutlineRoundedIcon from '@material-ui/icons/DeleteOutlineRounded'
import DateFnsUtils from '@date-io/date-fns'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import Paper from '@material-ui/core/Paper'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'

import { initialState } from '../../initialState'
import currencies from '../../currencies.json'
import { createInvoice, getInvoice, updateInvoice } from '../../actions/invoiceActions'
import { getClientsByUser } from '../../actions/clientActions'
import { getProfilesByUser } from '../../actions/profile'
import AddClient from './AddClient'

const Invoice = () => {
    const location = useLocation()
    const [invoiceData, setInvoiceData] = useState(initialState)
    const [rates, setRates] = useState(0)
    const [vat, setVat] = useState(0)
    const [currency, setCurrency] = useState('INR')
    const [subTotal, setSubTotal] = useState(0)
    const [total, setTotal] = useState(0)
    const today = new Date()
    const [selectedDate, setSelectedDate] = useState(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const [invoiceDate, setInvoiceDate] = useState(today)
    const [client, setClient] = useState(null)
    const [type, setType] = useState('Invoice')
    const [status, setStatus] = useState('')
    const { id } = useParams()

    const getCurrencySymbol = (val) => {
        if (val === 'INR') return '₹';
        if (val === 'USD') return '$';
        if (val === 'EUR') return '€';
        if (val === 'GBP') return '£';
        return val;
    }

    const paymentMethodsList = {
        bob: {
            bankName: 'Bank of Baroda',
            accountName: 'Mohammed ishtiaq Ahmed Khan',
            accountNo: '36050100011339',
            ifscCode: 'BARB0MCKAUS',
            mobile: '9987804375',
            branch: 'Kausa branch Mumbra, Mumbai Maharashtra'
        },
        embd: {
            bankName: 'Emirates NBD',
            accountName: 'AL Huda Export Management',
            accountNo: '0123 4567 8901',
            branch: 'Business Bay, Dubai, UAE'
        }
    };

    const [paymentMethod, setPaymentMethod] = useState('bob')
    const [customBankDetails, setCustomBankDetails] = useState({
        bankName: '',
        accountName: '',
        accountNo: '',
        ifscCode: '',
        mobile: '',
        branch: ''
    })
    const [openPaymentModal, setOpenPaymentModal] = useState(false)

    const getActivePaymentDetails = () => {
        if (paymentMethod === 'bob') return paymentMethodsList.bob;
        if (paymentMethod === 'embd') return paymentMethodsList.embd;
        return customBankDetails;
    }

    const formatIfsc = (code) => {
        if (code === 'BARB0MCKAUS') {
            return (
                <>
                    <span style={{ fontFamily: 'Courier New, monospace', letterSpacing: '2px', fontWeight: 'bold' }}>BARB0MCKAUS</span>
                    <span style={{ fontSize: '11px', color: '#94A3B8', marginLeft: '6px' }}>(0 is Zero)</span>
                </>
            );
        }
        return <span style={{ fontFamily: 'Courier New, monospace', letterSpacing: '2px', fontWeight: 'bold' }}>{code}</span>;
    }
    
    const clients = useSelector((state) => state.clients.clients)
    const { invoice } = useSelector((state) => state.invoices)
    const { profiles } = useSelector((state) => state.profiles)
    console.log("INVOICE COMPONENT CLIENTS STATE:", clients);
    
    const dispatch = useDispatch()
    const history = useHistory()
    const user = JSON.parse(localStorage.getItem('profile'))
    
    const [downloadStatus, setDownloadStatus] = useState(null)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        getTotalCount()
        // eslint-disable-next-line
    }, [location])

    const getTotalCount = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/invoices/count?searchQuery=${user?.result?._id}`)
            setInvoiceData(prev => ({
                ...prev,
                invoiceNumber: (Number(response.data) + 1).toString().padStart(3, '0')
            }))
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if(id) {
            dispatch(getInvoice(id))
        }
        // eslint-disable-next-line
    }, [id])


    useEffect(() => {
        dispatch(getClientsByUser({ search: user?.result?._id || user?.result?.googleId }))
        dispatch(getProfilesByUser({ search: user?.result?._id || user?.result?.googleId }))
        // eslint-disable-next-line
    }, [dispatch])

    useEffect(() => {
        if (invoice) {
            setRates(invoice.rates)
            setClient(invoice.client)
            setType(invoice.type)
            setStatus(invoice.status)
            setSelectedDate(invoice.dueDate)
            setInvoiceDate(invoice.createdAt ? new Date(invoice.createdAt) : today)
            if (invoice.currency) {
                setCurrency(invoice.currency)
            }

            if (invoice.notes) {
                const match = invoice.notes.match(/---PAYMENT_METHOD:(.*)---/);
                if (match) {
                    const val = match[1];
                    if (val.startsWith('custom|')) {
                        const parts = val.split('|');
                        setPaymentMethod('custom');
                        setCustomBankDetails({
                            bankName: parts[1] || '',
                            accountName: parts[2] || '',
                            accountNo: parts[3] || '',
                            ifscCode: parts[4] || '',
                            mobile: parts[5] || '',
                            branch: parts[6] || ''
                        });
                    } else {
                        setPaymentMethod(val);
                    }
                    setInvoiceData({ ...invoice, notes: invoice.notes.replace(/---PAYMENT_METHOD:(.*)---/, '').trim() });
                } else {
                    setInvoiceData(invoice);
                }
            } else {
                setInvoiceData(invoice);
            }
        }
    }, [invoice])

    useEffect(() => {
        if (type === 'Receipt') {
            setStatus('Paid')
        } else {
            setStatus('Unpaid')
        }
    }, [type])

    const defaultProps = {
        options: currencies,
        getOptionLabel: (option) => option ? `${option.value} - ${option.label}` : ''
    }

    const clientsProps = {
        options: clients || [],
        getOptionLabel: (option) => option ? option.name : ''
    }

    const handleDateChange = (date) => {
        setSelectedDate(date)
    }

    const handleRates = (e) => {
        setRates(e.target.value)
        setInvoiceData((prevState) => ({ ...prevState, tax: e.target.value }))
    }

    const handleChange = (index, e) => {
        const values = [...invoiceData.items]
        values[index][e.target.name] = e.target.value
        setInvoiceData({ ...invoiceData, items: values })
    }

    useEffect(() => {
        const calculateSubTotal = () => {
            const arr = document.getElementsByName("amount")
            let subtotal = 0
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].value) {
                    subtotal += Number(arr[i].value)
                }
            }
            setSubTotal(subtotal)
        }
        calculateSubTotal()
    }, [invoiceData])

    useEffect(() => {
        const calculateTotal = () => {
            const overallSum = (rates / 100) * subTotal + subTotal
            setVat((rates / 100) * subTotal)
            setTotal(overallSum)
        }
        calculateTotal()
    }, [invoiceData, rates, subTotal])

    const handleAddField = (e) => {
        e.preventDefault()
        setInvoiceData((prevState) => ({
            ...prevState,
            items: [...prevState.items, { itemName: '', unitPrice: '', quantity: '', discount: '', amount: '' }]
        }))
    }

    const handleRemoveField = (index) => {
        const values = [...invoiceData.items]
        values.splice(index, 1)
        setInvoiceData((prevState) => ({ ...prevState, items: values }))
    }

    const createAndDownloadPdf = () => {
        setDownloadStatus('loading')
        
        let totalAmountReceived = 0
        if (invoice && invoice.paymentRecords) {
            for (let i = 0; i < invoice.paymentRecords.length; i++) {
                totalAmountReceived += Number(invoice.paymentRecords[i].amountPaid)
            }
        }

        axios.post(`${process.env.REACT_APP_API}/create-pdf`, {
            name: client?.name || '',
            address: client?.address || '',
            phone: client?.phone || '',
            email: client?.email || '',
            dueDate: selectedDate,
            date: invoice?.createdAt || today,
            id: invoiceData.invoiceNumber,
            notes: invoiceData.notes,
            subTotal: toCommas(subTotal),
            total: toCommas(total),
            type: type,
            vat: vat,
            items: invoiceData.items,
            status: status,
            totalAmountReceived: toCommas(totalAmountReceived),
            balanceDue: toCommas(total - totalAmountReceived),
            company: profiles,
            currencySymbol: getCurrencySymbol(currency),
            paymentDetails: getActivePaymentDetails()
        })
        .then(() => axios.get(`${process.env.REACT_APP_API}/fetch-pdf`, { responseType: 'blob' }))
        .then((res) => {
            const pdfBlob = new Blob([res.data], { type: 'application/pdf' })
            saveAs(pdfBlob, `invoice_${invoiceData.invoiceNumber}.pdf`)
        })
        .then(() => setDownloadStatus('success'))
        .catch(err => {
            console.error(err)
            setDownloadStatus('error')
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        let serializedPayment = '';
        if (paymentMethod === 'custom') {
            serializedPayment = `custom|${customBankDetails.bankName}|${customBankDetails.accountName}|${customBankDetails.accountNo}|${customBankDetails.ifscCode}|${customBankDetails.mobile}|${customBankDetails.branch}`;
        } else {
            serializedPayment = paymentMethod;
        }

        const payload = {
            ...invoiceData,
            notes: invoiceData.notes + `\n---PAYMENT_METHOD:${serializedPayment}---`,
            subTotal: subTotal,
            total: total,
            vat: vat,
            rates: rates,
            currency: currency,
            dueDate: selectedDate,
            createdAt: invoiceDate,
            client,
            type: type,
            status: status
        }

        if (invoice) {
            dispatch(updateInvoice(invoice._id, payload))
            history.push(`/invoice/${invoice._id}`)
        } else {
            dispatch(createInvoice({
                ...payload,
                invoiceNumber: `${
                    invoiceData.invoiceNumber < 100 ?
                    (Number(invoiceData.invoiceNumber)).toString().padStart(3, '0')
                    : Number(invoiceData.invoiceNumber)
                }`,
                paymentRecords: [],
                creator: [user?.result?._id || user?.result?.googleId]
            }, history))
        }
    }

    const CustomPaper = (props) => {
        return <Paper elevation={3} {...props} />
    }

    if (!user) {
        history.push('/login')
        return null
    }

    return (
        <div className={styles.pageContainer}>
            <form onSubmit={handleSubmit}>
                <AddClient setOpen={setOpen} open={open} setClient={setClient} />
                
                <Dialog open={openPaymentModal} onClose={() => setOpenPaymentModal(false)} fullWidth maxWidth="sm">
                    <DialogTitle style={{ backgroundColor: '#0F766E', color: 'white' }}>Select Payment Method</DialogTitle>
                    <DialogContent dividers>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Option 1: Bank of Baroda */}
                            <div 
                                style={{
                                    padding: '16px',
                                    border: paymentMethod === 'bob' ? '2px solid #0F766E' : '1px solid #E2E8F0',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    backgroundColor: paymentMethod === 'bob' ? 'rgba(15, 118, 110, 0.03)' : 'transparent',
                                    transition: 'all 0.2s'
                                }}
                                onClick={() => setPaymentMethod('bob')}
                            >
                                <h4 style={{ margin: '0 0 8px 0', color: '#0F766E', fontSize: '15px' }}>Bank of Baroda (India)</h4>
                                <div style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.5' }}>
                                    <div><strong>Beneficiary:</strong> Mohammed ishtiaq Ahmed Khan</div>
                                    <div><strong>Account No:</strong> 36050100011339</div>
                                    <div><strong>IFSC:</strong> <span style={{ fontFamily: 'Courier New, monospace', letterSpacing: '2px', fontWeight: 'bold' }}>BARB0MCKAUS</span> <span style={{ fontSize: '11px', color: '#94A3B8' }}>(0 is Zero)</span></div>
                                    <div><strong>Branch:</strong> Kausa branch Mumbra, Mumbai Maharashtra</div>
                                    <div><strong>Mobile no.</strong> 9987804375</div>
                                </div>
                            </div>

                            {/* Option 2: Emirates NBD */}
                            <div 
                                style={{
                                    padding: '16px',
                                    border: paymentMethod === 'embd' ? '2px solid #0F766E' : '1px solid #E2E8F0',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    backgroundColor: paymentMethod === 'embd' ? 'rgba(15, 118, 110, 0.03)' : 'transparent',
                                    transition: 'all 0.2s'
                                }}
                                onClick={() => setPaymentMethod('embd')}
                            >
                                <h4 style={{ margin: '0 0 8px 0', color: '#0F766E', fontSize: '15px' }}>Emirates NBD (Dubai)</h4>
                                <div style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.5' }}>
                                    <div><strong>Beneficiary:</strong> AL Huda Export Management</div>
                                    <div><strong>Account No:</strong> 0123 4567 8901</div>
                                    <div><strong>Branch:</strong> Business Bay, Dubai, UAE</div>
                                </div>
                            </div>

                            {/* Option 3: Custom Details */}
                            <div 
                                style={{
                                    padding: '16px',
                                    border: paymentMethod === 'custom' ? '2px solid #0F766E' : '1px solid #E2E8F0',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    backgroundColor: paymentMethod === 'custom' ? 'rgba(15, 118, 110, 0.03)' : 'transparent',
                                    transition: 'all 0.2s'
                                }}
                                onClick={() => setPaymentMethod('custom')}
                            >
                                <h4 style={{ margin: '0 0 8px 0', color: '#0F766E', fontSize: '15px' }}>Custom Payment Details</h4>
                                {paymentMethod === 'custom' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                                        <TextField 
                                            label="Bank Name" 
                                            variant="outlined" 
                                            size="small" 
                                            value={customBankDetails.bankName}
                                            onChange={(e) => setCustomBankDetails({ ...customBankDetails, bankName: e.target.value })}
                                            fullWidth
                                        />
                                        <TextField 
                                            label="Account Name" 
                                            variant="outlined" 
                                            size="small" 
                                            value={customBankDetails.accountName}
                                            onChange={(e) => setCustomBankDetails({ ...customBankDetails, accountName: e.target.value })}
                                            fullWidth
                                        />
                                        <TextField 
                                            label="Account Number" 
                                            variant="outlined" 
                                            size="small" 
                                            value={customBankDetails.accountNo}
                                            onChange={(e) => setCustomBankDetails({ ...customBankDetails, accountNo: e.target.value })}
                                            fullWidth
                                        />
                                        <TextField 
                                            label="IFSC Code" 
                                            variant="outlined" 
                                            size="small" 
                                            value={customBankDetails.ifscCode}
                                            onChange={(e) => setCustomBankDetails({ ...customBankDetails, ifscCode: e.target.value })}
                                            fullWidth
                                        />
                                        <TextField 
                                            label="Mobile Number" 
                                            variant="outlined" 
                                            size="small" 
                                            value={customBankDetails.mobile}
                                            onChange={(e) => setCustomBankDetails({ ...customBankDetails, mobile: e.target.value })}
                                            fullWidth
                                        />
                                        <TextField 
                                            label="Branch / Other Details" 
                                            variant="outlined" 
                                            size="small" 
                                            value={customBankDetails.branch}
                                            onChange={(e) => setCustomBankDetails({ ...customBankDetails, branch: e.target.value })}
                                            fullWidth
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenPaymentModal(false)} color="primary" variant="contained" style={{ backgroundColor: '#0F766E', color: 'white' }}>
                            Done
                        </Button>
                    </DialogActions>
                </Dialog>
                
                <div className={styles.invoiceGrid}>
                    {/* Left Column: Live Invoice Preview */}
                    <div className={styles.leftColumn}>
                        
                        <div className={styles.card}>
                            {/* Top Meta Row                            {/* Top Header Section */}
                            <div className={styles.invoiceHeaderRow}>
                                <div className={styles.headerLogoLeft}>
                                    <img src="/logo.png" alt="AL HUDA" className={styles.alHudaLogo} />
                                </div>
                                <div className={styles.headerTitleRight}>
                                    <h1 className={styles.invoiceTitleRight}>{type}</h1>
                                </div>
                            </div>

                            {/* Details Row (Billing & Metadata) */}
                            <div className={styles.detailsRow}>
                                {/* Left Side: Billed To & From */}
                                <div className={styles.billedToCol}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <h3 className={styles.billingHeader}>BILLED TO:</h3>
                                        {!client && (
                                            <button type="button" className={styles.customerActionBtn} onClick={() => setOpen(true)}>
                                                + Add Client
                                            </button>
                                        )}
                                    </div>
                                    {client ? (
                                        <div className={styles.billingInfo}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <span className={styles.clientName}>{client.name}</span>
                                                <button type="button" className={styles.customerActionBtn} onClick={() => setClient(null)}>
                                                    Change Customer
                                                </button>
                                            </div>
                                            <div className={styles.clientMeta}>
                                                <div>{client.phone}</div>
                                                <div>{client.email}</div>
                                                <div>{client.address}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <Autocomplete
                                            {...clientsProps}
                                            PaperComponent={CustomPaper}
                                            className={styles.autocompleteCustom}
                                            renderInput={(params) => (
                                                <TextField 
                                                    {...params}
                                                    required={!invoice} 
                                                    label="Search or select a customer..." 
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            )}
                                            value={client}
                                            onChange={(event, value) => setClient(value)}
                                        />
                                    )}

                                    <div style={{ marginTop: '24px' }}>
                                        <h3 className={styles.billingHeader}>From:</h3>
                                        <div className={styles.companyMeta}>
                                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F766E', marginBottom: '4px' }}>AL Huda</div>
                                            <div>alhudatextiless@gmail.com</div>
                                            <div>+91 79779 11837</div>
                                            <div>Colaba, Mumbai - 400005</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Invoice Metadata */}
                                <div className={styles.metaCol}>
                                    <div className={styles.metaRowItem}>
                                        <span className={styles.metaLabel}>Invoice No.</span>
                                        <input
                                            type="text"
                                            className={styles.metaValueInput}
                                            value={invoiceData.invoiceNumber || ''}
                                            onChange={e => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                                            placeholder="000"
                                            required
                                        />
                                    </div>
                                    <div className={styles.metaRowItem}>
                                        <span className={styles.metaLabel}>Date:</span>
                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                            <KeyboardDatePicker
                                                disableToolbar
                                                variant="inline"
                                                format="dd MMM yyyy"
                                                value={invoiceDate}
                                                onChange={(date) => setInvoiceDate(date)}
                                                KeyboardButtonProps={{ 'aria-label': 'change date' }}
                                                style={{ width: '160px' }}
                                                InputProps={{
                                                    disableUnderline: false,
                                                    style: { fontSize: '13px', color: '#0F172A', fontWeight: 600 }
                                                }}
                                            />
                                        </MuiPickersUtilsProvider>
                                    </div>
                                </div>
                            </div>

                            {/* Items Table Card */}
                            <div className={styles.tableCard}>
                                <div className={styles.tableContainer}>
                                    <table className={styles.itemTable}>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '45%' }}>Item Description</th>
                                                <th style={{ width: '12%', textAlign: 'right' }}>Qty</th>
                                                <th style={{ width: '15%', textAlign: 'right' }}>Price</th>
                                                <th style={{ width: '12%', textAlign: 'right' }}>Tax (%)</th>
                                                <th style={{ width: '16%', textAlign: 'right' }}>Amount</th>
                                                <th style={{ width: '8%' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoiceData.items.map((itemField, index) => {
                                                const itemAmount = (Number(itemField.quantity) || 0) * (Number(itemField.unitPrice) || 0) +
                                                    ((Number(itemField.quantity) || 0) * (Number(itemField.unitPrice) || 0) * (Number(itemField.discount) || 0)) / 100
                                                
                                                return (
                                                    <tr key={index} className={styles.itemRow}>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                name="itemName"
                                                                className={styles.tableInput}
                                                                onChange={e => handleChange(index, e)}
                                                                value={itemField.itemName}
                                                                placeholder="Item name or description"
                                                                required
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                name="quantity"
                                                                className={styles.tableInput}
                                                                style={{ textAlign: 'right' }}
                                                                onChange={e => handleChange(index, e)}
                                                                value={itemField.quantity}
                                                                placeholder="0"
                                                                required
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                name="unitPrice"
                                                                className={styles.tableInput}
                                                                style={{ textAlign: 'right' }}
                                                                onChange={e => handleChange(index, e)}
                                                                value={itemField.unitPrice}
                                                                placeholder="0"
                                                                required
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                name="discount"
                                                                className={styles.tableInput}
                                                                style={{ textAlign: 'right' }}
                                                                onChange={e => handleChange(index, e)}
                                                                value={itemField.discount}
                                                                placeholder="Tax %"
                                                            />
                                                        </td>
                                                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#0F172A' }}>
                                                            <input
                                                                type="hidden"
                                                                name="amount"
                                                                value={itemAmount}
                                                            />
                                                            {getCurrencySymbol(currency)} {toCommas(itemAmount.toFixed(2))}
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <IconButton 
                                                                className={styles.deleteButton} 
                                                                onClick={() => handleRemoveField(index)}
                                                            >
                                                                <DeleteOutlineRoundedIcon style={{ width: '20px', height: '20px' }} />
                                                            </IconButton>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className={styles.addRowBtnContainer}>
                                    <button type="button" className={styles.addRowBtn} onClick={handleAddField}>
                                        <span>+ Add Line Item</span>
                                    </button>
                                </div>
                            </div>

                            {/* Bottom Layout inside invoice sheet */}
                            <div className={styles.bottomInvoiceLayout}>
                                {/* Left Side: Bank Details & Note */}
                                <div className={styles.bottomLeft}>
                                    <div className={styles.paymentMethodBlock}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <h4>PAYMENT METHOD</h4>
                                            <button type="button" className={styles.customerActionBtn} onClick={() => setOpenPaymentModal(true)}>
                                                Swap Method
                                            </button>
                                        </div>
                                        <div className={styles.paymentDetails}>
                                            <div><strong>Bank:</strong> {getActivePaymentDetails().bankName || 'N/A'}</div>
                                            <div><strong>Account Name:</strong> {getActivePaymentDetails().accountName || 'N/A'}</div>
                                            <div><strong>Account No:</strong> {getActivePaymentDetails().accountNo || 'N/A'}</div>
                                            {getActivePaymentDetails().ifscCode && <div><strong>IFSC Code:</strong> {formatIfsc(getActivePaymentDetails().ifscCode)}</div>}
                                            {getActivePaymentDetails().mobile && <div><strong>Mobile no.</strong> {getActivePaymentDetails().mobile}</div>}
                                            {getActivePaymentDetails().branch && <div><strong>Branch/Address:</strong> {getActivePaymentDetails().branch}</div>}
                                        </div>
                                    </div>
                                    <div className={styles.notesBlock}>
                                        <h4>Note:</h4>
                                        <textarea
                                            className={styles.notesTextarea}
                                            placeholder="Provide additional details or terms of service"
                                            onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                                            value={invoiceData.notes}
                                        />
                                    </div>
                                </div>

                                {/* Right Side: Summary Totals */}
                                <div className={styles.bottomRight}>
                                    <div className={styles.summaryItem}>
                                        <span>Subtotal</span>
                                        <span>{getCurrencySymbol(currency)} {toCommas(subTotal.toFixed(2))}</span>
                                    </div>
                                    <div className={styles.summaryItem}>
                                        <span>Tax / VAT ({rates}%)</span>
                                        <span>{getCurrencySymbol(currency)} {toCommas(vat.toFixed(2))}</span>
                                    </div>
                                    <div className={styles.summaryTotalRow}>
                                        <span>Total</span>
                                        <span className={styles.totalValue}>{getCurrencySymbol(currency)} {toCommas(total.toFixed(2))}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Area: Thank you & Cursive Signature */}
                            <div className={styles.footerInvoiceSection}>
                                <div className={styles.thankYouBlock}>
                                    <h3>Thank you for your business!</h3>
                                </div>
                                <div className={styles.signatureBlock}>
                                    <img src="/signature.png" alt="Authorized Signed" className={styles.signatureImage} />
                                    <div className={styles.signatureLine}></div>
                                    <div className={styles.signatureLabel}>Authorized Signed</div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Right Column: Sticky Editor Settings */}
                    <div className={styles.rightColumn}>
                        <div className={styles.sidebarCard}>
                            <h3 className={styles.sidebarTitle}>Settings</h3>
                            
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>Tax Rate (%)</label>
                                <input
                                    type="number"
                                    name="rates"
                                    className={styles.styledInput}
                                    value={rates}
                                    onChange={handleRates}
                                    placeholder="0"
                                />
                            </div>



                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>Select Currency</label>
                                <Autocomplete
                                    {...defaultProps}
                                    PaperComponent={CustomPaper}
                                    className={styles.autocompleteCustom}
                                    renderInput={(params) => (
                                        <TextField 
                                            {...params} 
                                            variant="outlined" 
                                            size="small"
                                        />
                                    )}
                                    value={currencies.find(c => c.value === currency) || null}
                                    onChange={(event, value) => setCurrency(value?.value || '')}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>Select Type</label>
                                <select
                                    value={type}
                                    onChange={e => setType(e.target.value)}
                                    className={styles.styledInput}
                                >
                                    <option value="Invoice">Invoice</option>
                                    <option value="Receipt">Receipt</option>
                                    <option value="Estimate">Estimate</option>
                                    <option value="Bill">Bill</option>
                                    <option value="Quotation">Quotation</option>
                                </select>
                            </div>

                            <div className={styles.sidebarActions}>
                                <button type="submit" className={styles.btnPrimary}>
                                    {invoice ? 'Update Invoice' : 'Save & Send'}
                                </button>
                                {invoice && (
                                    <>
                                        <button type="button" className={styles.btnSecondary} onClick={() => window.print()}>
                                            Print
                                        </button>
                                        <button type="button" className={styles.btnSecondary} onClick={createAndDownloadPdf}>
                                            {downloadStatus === 'loading' ? 'Downloading...' : 'Download PDF'}
                                        </button>
                                    </>
                                )}
                                <button type="button" className={styles.btnSecondary} onClick={() => history.push('/dashboard')}>
                                    Discard
                                </button>
                            </div>

                        </div>
                    </div>

                </div>

            </form>
        </div>
    )
}

export default Invoice
