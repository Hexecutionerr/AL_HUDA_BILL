import React, { useState, useEffect } from 'react'
// import "../../../node_modules/react-progress-button/react-progress-button.css"
import { useSnackbar } from 'react-simple-snackbar'
import { useLocation, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { initialState } from '../../initialState'
import { getInvoice } from '../../actions/invoiceActions'
import { toCommas } from '../../utils/utils'
import styles from './InvoiceDetails.module.css'
import moment from 'moment'
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import { Container, Grid } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import BorderColorIcon from '@material-ui/icons/BorderColor';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import Spinner from '../Spinner/Spinner'

import ProgressButton from 'react-progress-button'
import axios from 'axios';
import { saveAs } from 'file-saver';
import Modal from '../Payments/Modal'
import PaymentHistory from './PaymentHistory'

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

const getCurrencySymbol = (val) => {
    if (val === 'INR') return '₹';
    if (val === 'USD') return '$';
    if (val === 'EUR') return '€';
    if (val === 'GBP') return '£';
    return val;
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

const InvoiceDetails = () => {

    const location = useLocation()
    const [invoiceData, setInvoiceData] = useState(initialState)
    const [ rates, setRates] = useState(0)
    const [vat, setVat] = useState(0)
    const [currency, setCurrency] = useState('')
    const [subTotal, setSubTotal] = useState(0)
    const [total, setTotal] = useState(0)
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [ client, setClient] = useState([])
    const [type, setType] = React.useState('')
    const [status, setStatus ] = useState('')
    const [company, setCompany] = useState({})
    const { id } = useParams()
    const { invoice } = useSelector((state) => state.invoices)
    const dispatch = useDispatch()
    const history = useHistory()
    const [sendStatus, setSendStatus] = useState(null)
    const [downloadStatus, setDownloadStatus] = useState(null)
    const [paymentMethod, setPaymentMethod] = useState('bob')
    const [customBankDetails, setCustomBankDetails] = useState({
        bankName: '',
        accountName: '',
        accountNo: '',
        ifscCode: '',
        mobile: '',
        branch: ''
    })
    const [displayNotes, setDisplayNotes] = useState('')
    // eslint-disable-next-line
    const [openSnackbar, closeSnackbar] = useSnackbar()
    const user = JSON.parse(localStorage.getItem('profile'))
    
    const useStyles = makeStyles((theme) => ({
        root: {
          display: 'flex',
          '& > *': {
            margin: theme.spacing(1),
          },
        },
        large: {
          width: theme.spacing(12),
          height: theme.spacing(12),
        },
        table: {
            minWidth: 650,
          },
    
        headerContainer: {
            // display: 'flex'
            paddingTop: theme.spacing(1),
            paddingLeft: theme.spacing(5),
            paddingRight: theme.spacing(1),
            backgroundColor: '#f2f2f2',
            borderRadius: '10px 10px 0px 0px'
        }
      }));
    

    const classes = useStyles()

    useEffect(() => {
        dispatch(getInvoice(id));
      },[id, dispatch, location]);

      useEffect(() => {
        if(invoice) {
            //Automatically set the default invoice values as the ones in the invoice to be updated
            setInvoiceData(invoice)
            setRates(invoice.rates)
            setClient(invoice.client)
            setType(invoice.type)
            setStatus(invoice.status)
            setSelectedDate(invoice.dueDate)
            setVat(invoice.vat)
            setCurrency(invoice.currency)
            setSubTotal(invoice.subTotal)
            setTotal(invoice.total)
            setCompany(invoice?.businessDetails?.data?.data)
           
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
                    setDisplayNotes(invoice.notes.replace(/---PAYMENT_METHOD:(.*)---/, '').trim());
                } else {
                    setDisplayNotes(invoice.notes);
                }
            } else {
                setDisplayNotes('');
            }
        }
    }, [invoice])

    //Get the total amount paid
    let totalAmountReceived = 0
    for(var i = 0; i < invoice?.paymentRecords?.length; i++) {
        totalAmountReceived += Number(invoice?.paymentRecords[i]?.amountPaid)
    }


  const editInvoice = (id) => {
    history.push(`/edit/invoice/${id}`)
  }

  const createAndDownloadPdf = async () => {
    setDownloadStatus('loading')
    const activePaymentDetails = paymentMethod === 'bob' ? paymentMethodsList.bob 
                               : paymentMethod === 'embd' ? paymentMethodsList.embd 
                               : customBankDetails;

    try {
        const response = await axios.post(
            `${process.env.REACT_APP_API}/download-pdf`,
            {
                name: invoice?.client?.name || '',
                address: invoice?.client?.address || '',
                phone: invoice?.client?.phone || '',
                email: invoice?.client?.email || '',
                dueDate: invoice.dueDate,
                date: invoice.createdAt,
                id: invoice.invoiceNumber,
                notes: displayNotes,
                subTotal: toCommas(invoice.subTotal),
                total: toCommas(invoice.total),
                type: invoice.type,
                vat: invoice.vat,
                items: invoice.items,
                status: invoice.status,
                totalAmountReceived: toCommas(totalAmountReceived),
                balanceDue: toCommas(total - totalAmountReceived),
                company: company,
                currencySymbol: getCurrencySymbol(invoice.currency || 'INR'),
                paymentDetails: activePaymentDetails
            },
            { responseType: 'blob' }
        );

        // Use the blob with file-saver — filename is also set by Content-Disposition on server
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        saveAs(pdfBlob, `invoice_${invoice.invoiceNumber}.pdf`);
        setDownloadStatus('success');
    } catch (err) {
        console.error('PDF download error:', err);
        setDownloadStatus('error');
    }
  }



  //SEND PDF INVOICE VIA EMAIL
  const sendPdf = (e) => {
    e.preventDefault()
    setSendStatus('loading')
    const activePaymentDetails = paymentMethod === 'bob' ? paymentMethodsList.bob 
                               : paymentMethod === 'embd' ? paymentMethodsList.embd 
                               : customBankDetails;

    axios.post(`${process.env.REACT_APP_API}/send-pdf`, 
    { name: invoice.client.name,
      address: invoice.client.address,
      phone: invoice.client.phone,
      email: invoice.client.email,
      dueDate: invoice.dueDate,
      date: invoice.createdAt,
      id: invoice.invoiceNumber,
      notes: displayNotes,
      subTotal: toCommas(invoice.subTotal),
      total: toCommas(invoice.total),
      type: invoice.type,
      vat: invoice.vat,
      items: invoice.items,
      status: invoice.status,
      totalAmountReceived: toCommas(totalAmountReceived),
      balanceDue: toCommas(total - totalAmountReceived),
      link: `${process.env.REACT_APP_URL}/invoice/${invoice._id}`,
      company: company,
      currencySymbol: getCurrencySymbol(invoice.currency || 'INR'),
      paymentDetails: activePaymentDetails
  })
  .then(() => setSendStatus('success'))
      .catch((error) => {
        console.log(error)
        setSendStatus('error')
      })
  }


const iconSize = {height: '18px', width: '18px', marginRight: '10px', color: 'gray'}
const [open, setOpen ] = useState(false)


  function checkStatus() {
    return totalAmountReceived >= total ? "green"
         : status === "Partial" ? "#1976d2"
         : status === "Paid" ? "green"
         : status === "Unpaid" ? "red"
         : "red";
}


if(!invoice) {
  return (
    <Spinner />
  )
}


    return (
        <div className={styles.PageLayout}>
           {invoice?.creator?.includes(user?.result?._id || user?.result?.googleId) && (
            <div className={styles.buttons}>
                  <ProgressButton 
                    onClick={sendPdf} 
                    state={sendStatus}
                    onSuccess={()=> openSnackbar("Invoice sent successfully")}
                  >
                  Send to Customer
                  </ProgressButton>
              
                <ProgressButton 
                  onClick={createAndDownloadPdf} 
                  state={downloadStatus}>
                  Download PDF
                </ProgressButton>

                <button 
                className={styles.btn}  
                onClick={() => editInvoice(invoiceData._id)}
                > 
                <BorderColorIcon style={iconSize} 
                />
                Edit Invoice
                </button>

                <button 
                  // disabled={status === 'Paid' ? true : false}
                  className={styles.btn} 
                  onClick={() => setOpen((prev) => !prev)}> 
                  <MonetizationOnIcon style={iconSize} 
                /> 
                Record Payment
                </button>
            </div>
             )}

             {invoice?.paymentRecords.length !== 0 && (
                <PaymentHistory paymentRecords={invoiceData?.paymentRecords} />
             )}
        
            <Modal open={open} setOpen={setOpen} invoice={invoice}/>
            <div className={styles.invoiceLayout}>
                {/* Top Header Section */}
                <div className={styles.invoiceHeaderRow}>
                    <div className={styles.headerLogoLeft}>
                        <img src="/logo.png" alt="AL HUDA" className={styles.alHudaLogo} />
                    </div>
                    <div className={styles.headerTitleRight}>
                        <h1 className={styles.invoiceTitleRight}>{Number(total - totalAmountReceived) <= 0 ? 'RECEIPT' : type}</h1>
                    </div>
                </div>

                {/* Details Row (Billing & Metadata) */}
                <div className={styles.detailsRow}>
                    {/* Left: BILLED TO & FROM */}
                    <div className={styles.billedToCol}>
                        <div style={{ marginBottom: '24px' }}>
                            <h3 className={styles.billingHeader}>BILLED TO:</h3>
                            <div className={styles.clientMeta}>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>{client?.name}</div>
                                <div>{client?.phone}</div>
                                <div>{client?.email}</div>
                                <div>{client?.address}</div>
                            </div>
                        </div>

                        <div>
                            <h3 className={styles.billingHeader}>From:</h3>
                            <div className={styles.companyMeta}>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F766E', marginBottom: '4px' }}>AL Huda</div>
                                <div>alhudatextiless@gmail.com</div>
                                <div>+91 79779 11837</div>
                                <div>Colaba, Mumbai - 400005</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Invoice Metadata */}
                    <div className={styles.metaCol}>
                        <div className={styles.metaRowItem}>
                            <span className={styles.metaLabel}>Invoice No.</span>
                            <span className={styles.metaValue}>{invoiceData?.invoiceNumber}</span>
                        </div>
                        <div className={styles.metaRowItem}>
                            <span className={styles.metaLabel}>Status:</span>
                            <span className={styles.metaValue} style={{ color: checkStatus(), fontWeight: 700 }}>{totalAmountReceived >= total ? 'Paid' : status}</span>
                        </div>
                        <div className={styles.metaRowItem}>
                            <span className={styles.metaLabel}>Date:</span>
                            <span className={styles.metaValue}>{moment(invoiceData?.createdAt).format("DD MMMM YYYY")}</span>
                        </div>
                        <div className={styles.metaRowItem} style={{ marginTop: '8px' }}>
                            <span className={styles.metaLabel} style={{ fontSize: '15px' }}>Amount:</span>
                            <span className={styles.metaValue} style={{ fontSize: '20px', color: '#0F766E', fontWeight: 800 }}>{getCurrencySymbol(currency)} {toCommas(total.toFixed(2))}</span>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className={styles.tableContainer}>
                    <table className={styles.itemTable}>
                        <thead>
                            <tr>
                                <th style={{ width: '45%' }}>Item Description</th>
                                <th style={{ width: '12%', textAlign: 'right' }}>Qty</th>
                                <th style={{ width: '15%', textAlign: 'right' }}>Price</th>
                                <th style={{ width: '12%', textAlign: 'right' }}>Tax (%)</th>
                                <th style={{ width: '16%', textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData?.items?.map((itemField, index) => {
                                const itemAmount = (Number(itemField.quantity) || 0) * (Number(itemField.unitPrice) || 0) +
                                    ((Number(itemField.quantity) || 0) * (Number(itemField.unitPrice) || 0) * (Number(itemField.discount) || 0)) / 100
                                
                                return (
                                    <tr key={index} className={styles.itemRow}>
                                        <td>{itemField.itemName}</td>
                                        <td style={{ textAlign: 'right' }}>{itemField.quantity}</td>
                                        <td style={{ textAlign: 'right' }}>{getCurrencySymbol(currency)} {toCommas(Number(itemField.unitPrice).toFixed(2))}</td>
                                        <td style={{ textAlign: 'right' }}>{itemField.discount || '0'}%</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{getCurrencySymbol(currency)} {toCommas(itemAmount.toFixed(2))}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Bottom Section */}
                <div className={styles.bottomInvoiceLayout}>
                    {/* Left: Payment Method & Notes */}
                    <div className={styles.bottomLeft}>
                        <div className={styles.paymentMethodBlock}>
                            <h4>PAYMENT METHOD</h4>
                            <div className={styles.paymentDetails}>
                                <div><strong>Bank:</strong> {paymentMethod === 'bob' ? paymentMethodsList.bob.bankName : paymentMethod === 'embd' ? paymentMethodsList.embd.bankName : customBankDetails.bankName || 'N/A'}</div>
                                <div><strong>Account Name:</strong> {paymentMethod === 'bob' ? paymentMethodsList.bob.accountName : paymentMethod === 'embd' ? paymentMethodsList.embd.accountName : customBankDetails.accountName || 'N/A'}</div>
                                <div><strong>Account No:</strong> {paymentMethod === 'bob' ? paymentMethodsList.bob.accountNo : paymentMethod === 'embd' ? paymentMethodsList.embd.accountNo : customBankDetails.accountNo || 'N/A'}</div>
                                {(paymentMethod === 'bob' ? paymentMethodsList.bob.ifscCode : customBankDetails.ifscCode) && <div><strong>IFSC Code:</strong> {formatIfsc(paymentMethod === 'bob' ? paymentMethodsList.bob.ifscCode : customBankDetails.ifscCode)}</div>}
                                {(paymentMethod === 'bob' ? paymentMethodsList.bob.mobile : customBankDetails.mobile) && <div><strong>Mobile no.</strong> {paymentMethod === 'bob' ? paymentMethodsList.bob.mobile : customBankDetails.mobile}</div>}
                                {(paymentMethod === 'bob' ? paymentMethodsList.bob.branch : paymentMethod === 'embd' ? paymentMethodsList.embd.branch : customBankDetails.branch) && <div><strong>Branch/Address:</strong> {paymentMethod === 'bob' ? paymentMethodsList.bob.branch : paymentMethod === 'embd' ? paymentMethodsList.embd.branch : customBankDetails.branch}</div>}
                            </div>
                        </div>

                        {displayNotes && (
                            <div className={styles.notesBlock}>
                                <h4>Note:</h4>
                                <p className={styles.notesText}>{displayNotes}</p>
                            </div>
                        )}
                    </div>

                    {/* Right: Summary totals */}
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

                {/* Footer Section */}
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
        
    )
}

export default InvoiceDetails
