// Initial demo fixtures for AL HUDA BILL (Al Huda Textiles)

export const initialDemoInvoices = [
  {
    _id: "inv_demo_001",
    invoiceNumber: "1001",
    creator: ["demo_admin_user_id"],
    client: {
      name: "Gulf Garments LLC",
      companyName: "Gulf Garments LLC",
      email: "contact@gulfgarments.ae",
      phone: "+971 50 123 4567",
      address: "Deira Commercial Tower, Dubai, UAE",
      country: "United Arab Emirates"
    },
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    items: [
      { itemName: "Cotton Fabric Rolls (100m)", unitPrice: 850, quantity: 100, discount: 0 },
      { itemName: "Silk Embroidered Textiles", unitPrice: 2000, quantity: 50, discount: 0 }
    ],
    currency: "INR",
    vat: 5,
    subTotal: 185000,
    total: 185000,
    totalAmountReceived: 185000,
    status: "Paid",
    notes: "Full payment received via bank transfer. Thank you for your business.",
    paymentRecords: [
      {
        _id: "pay_demo_001",
        amountPaid: 185000,
        datePaid: new Date(Date.now() - 2 * 86400000).toISOString(),
        paymentMethod: "Bank Transfer",
        note: "Settled in full via Emirates NBD transfer",
        paidBy: "Gulf Garments LLC"
      }
    ]
  },
  {
    _id: "inv_demo_002",
    invoiceNumber: "1002",
    creator: ["demo_admin_user_id"],
    client: {
      name: "Surat Silk Mills",
      companyName: "Surat Silk Mills Pvt Ltd",
      email: "orders@suratsilk.in",
      phone: "+91 98251 12345",
      address: "Ring Road Textile Market, Surat, Gujarat",
      country: "India"
    },
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    items: [
      { itemName: "Premium Yarn Spools (50kg)", unitPrice: 1500, quantity: 30, discount: 0 },
      { itemName: "Chiffon Fabrics (Printed)", unitPrice: 1000, quantity: 50, discount: 0 }
    ],
    currency: "INR",
    vat: 5,
    subTotal: 95000,
    total: 95000,
    totalAmountReceived: 45000,
    status: "Partial",
    notes: "Advance of ₹45,000 received. Balance due upon delivery.",
    paymentRecords: [
      {
        _id: "pay_demo_002",
        amountPaid: 45000,
        datePaid: new Date(Date.now() - 8 * 86400000).toISOString(),
        paymentMethod: "UPI / NEFT",
        note: "Advance payment received",
        paidBy: "Surat Silk Mills"
      }
    ]
  },
  {
    _id: "inv_demo_003",
    invoiceNumber: "1003",
    creator: ["demo_admin_user_id"],
    client: {
      name: "London Fabric Traders",
      companyName: "London Fabric Traders Ltd",
      email: "info@londonfabrics.co.uk",
      phone: "+44 20 7946 0912",
      address: "Whitechapel High St, London, UK",
      country: "United Kingdom"
    },
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    items: [
      { itemName: "Georgette Fabric Bolts", unitPrice: 1200, quantity: 150, discount: 0 },
      { itemName: "Linen Blend Weaves", unitPrice: 1000, quantity: 60, discount: 0 }
    ],
    currency: "INR",
    vat: 0,
    subTotal: 240000,
    total: 240000,
    totalAmountReceived: 0,
    status: "Unpaid",
    notes: "Export order. Payment due within 15 days of shipment.",
    paymentRecords: []
  }
];

export const initialDemoClients = [
  {
    _id: "cli_demo_001",
    name: "Gulf Garments LLC",
    companyName: "Gulf Garments LLC",
    email: "contact@gulfgarments.ae",
    phone: "+971 50 123 4567",
    whatsapp: "+971 50 123 4567",
    address: "Deira Commercial Tower, Dubai, UAE",
    country: "United Arab Emirates",
    currency: "INR",
    paymentTerms: "Net 15",
    userId: ["demo_admin_user_id"],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    _id: "cli_demo_002",
    name: "Surat Silk Mills",
    companyName: "Surat Silk Mills Pvt Ltd",
    email: "orders@suratsilk.in",
    phone: "+91 98251 12345",
    whatsapp: "+91 98251 12345",
    address: "Ring Road Textile Market, Surat, Gujarat",
    country: "India",
    currency: "INR",
    paymentTerms: "Advance 50%",
    userId: ["demo_admin_user_id"],
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    _id: "cli_demo_003",
    name: "London Fabric Traders",
    companyName: "London Fabric Traders Ltd",
    email: "info@londonfabrics.co.uk",
    phone: "+44 20 7946 0912",
    whatsapp: "+44 20 7946 0912",
    address: "Whitechapel High St, London, UK",
    country: "United Kingdom",
    currency: "INR",
    paymentTerms: "Net 30",
    userId: ["demo_admin_user_id"],
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString()
  },
  {
    _id: "cli_demo_004",
    name: "Royal Textile Co",
    companyName: "Royal Textile Co",
    email: "purchase@royaltextiles.sa",
    phone: "+966 50 987 6543",
    whatsapp: "+966 50 987 6543",
    address: "Olaya St, Riyadh, Saudi Arabia",
    country: "Saudi Arabia",
    currency: "INR",
    paymentTerms: "Advance",
    userId: ["demo_admin_user_id"],
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
  }
];

export const initialDemoProfile = {
  _id: "demo_profile_id",
  name: "Hasnain Khan",
  email: "demo_admin@alhudatextiles.com",
  phoneNumber: "+91 98765 43210",
  businessName: "Al Huda Textiles",
  contactAddress: "Surat, Gujarat, India",
  logo: "",
  website: "https://alhudatextiles.com",
  userId: ["demo_admin_user_id"],
  paymentDetails: JSON.stringify({
    bankName: "State Bank of India",
    accountName: "Al Huda Textiles",
    accountNo: "123456789012",
    ifscCode: "SBIN0001234",
    mobile: "+91 98765 43210",
    branch: "Textile Market Branch, Surat"
  })
};
