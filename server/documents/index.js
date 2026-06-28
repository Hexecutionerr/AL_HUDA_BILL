import moment from 'moment'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let signatureBase64 = '';
try {
    const sigPath = path.resolve(__dirname, '../../client/public/signature.png');
    if (fs.existsSync(sigPath)) {
        const signatureBuffer = fs.readFileSync(sigPath);
        signatureBase64 = `data:image/png;base64,${signatureBuffer.toString('base64')}`;
    }
} catch (error) {
    console.error("Signature read error:", error);
}

let logoBase64 = '';
try {
    const logoPath = path.resolve(__dirname, '../../client/public/logo.png');
    if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    }
} catch (error) {
    console.error("Logo read error:", error);
}

const formatIfscHtml = (code) => {
    if (code === 'BARB0MCKAUS') {
        return `<span style="font-family: monospace; letter-spacing: 1.5px; font-weight: bold;">BARB0MCKAUS</span> <span style="font-size: 10px; color: #64748B;">(0 is Zero)</span>`;
    }
    return `<span style="font-family: monospace; letter-spacing: 1.5px; font-weight: bold;">${code}</span>`;
}

export default function (
   { name,
      address,
      phone,
      email,
      dueDate,
      date,
      id,
      notes,
      subTotal,
      type,
      vat,
      total,
      items,
      status,
      totalAmountReceived,
      balanceDue,
      company,
      currencySymbol = '₹',
      paymentDetails
   }) {
    const today = new Date();
    
    const companyName = 'AL Huda';
    const companyEmail = 'alhudatextiless@gmail.com';
    const companyPhone = '+91 79779 11837';
    const companyAddress = 'Colaba, Mumbai - 400005';

    return `
<!DOCTYPE html>
<html>
<head>
<style>
.invoice-container {
    margin: 0;
    padding: 20px;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #0F172A;
    background-color: #FFFFFF;
}

.top-section {
    width: 100%;
    margin-bottom: 30px;
}

.top-table {
    width: 100%;
    border-collapse: collapse;
    border: none;
}

.top-table td {
    border: none;
    padding: 0;
    vertical-align: top;
}

.invoice-title {
    font-family: Georgia, Didot, serif;
    font-size: 38px;
    font-weight: 500;
    letter-spacing: 3px;
    color: #0F172A;
    margin: 0;
    text-transform: uppercase;
}

.meta-info {
    font-size: 12px;
    color: #475569;
    line-height: 1.5;
}

.billing-section {
    width: 100%;
    margin-bottom: 40px;
}

.billing-table {
    width: 100%;
    border-collapse: collapse;
    border: none;
}

.billing-table td {
    border: none;
    padding: 0;
    width: 50%;
    vertical-align: top;
}

.billing-title {
    font-size: 11px;
    font-weight: 700;
    color: #64748B;
    text-transform: uppercase;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
}

.company-name {
    font-size: 18px;
    font-weight: 700;
    color: #0F766E;
    margin: 0 0 6px 0;
}

.client-name {
    font-size: 15px;
    font-weight: 700;
    color: #0F172A;
    margin: 0 0 6px 0;
}

.details-text {
    font-size: 12px;
    color: #475569;
    line-height: 1.5;
}

.items-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 30px;
}

.items-table th {
    background-color: #F8FAFC;
    color: #475569;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    text-align: left;
    padding: 12px;
    border-bottom: 2px solid #E2E8F0;
}

.items-table td {
    padding: 12px;
    font-size: 12px;
    color: #0F172A;
    border-bottom: 1px solid #E2E8F0;
}

.items-table tr:nth-child(even) {
    background-color: #F8FAFC;
}

.bottom-section {
    width: 100%;
    margin-top: 30px;
}

.bottom-table {
    width: 100%;
    border-collapse: collapse;
    border: none;
}

.bottom-table td {
    border: none;
    padding: 0;
    vertical-align: top;
}

.payment-title {
    font-size: 11px;
    font-weight: 700;
    color: #64748B;
    text-transform: uppercase;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
}

.payment-details {
    font-size: 12px;
    color: #475569;
    line-height: 1.6;
}

.summary-table {
    width: 250px;
    margin-left: auto;
    border-collapse: collapse;
}

.summary-table td {
    padding: 8px 12px;
    font-size: 12px;
    color: #475569;
}

.summary-total {
    font-size: 16px;
    font-weight: 700;
    color: #0F172A;
    border-top: 1px solid #E2E8F0;
    padding-top: 10px;
}

.footer-section {
    width: 100%;
    margin-top: 50px;
    border-top: 1px dashed #E2E8F0;
    padding-top: 35px;
}

.footer-table {
    width: 100%;
    border-collapse: collapse;
    border: none;
}

.footer-table td {
    border: none;
    padding: 0;
    vertical-align: bottom;
}

.thank-you {
    font-size: 14px;
    font-weight: 600;
    color: #475569;
    font-style: italic;
}

.signature-block {
    text-align: center;
    width: 180px;
}

.signature-line {
    border-bottom: 1px solid #94A3B8;
    margin-top: 10px;
    margin-bottom: 6px;
}

.signature-label {
    font-size: 11px;
    color: #64748B;
    font-weight: 500;
}

</style>
</head>
<body>
<div class="invoice-container">
    
    <!-- Top section -->
    <div class="top-section">
        <table class="top-table" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="vertical-align: middle;">
                    ${(company && company.logo) ? `<img src="${company.logo}" style="max-height: 80px; max-width: 180px; object-fit: contain;" />` : (logoBase64 ? `<img src="${logoBase64}" style="max-height: 80px; max-width: 180px; object-fit: contain;" />` : `<div style="font-size: 16px; font-weight: 700; color: #0F766E;">AL HUDA</div>`)}
                </td>
                <td style="text-align: right; vertical-align: middle;">
                    <h1 class="invoice-title">${type}</h1>
                </td>
            </tr>
        </table>
    </div>

    <!-- Details Section (Billing & Metadata) -->
    <div class="billing-section" style="border-top: 2px solid #F1F5F9; padding-top: 20px;">
        <table class="billing-table" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="width: 60%; vertical-align: top;">
                    <!-- Billed To -->
                    <div class="billing-title" style="margin-bottom: 6px;">BILLED TO:</div>
                    <h2 class="client-name" style="font-size: 16px; font-weight: 700; margin: 0 0 4px 0; color: #0F172A;">${name}</h2>
                    <div class="details-text" style="font-size: 12px; color: #475569; line-height: 1.5; margin-bottom: 20px;">
                        <div>${phone}</div>
                        <div>${email}</div>
                        <div>${address}</div>
                    </div>

                    <!-- From -->
                    <div class="billing-title" style="margin-bottom: 6px;">FROM:</div>
                    <h2 class="company-name" style="font-size: 16px; font-weight: 700; margin: 0 0 4px 0; color: #0F766E;">AL Huda</h2>
                    <div class="details-text" style="font-size: 12px; color: #475569; line-height: 1.5;">
                        <div>${companyEmail}</div>
                        <div>${companyPhone}</div>
                        <div>${companyAddress}</div>
                    </div>
                </td>
                <td style="width: 40%; text-align: right; vertical-align: top;">
                    <div class="meta-info" style="font-size: 13px; color: #475569; line-height: 1.6; display: inline-block; text-align: left;">
                        <div style="margin-bottom: 4px;"><strong>Invoice No.</strong> <span style="font-weight: 700; color: #0F172A; margin-left: 8px;">${id}</span></div>
                        <div style="margin-bottom: 4px;"><strong>Date:</strong> <span style="font-weight: 600; color: #0F172A; margin-left: 8px;">${moment(date).format('DD MMMM YYYY')}</span></div>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Items table -->
    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 45%;">Item Description</th>
                <th style="width: 12%; text-align: right;">Qty</th>
                <th style="width: 15%; text-align: right;">Price</th>
                <th style="width: 12%; text-align: right;">Tax(%)</th>
                <th style="width: 16%; text-align: right;">Amount</th>
            </tr>
        </thead>
        <tbody>
            ${items.map((item) => {
                const itemAmount = (Number(item.quantity) * Number(item.unitPrice)) + ((Number(item.quantity) * Number(item.unitPrice) * Number(item.discount || 0)) / 100);
                return `
                <tr>
                    <td>${item.itemName}</td>
                    <td style="text-align: right;">${item.quantity}</td>
                    <td style="text-align: right;">${currencySymbol} ${Number(item.unitPrice).toFixed(2)}</td>
                    <td style="text-align: right;">${item.discount || 0}%</td>
                    <td style="text-align: right; font-weight: 600;">${currencySymbol} ${itemAmount.toFixed(2)}</td>
                </tr>
                `;
            }).join('')}
        </tbody>
    </table>

    <!-- Bottom Layout (Payment details & Summary totals) -->
    <div class="bottom-section">
        <table class="bottom-table">
            <tr>
                <td style="width: 55%;">
                    <div class="payment-title">PAYMENT METHOD</div>
                    <div class="payment-details">
                        <div><strong>Bank:</strong> ${paymentDetails?.bankName || 'Bank of Baroda'}</div>
                        <div><strong>Account Name:</strong> ${paymentDetails?.accountName || 'Mohammed ishtiaq Ahmed Khan'}</div>
                        <div><strong>Account No:</strong> ${paymentDetails?.accountNo || '36050100011339'}</div>
                        ${paymentDetails?.ifscCode ? `<div><strong>IFSC Code:</strong> ${formatIfscHtml(paymentDetails.ifscCode)}</div>` : ''}
                        ${paymentDetails?.mobile ? `<div><strong>Mobile no.</strong> ${paymentDetails.mobile}</div>` : ''}
                        ${paymentDetails?.branch ? `<div><strong>Branch/Address:</strong> ${paymentDetails.branch}</div>` : ''}
                    </div>
                    ${notes ? `
                    <div style="margin-top: 15px;">
                        <div class="payment-title">Note:</div>
                        <div class="payment-details" style="white-space: pre-wrap;">${notes}</div>
                    </div>
                    ` : ''}
                </td>
                <td style="width: 45%; text-align: right;">
                    <table class="summary-table">
                        <tr>
                            <td style="text-align: right;">Sub Total:</td>
                            <td style="text-align: right; font-weight: 600; width: 100px;">${currencySymbol} ${subTotal}</td>
                        </tr>
                        <tr>
                            <td style="text-align: right;">Tax / VAT:</td>
                            <td style="text-align: right; font-weight: 600;">${currencySymbol} ${vat}</td>
                        </tr>
                        <tr class="summary-total">
                            <td style="text-align: right; font-weight: 700; font-size: 14px; padding-top: 10px;">Total:</td>
                            <td style="text-align: right; font-weight: 700; font-size: 14px; color: #0F766E; padding-top: 10px;">${currencySymbol} ${total}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>

    <!-- Footer Area (Thank you & Signature) -->
    <div class="footer-section">
        <table class="footer-table">
            <tr>
                <td>
                    <div class="thank-you">Thank you for your business!</div>
                </td>
                <td style="text-align: right;">
                    <div class="signature-block" style="display: inline-block;">
                        ${signatureBase64 ? `<img src="${signatureBase64}" style="max-height: 60px; max-width: 180px; object-fit: contain; mix-blend-mode: multiply;" />` : ''}
                        <div class="signature-line"></div>
                        <div class="signature-label">Authorized Signed</div>
                    </div>
                </td>
            </tr>
        </table>
    </div>

</div>
</body>
</html>
    `;
};