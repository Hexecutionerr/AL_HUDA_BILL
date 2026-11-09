import * as api from '../api/index'
import { ADD_NEW_CLIENT, UPDATE_CLIENT, DELETE_CLIENT, FETCH_CLIENTS_BY_USER, FETCH_CLIENT, START_LOADING, END_LOADING } from './constants'
import { initialDemoClients } from '../utils/initialDemoData'

const getLocalClients = () => {
  try {
    const raw = localStorage.getItem('demo_clients');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("Failed to parse demo_clients:", e);
  }
  return initialDemoClients;
};

const saveLocalClients = (list) => {
  try {
    localStorage.setItem('demo_clients', JSON.stringify(list));
  } catch (e) {
    console.error("Failed to save demo_clients:", e);
  }
};

export const getClient = (id) => async (dispatch) => {
  try {
    dispatch({ type: START_LOADING });
    let client = null;

    try {
      const { data } = await api.fetchClient(id);
      if (data && typeof data === 'object') {
        client = data;
      }
    } catch (apiErr) {
      console.warn("Backend fetchClient unavailable, searching local store:", apiErr?.message || apiErr);
    }

    if (!client) {
      const list = getLocalClients();
      client = list.find((c) => String(c._id) === String(id));
    }

    if (client) {
      dispatch({ type: FETCH_CLIENT, payload: { client } });
    }
    dispatch({ type: END_LOADING });
  } catch (error) {
    console.error("getClient error:", error);
    dispatch({ type: END_LOADING });
  }
};

export const getClientsByUser = (searchQuery) => async (dispatch) => {
  try {
    dispatch({ type: START_LOADING });
    let payload = null;

    try {
      const res = await api.fetchClientsByUser(searchQuery);
      const rawData = res?.data?.data !== undefined ? res.data.data : res?.data;
      if (Array.isArray(rawData)) {
        payload = rawData;
      }
    } catch (apiErr) {
      console.warn("Backend fetchClientsByUser unavailable, using local store:", apiErr?.message || apiErr);
    }

    if (!payload) {
      payload = getLocalClients();
      saveLocalClients(payload);
    }

    dispatch({ type: FETCH_CLIENTS_BY_USER, payload });
    dispatch({ type: END_LOADING });
  } catch (error) {
    console.error("getClientsByUser catch fallback:", error);
    dispatch({ type: FETCH_CLIENTS_BY_USER, payload: getLocalClients() });
    dispatch({ type: END_LOADING });
  }
};

export const createClient = (client, openSnackbar) => async (dispatch) => {
  try {
    let created = null;

    try {
      const { data } = await api.addClient(client);
      if (data && typeof data === 'object' && data._id) {
        created = data;
      }
    } catch (apiErr) {
      console.warn("Backend addClient unavailable, creating locally:", apiErr?.message || apiErr);
    }

    if (!created) {
      created = {
        ...client,
        _id: 'cli_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        createdAt: new Date().toISOString()
      };
      const list = getLocalClients();
      list.push(created);
      saveLocalClients(list);
    }

    dispatch({ type: ADD_NEW_CLIENT, payload: created });
    if (openSnackbar) {
      openSnackbar("Customer added successfully");
    }
    return created;
  } catch (error) {
    console.error("createClient error:", error);
  }
};

export const updateClient = (id, client, openSnackbar) => async (dispatch) => {
  try {
    let updated = null;

    try {
      const { data } = await api.updateClient(id, client);
      if (data && typeof data === 'object') {
        updated = data;
      }
    } catch (apiErr) {
      console.warn("Backend updateClient unavailable, updating locally:", apiErr?.message || apiErr);
    }

    if (!updated) {
      updated = { ...client, _id: id };
      const list = getLocalClients().map((c) => (String(c._id) === String(id) ? { ...c, ...client } : c));
      saveLocalClients(list);
    }

    dispatch({ type: UPDATE_CLIENT, payload: updated });
    if (openSnackbar) {
      openSnackbar("Customer updated successfully");
    }
  } catch (error) {
    console.error("updateClient error:", error);
  }
};

export const deleteClient = (id, openSnackbar) => async (dispatch) => {
  try {
    try {
      await api.deleteClient(id);
    } catch (apiErr) {
      console.warn("Backend deleteClient unavailable, deleting locally:", apiErr?.message || apiErr);
    }

    const list = getLocalClients().filter((c) => String(c._id) !== String(id));
    saveLocalClients(list);

    dispatch({ type: DELETE_CLIENT, payload: id });
    if (openSnackbar) {
      openSnackbar("Customer deleted successfully");
    }
  } catch (error) {
    console.error("deleteClient error:", error);
  }
};