import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

import { useDispatch, useSelector } from 'react-redux';
import { createClient, updateClient } from '../../actions/clientActions';
import { useSnackbar } from 'react-simple-snackbar';
import styles from './Clients.module.css';

const dialogStyles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
    backgroundColor: '#0F766E', // Teal 700
    color: '#ffffff',
    position: 'relative'
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: 'white',
  },
});

const DialogTitle = withStyles(dialogStyles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6" style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.01em' }}>{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    backgroundColor: '#ffffff'
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px'
  },
}))(MuiDialogActions);

const AddClient = ({ setOpen, open, currentId, setCurrentId }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [openSnackbar] = useSnackbar();

  const [clientData, setClientData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    country: '',
    currency: 'INR',
    paymentTerms: 'Advance',
    taxNumber: '',
    gst: '',
    iec: '',
    tradeLicense: '',
    notes: '',
    tags: '',
    logo: '',
    userId: []
  });

  const [user, setUser] = useState(JSON.parse(localStorage.getItem('profile')));
  const client = useSelector((state) => currentId ? state.clients.clients.find((c) => c._id === currentId) : null);

  useEffect(() => {
    if (client) {
      setClientData({
        name: client.name || '',
        companyName: client.companyName || '',
        email: client.email || '',
        phone: client.phone || '',
        whatsapp: client.whatsapp || '',
        address: client.address || '',
        country: client.country || '',
        currency: client.currency || 'INR',
        paymentTerms: client.paymentTerms || 'Advance',
        taxNumber: client.taxNumber || '',
        gst: client.gst || '',
        iec: client.iec || '',
        tradeLicense: client.tradeLicense || '',
        notes: client.notes || '',
        tags: client.tags ? client.tags.join(', ') : '',
        logo: client.logo || '',
        userId: client.userId || []
      });
    } else {
      clear();
    }
  }, [client]);

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('profile')));
  }, [location]);

  useEffect(() => {
    const checkId = user?.result?._id || user?.result?.googleId;
    if (checkId) {
      setClientData((prev) => ({ ...prev, userId: [checkId] }));
    }
  }, [location, user]);

  const handleSubmitClient = (e) => {
    e.preventDefault();
    if (!clientData.name) {
      openSnackbar("Contact Person Name is required");
      return;
    }

    const checkId = user?.result?._id || user?.result?.googleId;
    
    // Parse tags from comma separated string
    const tagsArray = clientData.tags
      ? clientData.tags.split(',').map((t) => t.trim()).filter((t) => t)
      : [];

    const finalClientData = {
      ...clientData,
      tags: tagsArray,
      userId: checkId ? [checkId] : []
    };

    if (currentId) {
      dispatch(updateClient(currentId, finalClientData, openSnackbar));
    } else {
      dispatch(createClient(finalClientData, openSnackbar));
    }

    clear();
    handleClose();
  };

  const clear = () => {
    setCurrentId(null);
    setClientData({
      name: '',
      companyName: '',
      email: '',
      phone: '',
      whatsapp: '',
      address: '',
      country: '',
      currency: 'INR',
      paymentTerms: 'Advance',
      taxNumber: '',
      gst: '',
      iec: '',
      tradeLicense: '',
      notes: '',
      tags: '',
      logo: '',
      userId: []
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Dialog
        onClose={(e, reason) => {
          if (reason !== 'backdropClick') {
            handleClose();
          }
        }}
        aria-labelledby="customized-dialog-title"
        open={open}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          {currentId ? 'Edit Customer Profile' : 'Create Customer Profile'}
        </DialogTitle>
        <DialogContent dividers>
          <div className={styles.formGrid}>
            
            {/* Section: Basic Details */}
            <div className={styles.formField}>
              <label className={styles.formLabel}>Contact Person *</label>
              <input
                type="text"
                placeholder="e.g. Hasnain Khan"
                className={styles.formInput}
                value={clientData.name}
                onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                required
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Company Name</label>
              <input
                type="text"
                placeholder="e.g. Al Huda Textiles"
                className={styles.formInput}
                value={clientData.companyName}
                onChange={(e) => setClientData({ ...clientData, companyName: e.target.value })}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Email Address</label>
              <input
                type="email"
                placeholder="e.g. client@company.com"
                className={styles.formInput}
                value={clientData.email}
                onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Phone Number</label>
              <input
                type="text"
                placeholder="e.g. +91 9987804375"
                className={styles.formInput}
                value={clientData.phone}
                onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>WhatsApp Number</label>
              <input
                type="text"
                placeholder="e.g. +91 9987804375"
                className={styles.formInput}
                value={clientData.whatsapp}
                onChange={(e) => setClientData({ ...clientData, whatsapp: e.target.value })}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Country</label>
              <input
                type="text"
                placeholder="e.g. United Arab Emirates, Saudi Arabia"
                className={styles.formInput}
                value={clientData.country}
                onChange={(e) => setClientData({ ...clientData, country: e.target.value })}
              />
            </div>

            {/* Section: Financial & Terms */}
            <div className={styles.formField}>
              <label className={styles.formLabel}>Preferred Currency</label>
              <select
                className={styles.formInput}
                value={clientData.currency}
                onChange={(e) => setClientData({ ...clientData, currency: e.target.value })}
              >
                <option value="INR">INR (₹) - India</option>
                <option value="AED">AED (د.إ) - UAE</option>
                <option value="SAR">SAR (ر.س) - Saudi Arabia</option>
                <option value="QAR">QAR (ر.ق) - Qatar</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Payment Terms</label>
              <select
                className={styles.formInput}
                value={clientData.paymentTerms}
                onChange={(e) => setClientData({ ...clientData, paymentTerms: e.target.value })}
              >
                <option value="Advance">Advance Payment</option>
                <option value="LC">Letter of Credit (LC)</option>
                <option value="CAD">Cash Against Documents (CAD)</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 60">Net 60 Days</option>
                <option value="Net 90">Net 90 Days</option>
              </select>
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Tax Number / VAT No.</label>
              <input
                type="text"
                placeholder="Tax Identification Number"
                className={styles.formInput}
                value={clientData.taxNumber}
                onChange={(e) => setClientData({ ...clientData, taxNumber: e.target.value })}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>GST Number (India)</label>
              <input
                type="text"
                placeholder="GSTIN Number"
                className={styles.formInput}
                value={clientData.gst}
                onChange={(e) => setClientData({ ...clientData, gst: e.target.value })}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>IEC Code (Import Export Code)</label>
              <input
                type="text"
                placeholder="10-digit IEC Code"
                className={styles.formInput}
                value={clientData.iec}
                onChange={(e) => setClientData({ ...clientData, iec: e.target.value })}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Trade License Number</label>
              <input
                type="text"
                placeholder="Trade License / Registration Number"
                className={styles.formInput}
                value={clientData.tradeLicense}
                onChange={(e) => setClientData({ ...clientData, tradeLicense: e.target.value })}
              />
            </div>

            <div className={styles.formFieldFull}>
              <label className={styles.formLabel}>Tags (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. VIP, Regular, New Customer, Middle East"
                className={styles.formInput}
                value={clientData.tags}
                onChange={(e) => setClientData({ ...clientData, tags: e.target.value })}
              />
            </div>

            <div className={styles.formFieldFull}>
              <label className={styles.formLabel}>Billing / Shipping Address</label>
              <textarea
                placeholder="Full address of the client..."
                className={styles.formTextarea}
                value={clientData.address}
                onChange={(e) => setClientData({ ...clientData, address: e.target.value })}
              />
            </div>

            <div className={styles.formFieldFull}>
              <label className={styles.formLabel}>Internal Notes</label>
              <textarea
                placeholder="Private notes about payment records, history, or delivery preferences..."
                className={styles.formTextarea}
                value={clientData.notes}
                onChange={(e) => setClientData({ ...clientData, notes: e.target.value })}
              />
            </div>

          </div>
        </DialogContent>
        <DialogActions>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.btnPrimary}
            onClick={handleSubmitClient}
          >
            Save Customer Profile
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddClient;