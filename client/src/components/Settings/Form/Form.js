/* eslint-disable */
import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useSnackbar } from 'react-simple-snackbar';
import { getProfilesByUser, updateProfile } from '../../../actions/profile';
import styles from '../Settings.module.css';

// Parse paymentDetails — handles JSON object OR legacy "Bank: X Account Name: Y..." string
const emptyPayment = { bankName: '', accountName: '', accountNo: '', ifscCode: '', mobile: '', branch: '' };

const parsePayment = (raw) => {
    if (!raw) return { ...emptyPayment };
    // Try JSON first
    try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null) return { ...emptyPayment, ...parsed };
    } catch (_) {}

    // Legacy plain-string parser via regex
    const result = { ...emptyPayment };
    const str = raw;

    const extract = (regex) => {
        const m = str.match(regex);
        return m ? m[1].trim() : '';
    };

    result.bankName    = extract(/(?:^|[\s])Bank[:\s]+(.+?)(?=\s*Account\s*Name|\s*Account\s*No|\s*IFSC|\s*Mobile|\s*Branch|$)/i);
    result.accountName = extract(/Account\s*Name[:\s]+(.+?)(?=\s*Account\s*No|\s*IFSC|\s*Mobile|\s*Branch|$)/i);
    result.accountNo   = extract(/Account\s*No[:\s]+([0-9\s]+?)(?=\s*IFSC|\s*Mobile|\s*Branch|$)/i);
    result.ifscCode    = extract(/IFSC\s*Code[:\s]+([A-Z0-9]+)/i);
    result.mobile      = extract(/Mobile\s*(?:no\.?|number)?[:\s]+([0-9\s]+?)(?=\s*Branch|$)/i);
    result.branch      = extract(/Branch[/\s\w]*[:\s]+(.+?)$/i);

    // If nothing extracted, fall back to raw as bankName
    if (!Object.values(result).some(v => v?.trim())) result.bankName = raw;

    return result;
};

const stringifyPayment = (obj) => JSON.stringify(obj);

// ─── Field component ───────────────────────────────────────
const Field = ({ label, children, full }) => (
    <div className={`${styles.fieldGroup} ${full ? styles.fullWidth : ''}`}>
        <label className={styles.fieldLabel}>{label}</label>
        {children}
    </div>
);

// ─── Main component ─────────────────────────────────────────
const SettingsForm = () => {
    const user = JSON.parse(localStorage.getItem('profile'));
    const dispatch = useDispatch();
    const location = useLocation();
    const [openSnackbar] = useSnackbar();
    const profiles = useSelector((s) => s.profiles.profiles);
    const fileRef = useRef();

    const [editing, setEditing] = useState(false);
    const [logoPreview, setLogoPreview] = useState('');
    const [form, setForm] = useState({
        email: '', phoneNumber: '', businessName: '',
        contactAddress: '', logo: '',
    });
    const [payment, setPayment] = useState({
        bankName: '', accountName: '', accountNo: '',
        ifscCode: '', mobile: '', branch: '',
    });

    useEffect(() => {
        dispatch(getProfilesByUser({ search: user?.result?._id || user?.result?.googleId }));
    }, [location]);

    // Normalize profiles
    const p = Array.isArray(profiles) ? profiles[0] : profiles;
    localStorage.setItem('profileDetail', JSON.stringify({ ...p }));

    const initials = (p?.businessName || p?.name || 'A')
        .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

    // When Edit is clicked, seed form from current profile
    const startEditing = () => {
        setForm({
            email:          p?.email          || '',
            phoneNumber:    p?.phoneNumber    || '',
            businessName:   p?.businessName   || '',
            contactAddress: p?.contactAddress || '',
            logo:           p?.logo           || '',
        });
        setPayment(parsePayment(p?.paymentDetails));
        setLogoPreview(p?.logo || '');
        setEditing(true);
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handlePayment = (e) => setPayment({ ...payment, [e.target.name]: e.target.value });

    // Logo file upload → compressed base64
    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 250;
                const MAX_HEIGHT = 150;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to compressed jpeg
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
                setLogoPreview(compressedBase64);
                setForm(f => ({ ...f, logo: compressedBase64 }));
            };
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...form, paymentDetails: stringifyPayment(payment) };
        await dispatch(updateProfile(p?._id, payload, openSnackbar));
        setEditing(false);
    };

    // ────────────────── VIEW MODE ──────────────────────────
    if (!editing) {
        const pd = parsePayment(p?.paymentDetails);
        const hasPayment = Object.values(pd).some(v => v?.trim());

        return (
            <>
                {/* Gradient banner */}
                <div className={styles.banner}>
                    <div className={styles.bannerAvatar}>
                        {p?.logo ? <img src={p.logo} alt="logo" /> : initials}
                    </div>
                    <div className={styles.bannerText}>
                        <h1>{p?.businessName || 'Your Business'}</h1>
                        <p>{p?.email || 'No email configured'}</p>
                    </div>
                </div>

                {/* Business info */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardHeaderIcon}>🏢</div>
                        <h2>Business Information</h2>
                    </div>
                    <div className={styles.cardBody}>
                        {[
                            { icon: '🏢', label: 'Business Name',   value: p?.businessName },
                            { icon: '📍', label: 'Address',         value: p?.contactAddress },
                            { icon: '📞', label: 'Phone',           value: p?.phoneNumber },
                            { icon: '✉️', label: 'Email',           value: p?.email },
                        ].map(({ icon, label, value }) => (
                            <div className={styles.detailRow} key={label}>
                                <div className={styles.detailIcon}>{icon}</div>
                                <div className={styles.detailContent}>
                                    <p className={styles.label}>{label}</p>
                                    <p className={`${styles.value} ${!value ? styles.valueMuted : ''}`}>
                                        {value || 'Not set'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className={styles.editBtn} onClick={startEditing}>✏️ Edit Profile</button>
                </div>

                {/* Payment details card */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardHeaderIcon}>💳</div>
                        <h2>Payment Details</h2>
                    </div>
                    <div className={styles.cardBody}>
                        {hasPayment ? (
                            <div className={styles.paymentGrid}>
                                {pd.bankName    && <><span className={styles.pgLabel}>Bank</span>           <span className={styles.pgValue}>{pd.bankName}</span></>}
                                {pd.accountName && <><span className={styles.pgLabel}>Account Name</span>   <span className={styles.pgValue}>{pd.accountName}</span></>}
                                {pd.accountNo   && <><span className={styles.pgLabel}>Account No</span>     <span className={styles.pgValue} style={{fontFamily:'monospace',fontWeight:700,letterSpacing:'1px'}}>{pd.accountNo}</span></>}
                                {pd.ifscCode    && <><span className={styles.pgLabel}>IFSC Code</span>      <span className={styles.pgValue} style={{fontFamily:'monospace',fontWeight:700}}>{pd.ifscCode}</span></>}
                                {pd.mobile      && <><span className={styles.pgLabel}>Mobile</span>         <span className={styles.pgValue}>{pd.mobile}</span></>}
                                {pd.branch      && <><span className={styles.pgLabel}>Branch</span>         <span className={styles.pgValue}>{pd.branch}</span></>}
                            </div>
                        ) : (
                            <p className={styles.valueMuted} style={{padding:'8px 0'}}>No payment details set</p>
                        )}
                    </div>
                    <button className={styles.editBtn} onClick={startEditing}>✏️ Edit Payment Details</button>
                </div>
            </>
        );
    }

    // ────────────────── EDIT MODE ──────────────────────────
    const previewInitials = (form.businessName || 'A')
        .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

    return (
        <>
            {/* Banner */}
            <div className={styles.banner}>
                <div className={styles.bannerAvatar}>
                    {logoPreview
                        ? <img src={logoPreview} alt="logo" />
                        : previewInitials}
                </div>
                <div className={styles.bannerText}>
                    <h1>{form.businessName || 'Edit Profile'}</h1>
                    <p>{form.email || 'Update your details'}</p>
                </div>
            </div>

            {/* Business Details Card */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderIcon}>🏢</div>
                    <h2>Business Details</h2>
                </div>
                <div className={styles.cardBody}>
                    <form id="settings-form" onSubmit={handleSubmit}>
                        <div className={styles.formGrid}>

                            {/* Logo Upload */}
                            <Field label="Business Logo" full>
                                <div className={styles.logoUploadRow}>
                                    {logoPreview && (
                                        <div className={styles.logoThumb}>
                                            <img src={logoPreview} alt="logo" />
                                        </div>
                                    )}
                                    <div
                                        className={styles.uploadZone}
                                        onClick={() => fileRef.current.click()}
                                    >
                                        <span className={styles.uploadIcon}>📁</span>
                                        <p>{logoPreview ? 'Click to change logo' : 'Click to upload logo'}</p>
                                        <p className={styles.uploadHint}>PNG, JPG up to 2MB</p>
                                    </div>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleLogoUpload}
                                    />
                                </div>
                            </Field>

                            <Field label="Business Name" full>
                                <input className={styles.fieldInput} type="text" name="businessName"
                                    placeholder="AL Huda Textiles" value={form.businessName} onChange={handleChange} />
                            </Field>

                            <Field label="Email Address">
                                <input className={styles.fieldInput} type="email" name="email"
                                    placeholder="your@email.com" value={form.email} onChange={handleChange} />
                            </Field>

                            <Field label="Phone Number">
                                <input className={styles.fieldInput} type="text" name="phoneNumber"
                                    placeholder="+91 99999 99999" value={form.phoneNumber} onChange={handleChange} />
                            </Field>

                            <Field label="Contact Address" full>
                                <input className={styles.fieldInput} type="text" name="contactAddress"
                                    placeholder="Street, City, Country" value={form.contactAddress} onChange={handleChange} />
                            </Field>
                        </div>
                    </form>
                </div>
            </div>

            {/* Payment Details Card */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderIcon}>💳</div>
                    <h2>Payment Details</h2>
                </div>
                <div className={styles.cardBody}>
                    <div className={styles.formGrid}>
                        <Field label="Bank Name" full>
                            <input className={styles.fieldInput} type="text" name="bankName"
                                placeholder="Bank of Baroda" value={payment.bankName} onChange={handlePayment} />
                        </Field>
                        <Field label="Account Holder Name" full>
                            <input className={styles.fieldInput} type="text" name="accountName"
                                placeholder="Mohammed Ishtiaq Ahmed Khan" value={payment.accountName} onChange={handlePayment} />
                        </Field>
                        <Field label="Account Number">
                            <input className={styles.fieldInput} type="text" name="accountNo"
                                placeholder="36050100011339" value={payment.accountNo} onChange={handlePayment} />
                        </Field>
                        <Field label="IFSC Code">
                            <input className={styles.fieldInput} type="text" name="ifscCode"
                                placeholder="BARB0MCKAUS" value={payment.ifscCode} onChange={handlePayment} />
                        </Field>
                        <Field label="Mobile / UPI">
                            <input className={styles.fieldInput} type="text" name="mobile"
                                placeholder="9987804375" value={payment.mobile} onChange={handlePayment} />
                        </Field>
                        <Field label="Branch / Address">
                            <input className={styles.fieldInput} type="text" name="branch"
                                placeholder="Kausa Branch Mumbra, Mumbai" value={payment.branch} onChange={handlePayment} />
                        </Field>
                    </div>
                </div>

                {/* Actions */}
                <div className={styles.formActions} style={{ padding: '0 28px 28px' }}>
                    <button type="button" className={styles.cancelBtn} onClick={() => setEditing(false)}>
                        Cancel
                    </button>
                    <button type="submit" form="settings-form" className={styles.submitBtn} onClick={handleSubmit}>
                        💾 Save Changes
                    </button>
                </div>
            </div>
        </>
    );
};

export default SettingsForm;
