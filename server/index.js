//Copyright (c) 2026 Hasnain Khan

import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import pdf from 'html-pdf'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import invoiceRoutes from './routes/invoices.js'
import clientRoutes from './routes/clients.js'
import userRoutes from './routes/userRoutes.js'

import profile from './routes/profile.js'
import pdfTemplate from './documents/index.js'
// import invoiceTemplate from './documents/invoice.js'
import emailTemplate from './documents/email.js'

const app = express()
dotenv.config()

app.use((express.json({ limit: "30mb", extended: true})))
app.use((express.urlencoded({ limit: "30mb", extended: true})))
app.use((cors()))

app.use('/invoices', invoiceRoutes)
app.use('/clients', clientRoutes)
app.use('/users', userRoutes)
app.use('/profiles', profile)

// NODEMAILER TRANSPORT FOR SENDING INVOICE VIA EMAIL
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port : process.env.SMTP_PORT,
    auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
    },
    tls:{
        rejectUnauthorized:false
    }
})


var options = { format: 'A4' };
//SEND PDF INVOICE VIA EMAIL
app.post('/send-pdf', (req, res) => {
    const { email, company } = req.body

    let htmlContent;
    try {
        htmlContent = pdfTemplate(req.body);
    } catch(templateErr) {
        console.error('PDF template error:', templateErr);
        return res.status(500).json({ error: 'Template error: ' + templateErr.message });
    }

    pdf.create(htmlContent, options).toFile('invoice.pdf', (err) => {
        if(err) {
            console.error('PDF creation error:', err);
            return res.status(500).json({ error: err.message });
        }
       
        // send mail with defined transport object and callback to prevent unhandled rejection crashes
        transporter.sendMail({
            from: ` AL Huda Textiles <alhudatextiless@gmail.com>`, // sender address
            to: `${email}`, // list of receivers
            replyTo: `${company?.email || ''}`,
            subject: `Invoice from ${company?.businessName ? company.businessName : (company?.name || '')}`, // Subject line
            text: `Invoice from ${company?.businessName ? company.businessName : (company?.name || '')}`, // plain text body
            html: emailTemplate(req.body), // html body
            attachments: [{
                filename: 'invoice.pdf',
                path: `${__dirname}/invoice.pdf`
            }]
        }, (mailErr, info) => {
            if (mailErr) {
                console.error("Mail send error:", mailErr);
                return res.status(500).json({ error: "Failed to send email: " + mailErr.message });
            }
            res.json({ success: true });
        });
    });
});


//Problems downloading and sending invoice
// npm install html-pdf -g
// npm link html-pdf
// npm link phantomjs-prebuilt

//CREATE AND SEND PDF INVOICE
app.post('/create-pdf', (req, res) => {
    let htmlContent;
    try {
        htmlContent = pdfTemplate(req.body);
    } catch(templateErr) {
        console.error('PDF template error:', templateErr);
        return res.status(500).json({ error: 'Template error: ' + templateErr.message });
    }
    pdf.create(htmlContent, { format: 'A4' }).toFile('invoice.pdf', (err) => {
        if(err) {
            console.error('PDF creation error:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

// DOWNLOAD PDF IN ONE REQUEST (avoids UUID filename issue in Chrome)
app.post('/download-pdf', (req, res) => {
    let htmlContent;
    try {
        htmlContent = pdfTemplate(req.body);
    } catch(templateErr) {
        console.error('PDF template error:', templateErr);
        return res.status(500).json({ error: 'Template error: ' + templateErr.message });
    }
    const filename = req.body.id ? `invoice_${req.body.id}.pdf` : 'invoice.pdf';
    pdf.create(htmlContent, { format: 'A4' }).toBuffer((err, buffer) => {
        if(err) {
            console.error('PDF buffer error:', err);
            return res.status(500).json({ error: err.message });
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);
    });
});

//SEND PDF INVOICE
app.get('/fetch-pdf', (req, res) => {
     res.sendFile(`${__dirname}/invoice.pdf`)
})



app.get('/', (req, res) => {
    res.send('SERVER IS RUNNING')
  })

const DB_URL = process.env.DB_URL
const PORT = process.env.PORT || 5000

mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => app.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
    .catch((error) => console.log(error.message))

mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

