// Dynamic browser-side PDF generator using html2pdf CDN with fallback to print

const loadHtml2Pdf = () => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.html2pdf) {
      return resolve(window.html2pdf);
    }

    const existing = document.getElementById('html2pdf-cdn-script');
    if (existing) {
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

export const downloadInvoicePdfFromElement = async (element, filename = 'invoice.pdf') => {
  if (!element) {
    throw new Error('Invoice element not found');
  }

  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  try {
    const html2pdf = await loadHtml2Pdf();
    const opt = {
      margin: [8, 8, 8, 8],
      filename: cleanFilename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    };

    await html2pdf().set(opt).from(element).save();
    return true;
  } catch (err) {
    console.warn('CDN html2pdf failed, falling back to window.print():', err);
    window.print();
    return true;
  }
};
