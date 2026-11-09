// Single-page PDF generator matching the exact server/documents/index.js A4 layout
import moment from 'moment';
import { saveAs } from 'file-saver';

const loadHtml2Pdf = () => {
  if (typeof window !== 'undefined' && window.html2pdf) {
    return Promise.resolve(window.html2pdf);
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById('html2pdf-cdn-script');
    if (existing) {
      if (window.html2pdf) return resolve(window.html2pdf);
      existing.addEventListener('load', () => resolve(window.html2pdf));
      existing.addEventListener('error', () => reject(new Error('Failed to load html2pdf from CDN')));
      return;
    }

    const script = document.createElement('script');
    script.id = 'html2pdf-cdn-script';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.async = true;
    script.onload = () => {
      if (window.html2pdf) {
        resolve(window.html2pdf);
      } else {
        reject(new Error('html2pdf loaded but not found on window'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load html2pdf script'));
    document.body.appendChild(script);
  });
};

const getBase64Image = async (url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) return url;
    const blob = await res.blob();
    if (!blob.type.startsWith('image/')) return url;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(url);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return url;
  }
};

const formatIfscHtml = (code) => {
  if (code === 'BARB0MCKAUS') {
    return `<span style="font-family: monospace; letter-spacing: 1px; font-weight: bold;">BARB0MCKAUS</span> <span style="font-size: 10px; color: #64748B;">(0 is Zero)</span>`;
  }
  return `<span style="font-family: monospace; letter-spacing: 1px; font-weight: bold;">${code}</span>`;
};

export const generateInvoiceHtml = ({
  name = '',
  address = '',
  phone = '',
  email = '',
  date = new Date(),
  id = '',
  notes = '',
  subTotal = '0',
  type = 'INVOICE',
  vat = '0',
  total = '0',
  items = [],
  currencySymbol = '₹',
  paymentDetails = {},
  logoSrc = '/logo.png',
  signatureSrc = '/signature.png'
}) => {
  const companyEmail = 'alhudatextiless@gmail.com';
  const companyPhone = '+91 79779 11837';
  const companyAddress = 'Colaba, Mumbai - 400005';
  const cleanNotes = notes && notes !== 'undefined' && notes !== 'null' ? notes.trim() : '';

  return `
    <div style="box-sizing: border-box; width: 794px; max-width: 794px; margin: 0; padding: 24px 30px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0F172A; background-color: #FFFFFF; line-height: 1.4;">
      
      <!-- Top section -->
      <div style="width: 100%; margin-bottom: 18px;">
        <table style="width: 100%; border-collapse: collapse; border: none;">
          <tr>
            <td style="vertical-align: middle; border: none; padding: 0;">
              ${logoSrc ? `<img src="${logoSrc}" alt="AL HUDA" style="max-height: 70px; max-width: 160px; object-fit: contain;" />` : `<div style="font-size: 18px; font-weight: 700; color: #0F766E;">AL HUDA</div>`}
            </td>
            <td style="text-align: right; vertical-align: middle; border: none; padding: 0;">
              <h1 style="font-family: Georgia, Didot, serif; font-size: 34px; font-weight: 500; letter-spacing: 2px; color: #0F172A; margin: 0; text-transform: uppercase;">${type || 'INVOICE'}</h1>
            </td>
          </tr>
        </table>
      </div>

      <!-- Details Section (Billing & Metadata) -->
      <div style="border-top: 2px solid #F1F5F9; padding-top: 14px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; border: none;">
          <tr>
            <td style="width: 60%; vertical-align: top; border: none; padding: 0;">
              <!-- Billed To -->
              <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">BILLED TO:</div>
              <div style="font-size: 15px; font-weight: 700; color: #0F172A; margin-bottom: 2px;">${name || 'Customer'}</div>
              <div style="font-size: 12px; color: #475569; line-height: 1.4; margin-bottom: 12px;">
                ${phone ? `<div>${phone}</div>` : ''}
                ${email ? `<div>${email}</div>` : ''}
                ${address ? `<div>${address}</div>` : ''}
              </div>

              <!-- From -->
              <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">FROM:</div>
              <div style="font-size: 15px; font-weight: 700; color: #0F766E; margin-bottom: 2px;">AL Huda</div>
              <div style="font-size: 12px; color: #475569; line-height: 1.4;">
                <div>${companyEmail}</div>
                <div>${companyPhone}</div>
                <div>${companyAddress}</div>
              </div>
            </td>
            <td style="width: 40%; text-align: right; vertical-align: top; border: none; padding: 0;">
              <div style="font-size: 13px; color: #475569; line-height: 1.6; display: inline-block; text-align: left;">
                <div style="margin-bottom: 4px;"><strong>Invoice No.</strong> <span style="font-weight: 700; color: #0F172A; margin-left: 8px;">${id || '001'}</span></div>
                <div style="margin-bottom: 4px;"><strong>Date:</strong> <span style="font-weight: 600; color: #0F172A; margin-left: 8px;">${moment(date).format('DD MMMM YYYY')}</span></div>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
        <thead>
          <tr style="background-color: #F8FAFC;">
            <th style="width: 45%; color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase; text-align: left; padding: 9px 10px; border-bottom: 2px solid #E2E8F0;">Item Description</th>
            <th style="width: 12%; color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase; text-align: right; padding: 9px 10px; border-bottom: 2px solid #E2E8F0;">Qty</th>
            <th style="width: 15%; color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase; text-align: right; padding: 9px 10px; border-bottom: 2px solid #E2E8F0;">Price</th>
            <th style="width: 12%; color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase; text-align: right; padding: 9px 10px; border-bottom: 2px solid #E2E8F0;">Tax(%)</th>
            <th style="width: 16%; color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase; text-align: right; padding: 9px 10px; border-bottom: 2px solid #E2E8F0;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${(items || []).map((item, idx) => {
            const itemAmount = (Number(item.quantity || 0) * Number(item.unitPrice || 0)) + ((Number(item.quantity || 0) * Number(item.unitPrice || 0) * Number(item.discount || 0)) / 100);
            const bg = idx % 2 === 1 ? 'background-color: #F8FAFC;' : '';
            return `
              <tr style="${bg}">
                <td style="padding: 9px 10px; font-size: 12px; color: #0F172A; border-bottom: 1px solid #E2E8F0;">${item.itemName || ''}</td>
                <td style="padding: 9px 10px; font-size: 12px; color: #0F172A; text-align: right; border-bottom: 1px solid #E2E8F0;">${item.quantity || 0}</td>
                <td style="padding: 9px 10px; font-size: 12px; color: #0F172A; text-align: right; border-bottom: 1px solid #E2E8F0;">${currencySymbol} ${Number(item.unitPrice || 0).toFixed(2)}</td>
                <td style="padding: 9px 10px; font-size: 12px; color: #0F172A; text-align: right; border-bottom: 1px solid #E2E8F0;">${item.discount || 0}%</td>
                <td style="padding: 9px 10px; font-size: 12px; font-weight: 600; color: #0F172A; text-align: right; border-bottom: 1px solid #E2E8F0;">${currencySymbol} ${itemAmount.toFixed(2)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- Bottom Layout (Payment details & Summary totals) -->
      <div style="width: 100%; margin-top: 14px;">
        <table style="width: 100%; border-collapse: collapse; border: none;">
          <tr>
            <td style="width: 55%; vertical-align: top; border: none; padding: 0;">
              <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">PAYMENT METHOD</div>
              <div style="font-size: 12px; color: #475569; line-height: 1.5;">
                <div><strong>Bank:</strong> ${paymentDetails?.bankName || 'Bank of Baroda'}</div>
                <div><strong>Account Name:</strong> ${paymentDetails?.accountName || 'Mohammed ishtiaq Ahmed Khan'}</div>
                <div><strong>Account No:</strong> ${paymentDetails?.accountNo || '36050100011339'}</div>
                ${paymentDetails?.ifscCode ? `<div><strong>IFSC Code:</strong> ${formatIfscHtml(paymentDetails.ifscCode)}</div>` : ''}
                ${paymentDetails?.mobile ? `<div><strong>Mobile no.</strong> ${paymentDetails.mobile}</div>` : ''}
                ${paymentDetails?.branch ? `<div><strong>Branch/Address:</strong> ${paymentDetails.branch}</div>` : ''}
              </div>

              ${cleanNotes ? `
                <div style="margin-top: 12px;">
                  <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 3px;">NOTE:</div>
                  <div style="font-size: 12px; color: #475569; white-space: pre-wrap;">${cleanNotes}</div>
                </div>
              ` : ''}
            </td>
            <td style="width: 45%; text-align: right; vertical-align: top; border: none; padding: 0;">
              <table style="width: 250px; margin-left: auto; border-collapse: collapse; border: none;">
                <tr>
                  <td style="padding: 5px 8px; font-size: 12px; color: #475569; text-align: right; border: none;">Sub Total:</td>
                  <td style="padding: 5px 8px; font-size: 12px; font-weight: 600; text-align: right; width: 100px; border: none;">${currencySymbol} ${subTotal}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 8px; font-size: 12px; color: #475569; text-align: right; border: none;">Tax / VAT:</td>
                  <td style="padding: 5px 8px; font-size: 12px; font-weight: 600; text-align: right; border: none;">${currencySymbol} ${vat}</td>
                </tr>
                <tr style="border-top: 1px solid #E2E8F0;">
                  <td style="padding: 8px 8px; font-size: 14px; font-weight: 700; color: #0F172A; text-align: right; border: none;">Total:</td>
                  <td style="padding: 8px 8px; font-size: 14px; font-weight: 700; color: #0F766E; text-align: right; border: none;">${currencySymbol} ${total}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>

      <!-- Footer Area (Thank you & Signature) -->
      <div style="width: 100%; margin-top: 28px; border-top: 1px dashed #E2E8F0; padding-top: 16px;">
        <table style="width: 100%; border-collapse: collapse; border: none;">
          <tr>
            <td style="vertical-align: bottom; border: none; padding: 0;">
              <div style="font-size: 13px; font-weight: 600; color: #475569; font-style: italic;">Thank you for your business!</div>
            </td>
            <td style="text-align: right; vertical-align: bottom; border: none; padding: 0;">
              <div style="display: inline-block; text-align: center; width: 180px;">
                ${signatureSrc ? `<img src="${signatureSrc}" alt="Authorized Signature" style="max-height: 55px; max-width: 170px; object-fit: contain; mix-blend-mode: multiply;" />` : ''}
                <div style="border-bottom: 1px solid #94A3B8; margin-top: 4px; margin-bottom: 4px;"></div>
                <div style="font-size: 11px; color: #64748B; font-weight: 500;">Authorized Signed</div>
              </div>
            </td>
          </tr>
        </table>
      </div>

    </div>
  `;
};

export const downloadInvoicePdf = async (invoiceData, filename = 'invoice.pdf') => {
  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  try {
    // 1. Preload images as base64 to eliminate CORS/delay issues
    const [logoBase64, signatureBase64] = await Promise.all([
      getBase64Image('/logo.png'),
      getBase64Image('/signature.png')
    ]);

    // 2. Generate exact A4 1-page HTML template
    const htmlContent = generateInvoiceHtml({
      ...invoiceData,
      logoSrc: logoBase64,
      signatureSrc: signatureBase64
    });

    // 3. Load html2pdf from CDN or window
    const html2pdf = await loadHtml2Pdf();

    // 4. PDF generation options ensuring exactly 1 single A4 page
    const opt = {
      margin: 0,
      filename: cleanFilename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 794,
        windowWidth: 794,
        scrollY: 0
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: { mode: ['avoid-all'] }
    };

    // 5. Generate PDF blob and download via saveAs for universal browser support
    try {
      const pdfBlob = await html2pdf().set(opt).from(htmlContent).output('blob');
      if (pdfBlob && pdfBlob.size > 0) {
        saveAs(pdfBlob, cleanFilename);
        return true;
      }
    } catch (outputErr) {
      console.warn('html2pdf output blob failed, attempting direct save():', outputErr);
    }

    // 6. Direct html2pdf save fallback
    await html2pdf().set(opt).from(htmlContent).save();
    return true;
  } catch (err) {
    console.warn('html2pdf download error, falling back to window.print():', err);
    window.print();
    return true;
  }
};
