import moment from 'moment';

const formatIfscHtml = (code) => {
  if (code === 'BARB0MCKAUS') {
    return `<span style="font-family: monospace; letter-spacing: 1.5px; font-weight: bold;">BARB0MCKAUS</span> <span style="font-size: 10px; color: #64748B;">(0 is Zero)</span>`;
  }
  return `<span style="font-family: monospace; letter-spacing: 1.5px; font-weight: bold;">${code || ''}</span>`;
};

export const generateInvoiceHtml = ({
  name = '',
  address = '',
  phone = '',
  email = '',
  dueDate = '',
  date = new Date(),
  id = '',
  notes = '',
  subTotal = '0',
  type = 'INVOICE',
  vat = '0',
  total = '0',
  items = [],
  company = {},
  currencySymbol = '₹',
  paymentDetails = {},
  logoSrc = '/logo.png',
  signatureSrc = '/signature.png'
}) => {
  const companyName = company?.businessName || company?.name || 'AL Huda';
  const companyEmail = company?.email || 'alhudatextiless@gmail.com';
  const companyPhone = company?.phoneNumber || '+91 79779 11837';
  const companyAddress = company?.contactAddress || 'Colaba, Mumbai - 400005';
  const formattedDate = moment(date).format('DD MMMM YYYY');

  const itemsHtml = (items || []).map((item, idx) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const discount = Number(item.discount || 0);
    const itemAmount = (qty * price) + ((qty * price * discount) / 100);

    return `
      <tr style="background-color: ${idx % 2 === 1 ? '#F8FAFC' : '#FFFFFF'};">
        <td style="padding: 12px; font-size: 12px; color: #0F172A; border-bottom: 1px solid #E2E8F0;">${item.itemName || ''}</td>
        <td style="padding: 12px; font-size: 12px; color: #0F172A; border-bottom: 1px solid #E2E8F0; text-align: right;">${item.quantity || 0}</td>
        <td style="padding: 12px; font-size: 12px; color: #0F172A; border-bottom: 1px solid #E2E8F0; text-align: right;">${currencySymbol} ${price.toFixed(2)}</td>
        <td style="padding: 12px; font-size: 12px; color: #0F172A; border-bottom: 1px solid #E2E8F0; text-align: right;">${discount}%</td>
        <td style="padding: 12px; font-size: 12px; color: #0F172A; border-bottom: 1px solid #E2E8F0; text-align: right; font-weight: 600;">${currencySymbol} ${itemAmount.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="invoice-container" style="
      margin: 0 auto;
      padding: 24px 32px;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #0F172A;
      background-color: #FFFFFF;
      width: 750px;
      box-sizing: border-box;
    ">
      <!-- Top Section -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <tr>
          <td style="vertical-align: middle;">
            ${logoSrc ? `<img src="${logoSrc}" style="max-height: 80px; max-width: 180px; object-fit: contain;" alt="Logo" />` : `<div style="font-size: 16px; font-weight: 700; color: #0F766E;">AL HUDA</div>`}
          </td>
          <td style="text-align: right; vertical-align: middle;">
            <h1 style="font-family: Georgia, Didot, serif; font-size: 38px; font-weight: 500; letter-spacing: 3px; color: #0F172A; margin: 0; text-transform: uppercase;">
              ${type || 'INVOICE'}
            </h1>
          </td>
        </tr>
      </table>

      <!-- Details Section (Billing & Metadata) -->
      <div style="border-top: 2px solid #F1F5F9; padding-top: 20px; margin-bottom: 35px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 60%; vertical-align: top;">
              <!-- Billed To -->
              <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">BILLED TO:</div>
              <h2 style="font-size: 16px; font-weight: 700; margin: 0 0 4px 0; color: #0F172A;">${name || 'Client'}</h2>
              <div style="font-size: 12px; color: #475569; line-height: 1.5; margin-bottom: 20px;">
                ${phone ? `<div>${phone}</div>` : ''}
                ${email ? `<div>${email}</div>` : ''}
                ${address ? `<div>${address}</div>` : ''}
              </div>

              <!-- From -->
              <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">FROM:</div>
              <h2 style="font-size: 16px; font-weight: 700; margin: 0 0 4px 0; color: #0F766E;">${companyName}</h2>
              <div style="font-size: 12px; color: #475569; line-height: 1.5;">
                <div>${companyEmail}</div>
                <div>${companyPhone}</div>
                <div>${companyAddress}</div>
              </div>
            </td>
            <td style="width: 40%; text-align: right; vertical-align: top;">
              <div style="font-size: 13px; color: #475569; line-height: 1.6; display: inline-block; text-align: left;">
                <div style="margin-bottom: 6px;"><strong>Invoice No.</strong> <span style="font-weight: 700; color: #0F172A; margin-left: 8px;">${id || ''}</span></div>
                <div style="margin-bottom: 6px;"><strong>Date:</strong> <span style="font-weight: 600; color: #0F172A; margin-left: 8px;">${formattedDate}</span></div>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background-color: #F8FAFC;">
            <th style="padding: 12px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: left; border-bottom: 2px solid #E2E8F0; width: 45%;">ITEM DESCRIPTION</th>
            <th style="padding: 12px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right; border-bottom: 2px solid #E2E8F0; width: 12%;">QTY</th>
            <th style="padding: 12px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right; border-bottom: 2px solid #E2E8F0; width: 15%;">PRICE</th>
            <th style="padding: 12px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right; border-bottom: 2px solid #E2E8F0; width: 12%;">TAX(%)</th>
            <th style="padding: 12px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: right; border-bottom: 2px solid #E2E8F0; width: 16%;">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Bottom Layout (Payment details & Summary totals) -->
      <div style="width: 100%; margin-top: 30px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 55%; vertical-align: top;">
              <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">PAYMENT METHOD</div>
              <div style="font-size: 12px; color: #475569; line-height: 1.6;">
                <div><strong>Bank:</strong> ${paymentDetails?.bankName || 'Bank of Baroda'}</div>
                <div><strong>Account Name:</strong> ${paymentDetails?.accountName || 'Mohammed ishtiaq Ahmed Khan'}</div>
                <div><strong>Account No:</strong> ${paymentDetails?.accountNo || '36050100011339'}</div>
                ${paymentDetails?.ifscCode ? `<div><strong>IFSC Code:</strong> ${formatIfscHtml(paymentDetails.ifscCode)}</div>` : ''}
                ${paymentDetails?.mobile ? `<div><strong>Mobile no.</strong> ${paymentDetails.mobile}</div>` : ''}
                ${paymentDetails?.branch ? `<div><strong>Branch/Address:</strong> ${paymentDetails.branch}</div>` : ''}
              </div>
              ${notes ? `
                <div style="margin-top: 15px;">
                  <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">NOTE:</div>
                  <div style="font-size: 12px; color: #475569; line-height: 1.5; white-space: pre-wrap;">${notes}</div>
                </div>
              ` : ''}
            </td>
            <td style="width: 45%; text-align: right; vertical-align: top;">
              <table style="width: 250px; margin-left: auto; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 12px; font-size: 12px; color: #475569; text-align: right;">Sub Total:</td>
                  <td style="padding: 8px 12px; font-size: 12px; color: #0F172A; text-align: right; font-weight: 600; width: 100px;">${currencySymbol} ${subTotal}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; font-size: 12px; color: #475569; text-align: right;">Tax / VAT:</td>
                  <td style="padding: 8px 12px; font-size: 12px; color: #0F172A; text-align: right; font-weight: 600;">${currencySymbol} ${vat}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px 0; font-size: 14px; font-weight: 700; color: #0F172A; border-top: 1px solid #E2E8F0; text-align: right;">Total:</td>
                  <td style="padding: 10px 12px 0; font-size: 14px; font-weight: 700; color: #0F766E; border-top: 1px solid #E2E8F0; text-align: right;">${currencySymbol} ${total}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>

      <!-- Footer Area (Thank you & Signature) -->
      <div style="width: 100%; margin-top: 45px; border-top: 1px dashed #E2E8F0; padding-top: 25px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: bottom;">
              <div style="font-size: 14px; font-weight: 600; color: #475569; font-style: italic;">Thank you for your business!</div>
            </td>
            <td style="text-align: right; vertical-align: bottom;">
              <div style="display: inline-block; text-align: center; width: 180px;">
                ${signatureSrc ? `<img src="${signatureSrc}" style="max-height: 60px; max-width: 180px; object-fit: contain; mix-blend-mode: multiply;" alt="Signature" />` : ''}
                <div style="border-bottom: 1px solid #94A3B8; margin-top: 10px; margin-bottom: 6px;"></div>
                <div style="font-size: 11px; color: #64748B; font-weight: 500;">Authorized Signed</div>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;
};
