import * as api from '../api/index'
import { ADD_NEW, UPDATE, DELETE, GET_INVOICE, FETCH_INVOICE_BY_USER, START_LOADING, END_LOADING } from './constants'
import { initialDemoInvoices } from '../utils/initialDemoData'

const getLocalInvoices = () => {
  try {
    const raw = localStorage.getItem('demo_invoices');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("Failed to parse demo_invoices:", e);
  }
  return initialDemoInvoices;
};

const saveLocalInvoices = (list) => {
  try {
    localStorage.setItem('demo_invoices', JSON.stringify(list));
  } catch (e) {
    console.error("Failed to save demo_invoices:", e);
  }
};

export const getInvoicesByUser = (searchQuery) => async (dispatch) => {
  try {
    dispatch({ type: START_LOADING });
    let payload = null;

    try {
      const res = await api.fetchInvoicesByUser(searchQuery);
      // Validate that response is JSON and not HTML string from SPA rewrite
      const rawData = res?.data?.data !== undefined ? res.data.data : res?.data;
      if (Array.isArray(rawData)) {
        payload = rawData;
      }
    } catch (apiErr) {
      console.warn("Backend fetchInvoicesByUser unavailable, using local store:", apiErr?.message || apiErr);
    }

    if (!payload) {
      payload = getLocalInvoices();
      saveLocalInvoices(payload);
    }

    dispatch({ type: FETCH_INVOICE_BY_USER, payload });
    dispatch({ type: END_LOADING });
  } catch (error) {
    console.error("getInvoicesByUser catch fallback:", error);
    dispatch({ type: FETCH_INVOICE_BY_USER, payload: getLocalInvoices() });
    dispatch({ type: END_LOADING });
  }
};

export const getInvoice = (id) => async (dispatch) => {
  const user = JSON.parse(localStorage.getItem('profile'));

  try {
    let invoiceData = null;

    try {
      const { data } = await api.fetchInvoice(id);
      if (data && typeof data === 'object' && data._id) {
        let businessDetails = null;
        try {
          businessDetails = await api.fetchProfilesByUser({ search: user?.result?._id || user?.result?.googleId });
        } catch (_) {}
        invoiceData = { ...data, businessDetails };
      }
    } catch (apiErr) {
      console.warn("Backend fetchInvoice unavailable, searching local store:", apiErr?.message || apiErr);
    }

    if (!invoiceData) {
      const list = getLocalInvoices();
      const found = list.find((inv) => String(inv._id) === String(id) || String(inv.invoiceNumber) === String(id));
      if (found) {
        const profileDetail = JSON.parse(localStorage.getItem('profileDetail') || '{}');
        invoiceData = { ...found, businessDetails: profileDetail };
      }
    }

    if (invoiceData) {
      dispatch({ type: GET_INVOICE, payload: invoiceData });
    }
  } catch (error) {
    console.error("getInvoice error:", error);
  }
};

export const createInvoice = (invoice, history) => async (dispatch) => {
  try {
    dispatch({ type: START_LOADING });
    let created = null;

    try {
      const { data } = await api.addInvoice(invoice);
      if (data && typeof data === 'object' && data._id) {
        created = data;
      }
    } catch (apiErr) {
      console.warn("Backend addInvoice unavailable, creating locally:", apiErr?.message || apiErr);
    }

    if (!created) {
      created = {
        ...invoice,
        _id: 'inv_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        createdAt: invoice.createdAt || new Date().toISOString()
      };
      const list = getLocalInvoices();
      list.push(created);
      saveLocalInvoices(list);
    }

    dispatch({ type: ADD_NEW, payload: created });
    if (history) {
      history.push(`/invoice/${created._id}`);
    }
    dispatch({ type: END_LOADING });
  } catch (error) {
    console.error("createInvoice error:", error);
    dispatch({ type: END_LOADING });
  }
};

export const updateInvoice = (id, invoice) => async (dispatch) => {
  try {
    let updated = null;

    try {
      const { data } = await api.updateInvoice(id, invoice);
      if (data && typeof data === 'object') {
        updated = data;
      }
    } catch (apiErr) {
      console.warn("Backend updateInvoice unavailable, updating locally:", apiErr?.message || apiErr);
    }

    if (!updated) {
      updated = { ...invoice, _id: id };
      const list = getLocalInvoices().map((inv) => (String(inv._id) === String(id) ? { ...inv, ...invoice } : inv));
      saveLocalInvoices(list);
    }

    dispatch({ type: UPDATE, payload: updated });
  } catch (error) {
    console.error("updateInvoice error:", error);
  }
};

export const deleteInvoice = (id, openSnackbar) => async (dispatch) => {
  try {
    try {
      await api.deleteInvoice(id);
    } catch (apiErr) {
      console.warn("Backend deleteInvoice unavailable, deleting locally:", apiErr?.message || apiErr);
    }

    const list = getLocalInvoices().filter((inv) => String(inv._id) !== String(id));
    saveLocalInvoices(list);

    dispatch({ type: DELETE, payload: id });
    if (openSnackbar) {
      openSnackbar("Invoice deleted successfully");
    }
  } catch (error) {
    console.error("deleteInvoice error:", error);
  }
};