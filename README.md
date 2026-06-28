# AL Huda - Modern MERN Stack Invoicing Application

A highly polished, premium, and functional MERN stack (MongoDB, Express, React, Node.js) invoicing application specially optimized for businesses. Easily create, customize, download, and track invoices, customers, and payments.

---

## 👨‍💻 Author

**Hasnain Khan**  
*Lead Developer & Architect*

- [GitHub](https://github.com/Hexecutionerr)
- [LinkedIn](https://www.linkedin.com/in/hasnain-khan-0ab3b2320)

---

## 🌟 Key Features & Customizations

### 📊 Redesigned Dashboard & Revenue Metrics
- **Premium Cards Grid**: 8 clean status/KPI metrics cards indicating payments received, pending amounts, paid/unpaid invoice counts, and overdue indicators with dynamic color gradients.
- **Invoices Awaiting Payment Section**: Lists all Unpaid and Partially Paid invoices directly on the Dashboard.
- **Instant Record Payment Modal**: Allows you to record payments for any awaiting invoice directly from the dashboard, automatically recalculating balance values and updating statuses.
- **Recent Payment Activities Feed**: Dynamic list showing recent payment records, complete with customer initials avatars, amount indicators, and payment method badges.
- **Interactive Navigation**: Clickable stats cards and awaiting invoice rows that direct you straight to corresponding list or detail views.

### 🧾 Invoices Management & Modern Table View
- **Modernized Invoices Page**: Replaced standard table UI with a beautiful custom card-based list layout.
- **Status Filter & Search**: Search bar to query by invoice number or customer name, and a status dropdown filter (All, Paid, Unpaid, Partial).
- **Dot Badge Indicators**: Clean badge pills (🟢 Paid, 🔴 Unpaid, 🔵 Partial) for instant status tracking.
- **Overdue Reminders**: Automatic red highlight warning tag if the invoice has passed its due date.

### ⚙️ Business Profile Settings
- **Dual-Card Settings Dashboard**: Separate sections for *Business Details* and *Payment/Bank Details*.
- **Integrated Base64 Image Uploader**: Allows uploading business logos with live banner preview. The frontend automatically resizes and compresses logos using canvas to keep database payloads lightweight (under 20KB) and make PDF generation faster.
- **Structured Bank Details Form**: Split legacy payment text blobs into structured fields (Bank Name, Account Holder Name, Account Number, IFSC Code, Mobile/UPI, and Branch).

### 🧾 Invoice Detail Views & Faster PDF Exports
- **Slide-in Navigation Drawer**: Standard sidebar is completely hidden by default and smoothly slides in on hover from the left edge of the screen, preserving desktop workspace.
- **One-Step Direct PDF Downloads**: Fixed browser context UUID downloads. The app now generates and streams invoice PDFs in a single call with correct filenames directly using browser content-disposition headers.
- **SMTP Nodemailer Crash Protection**: Backend includes try-catch blocks and error callbacks to ensure that invalid mail credentials do not crash the running Node.js server.

---

## 🚀 Technologies Used

### Frontend (Client)
- **React.js** & **Redux** (State management)
- **React-router-dom** (Client routing)
- **Axios** (API requests)
- **CSS Modules** (Modular styling with zero Material UI tables)
- **React Simple Snackbar** (Notifications)
- **Moment.js** (Date formatting and relative offsets)

### Backend (Server)
- **Express.js** & **Node.js**
- **Mongoose** (MongoDB Object Modeling)
- **html-pdf** (Headless WebKit PhantomJS engine for PDF renders)
- **Nodemailer** (Email notifications)

---

## 🛠️ Configuration and Setup

### Prerequisites
- Node.js installed
- MongoDB running locally or a MongoDB Atlas connection URI

### Client (.env)
Create a `.env` file under `client/` and supply:
```env
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_API=http://localhost:5000
REACT_APP_URL=http://localhost:3001
```

```bash
cd client
npm install
npm start
```

### Server (.env)
Create a `.env` file under `server/` and supply:
```env
DB_URL=mongodb://127.0.0.1:27017/accountill
PORT=5000
SECRET=your_jwt_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

```bash
cd server
npm install
npm run dev
```

---

## 🐳 Docker Deployment

To build and run in production using Docker Compose:
```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE.md).