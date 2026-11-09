import { generateInvoiceHtml } from './generateInvoiceHtml';

const getBase64FromUrl = async (url) => {
  if (!url) return '';
  if (url.startsWith('data:')) return url;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
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

const ensureHtml2Pdf = () => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.html2pdf) {
      return resolve(window.html2pdf);
    }

    const script = document.createElement('script');
    script.id = 'html2pdf-fallback-loader';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.async = true;
    script.onload = () => {
      if (window.html2pdf) {
        resolve(window.html2pdf);
      } else {
        reject(new Error('html2pdf loaded but not found on window'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load html2pdf'));
    document.body.appendChild(script);
  });
};

export const downloadInvoicePdf = async (invoiceData) => {
  if (!invoiceData) {
    throw new Error('Invoice data is missing');
  }

  // Pre-load images as base64 to ensure instant 100% rendering fidelity
  const [logoBase64, signatureBase64] = await Promise.all([
    getBase64FromUrl(invoiceData.company?.logo || '/logo.png'),
    getBase64FromUrl('/signature.png')
  ]);

  const htmlContent = generateInvoiceHtml({
    ...invoiceData,
    logoSrc: logoBase64 || '/logo.png',
    signatureSrc: signatureBase64 || '/signature.png'
  });

  const printWrapper = document.createElement('div');
  printWrapper.id = 'pdf-render-wrapper';
  printWrapper.style.position = 'fixed';
  printWrapper.style.left = '-9999px';
  printWrapper.style.top = '0';
  printWrapper.style.width = '750px';
  printWrapper.style.zIndex = '-9999';
  printWrapper.style.backgroundColor = '#FFFFFF';
  printWrapper.style.opacity = '1';
  printWrapper.style.pointerEvents = 'none';
  printWrapper.innerHTML = htmlContent;
  document.body.appendChild(printWrapper);

  const cleanFilename = `invoice_${invoiceData.id || 'bill'}.pdf`;

  try {
    const html2pdf = await ensureHtml2Pdf();
    const opt = {
      margin: [6, 6, 6, 6],
      filename: cleanFilename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
        scrollX: 0
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    };

    await html2pdf().set(opt).from(printWrapper.firstElementChild || printWrapper).save();
    return true;
  } catch (err) {
    console.error('Browser PDF generation failed, attempting iframe print:', err);
    // Print fallback via isolated iframe if html2pdf fails
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    iframe.contentDocument.write(htmlContent);
    iframe.contentDocument.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => iframe.remove(), 2000);
    return true;
  } finally {
    if (printWrapper && printWrapper.parentNode) {
      printWrapper.parentNode.removeChild(printWrapper);
    }
  }
};
