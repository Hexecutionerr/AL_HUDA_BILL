import { FETCH_PROFILES, FETCH_PROFILES_BY_USER, CREATE_PROFILE, UPDATE_PROFILE, DELETE_PROFILE, FETCH_PROFILE_BY_USER, START_LOADING, END_LOADING, FETCH_PROFILE } from './constants';
import * as api from '../api/index.js';
import { initialDemoProfile } from '../utils/initialDemoData';

const getLocalProfile = () => {
  try {
    const raw = localStorage.getItem('profileDetail');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) return parsed;
    }
  } catch (e) {
    console.warn("Failed to parse profileDetail:", e);
  }
  return initialDemoProfile;
};

const saveLocalProfile = (profile) => {
  try {
    localStorage.setItem('profileDetail', JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profileDetail:", e);
  }
};

export const getProfile = (id) => async (dispatch) => {
  try {
    let profile = null;
    try {
      const { data } = await api.fetchProfile(id);
      if (data && typeof data === 'object') profile = data;
    } catch (apiErr) {
      console.warn("Backend fetchProfile unavailable:", apiErr?.message || apiErr);
    }

    if (!profile) {
      profile = getLocalProfile();
    }

    dispatch({ type: FETCH_PROFILE, payload: profile });
  } catch (error) {
    console.error("getProfile error:", error);
  }
};

export const getProfiles = () => async (dispatch) => {
  try {
    dispatch({ type: START_LOADING });
    let data = null;
    try {
      const res = await api.fetchProfiles();
      if (Array.isArray(res?.data)) data = res.data;
    } catch (apiErr) {
      console.warn("Backend fetchProfiles unavailable:", apiErr?.message || apiErr);
    }

    if (!data) {
      data = [getLocalProfile()];
    }

    dispatch({ type: FETCH_PROFILES, payload: data });
    dispatch({ type: END_LOADING });
  } catch (error) {
    console.error("getProfiles error:", error);
    dispatch({ type: END_LOADING });
  }
};

export const getProfilesByUser = (searchQuery) => async (dispatch) => {
  try {
    dispatch({ type: START_LOADING });
    let payload = null;

    try {
      const res = await api.fetchProfilesByUser(searchQuery);
      const rawData = res?.data?.data !== undefined ? res.data.data : res?.data;
      if (Array.isArray(rawData)) {
        payload = rawData;
      }
    } catch (apiErr) {
      console.warn("Backend fetchProfilesByUser unavailable:", apiErr?.message || apiErr);
    }

    if (!payload || payload.length === 0) {
      payload = [getLocalProfile()];
    }

    dispatch({ type: FETCH_PROFILE_BY_USER, payload });
    dispatch({ type: END_LOADING });
  } catch (error) {
    console.error("getProfilesByUser error:", error);
    dispatch({ type: FETCH_PROFILE_BY_USER, payload: [getLocalProfile()] });
    dispatch({ type: END_LOADING });
  }
};

export const getProfilesBySearch = (searchQuery) => async (dispatch) => {
  try {
    dispatch({ type: START_LOADING });
    let payload = null;

    try {
      const res = await api.fetchProfilesBySearch(searchQuery);
      const rawData = res?.data?.data !== undefined ? res.data.data : res?.data;
      if (Array.isArray(rawData)) {
        payload = rawData;
      }
    } catch (apiErr) {
      console.warn("Backend fetchProfilesBySearch unavailable:", apiErr?.message || apiErr);
    }

    if (!payload) {
      payload = [getLocalProfile()];
    }

    dispatch({ type: FETCH_PROFILES_BY_USER, payload: { data: payload } });
    dispatch({ type: END_LOADING });
  } catch (error) {
    console.error("getProfilesBySearch error:", error);
    dispatch({ type: END_LOADING });
  }
};

export const createProfile = (profile, history) => async (dispatch) => {
  try {
    let created = null;

    try {
      const { data } = await api.createProfile(profile);
      if (data && typeof data === 'object') created = data;
    } catch (apiErr) {
      console.warn("Backend createProfile unavailable, creating locally:", apiErr?.message || apiErr);
    }

    if (!created) {
      created = { ...profile, _id: 'prof_' + Date.now().toString(36) };
      saveLocalProfile(created);
    }

    dispatch({ type: CREATE_PROFILE, payload: created });
  } catch (error) {
    console.error("createProfile error:", error);
  }
};

export const updateProfile = (id, form, openSnackbar) => async (dispatch) => {
  try {
    let updated = null;

    try {
      const { data } = await api.updateProfile(id, form);
      if (data && typeof data === 'object') updated = data;
    } catch (apiErr) {
      console.warn("Backend updateProfile unavailable, updating locally:", apiErr?.message || apiErr);
    }

    if (!updated) {
      updated = { ...form, _id: id };
      saveLocalProfile(updated);
    }

    dispatch({ type: UPDATE_PROFILE, payload: updated });
    if (openSnackbar) {
      openSnackbar("Profile updated successfully");
    }
  } catch (error) {
    console.error("updateProfile error:", error);
  }
};

export const deleteProfile = (id) => async (dispatch) => {
  try {
    try {
      await api.deleteProfile(id);
    } catch (apiErr) {
      console.warn("Backend deleteProfile unavailable:", apiErr?.message || apiErr);
    }

    dispatch({ type: DELETE_PROFILE, payload: id });
  } catch (error) {
    console.error("deleteProfile error:", error);
  }
};
