import express from 'express'
import mongoose from 'mongoose'

const ClientSchema = mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    address: String,
    userId: [String],
    companyName: String,
    contactPerson: String,
    country: String,
    whatsapp: String,
    currency: String,
    paymentTerms: String,
    taxNumber: String,
    notes: String,
    tags: [String],
    gst: String,
    iec: String,
    tradeLicense: String,
    logo: String,
    createdAt: {
        type: Date,
        default: new Date()
    }
})

const ClientModel = mongoose.model('ClientModel', ClientSchema)
export default ClientModel