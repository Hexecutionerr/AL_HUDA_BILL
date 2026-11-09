import axios from 'axios'

// In local development, REACT_APP_API is 'http://localhost:5000' (from client/.env)
// In production on Vercel, default to '/api' so all requests route cleanly to the backend service
const baseURL = process.env.REACT_APP_API !== undefined ? process.env.REACT_APP_API : '/api'
const API = axios.create({ baseURL })

API.interceptors.request.use((req) => {
    if(localStorage.getItem('profile')) {
        try {
            const profile = JSON.parse(localStorage.getItem('profile'))
            if (profile?.token) {
                req.headers.authorization = `Bearer ${profile.token}`
            }
        } catch (e) {
            console.error("Auth header parse error:", e)
        }
    }

    return req
})

API.interceptors.response.use(
    (res) => {
        // If the response is an HTML page (from SPA fallback rewrite), reject it as an API error
        if (typeof res?.data === 'string' && (res.data.trim().toLowerCase().startsWith('<!doctype html') || res.data.trim().toLowerCase().startsWith('<html'))) {
            return Promise.reject(new Error("API endpoint returned HTML (backend not connected)"));
        }
        return res;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Invoices
export const fetchInvoice =(id) => API.get(`/invoices/${id}`)
export const addInvoice =( invoice ) => API.post('/invoices', invoice)
export const updateInvoice = (id, updatedInvoice) => API.patch(`/invoices/${id}`, updatedInvoice)
export const deleteInvoice =(id) => API.delete(`/invoices/${id}`)
export const fetchInvoicesByUser = (searchQuery) => API.get(`/invoices?searchQuery=${searchQuery.search}`);
export const getTotalCount = (searchQuery) => API.get(`/invoices/count?searchQuery=${searchQuery}`);

// Clients
export const fetchClient = (id) => API.get(`/clients/${id}`);
export const fetchClients = (page) => API.get(`/clients?page=${page}`);
export const addClient =( client ) => API.post('/clients', client)
export const updateClient = (id, updatedClient) => API.patch(`/clients/${id}`, updatedClient)
export const deleteClient =(id) => API.delete(`/clients/${id}`)
export const fetchClientsByUser = (searchQuery) => API.get(`/clients/user?searchQuery=${searchQuery.search}`);

// Users & Auth
export const signIn =(formData)=> API.post('/users/signin', formData)
export const signUp =(formData)=> API.post('/users/signup', formData)
export const forgot = (formData) => API.post('/users/forgot', formData);
export const reset = (formData) => API.post('/users/reset', formData);

// Profiles
export const fetchProfilesBySearch = (searchQuery) => API.get(`/profiles/search?searchQuery=${searchQuery.search || searchQuery.year || 'none'}`);
export const fetchProfile = (id) => API.get(`/profiles/${id}`)
export const fetchProfiles = () => API.get('/profiles');
export const fetchProfilesByUser = (searchQuery) => API.get(`/profiles?searchQuery=${searchQuery.search}`)
export const createProfile = (newProfile) => API.post('/profiles', newProfile);
export const updateProfile = (id, updatedProfile) => API.patch(`/profiles/${id}`, updatedProfile);
export const deleteProfile = (id) => API.delete(`/profiles/${id}`);

// PDF endpoints
export const createPdf = (pdfData) => API.post('/create-pdf', pdfData);
export const fetchPdf = () => API.get('/fetch-pdf', { responseType: 'blob' });
export const downloadPdf = (invoiceData) => API.post('/download-pdf', invoiceData, { responseType: 'blob' });
export const sendPdf = (emailData) => API.post('/send-pdf', emailData);

export default API;