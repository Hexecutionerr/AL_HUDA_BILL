import { FETCH_PROFILES, CREATE_PROFILE, FETCH_PROFILES_BY_USER, UPDATE_PROFILE, DELETE_PROFILE, FETCH_PROFILE_BY_USER, START_LOADING, END_LOADING, FETCH_PROFILE } from '../actions/constants';

const initialState = { isLoading: true, profiles: [] };

const profilesReducer = (state = initialState, action) => {
  switch (action.type) {
    case START_LOADING:
      return {...state, isLoading: true };
    case END_LOADING:
      return {...state, isLoading: false };
    case FETCH_PROFILES:
      return {
        ...state,
        profiles: Array.isArray(action.payload) ? action.payload : []
      };
    case FETCH_PROFILES_BY_USER:
      return {
        ...state,
        profiles: Array.isArray(action?.payload?.data)
          ? action.payload.data
          : (Array.isArray(action?.payload) ? action.payload : [])
      };
      
    case FETCH_PROFILE_BY_USER:
      return {
        ...state,
        profiles: action.payload !== undefined ? action.payload : (state.profiles || [])
      };
    case FETCH_PROFILE:
      return {...state, profile: action.payload };
    
    case CREATE_PROFILE: {
      const current = Array.isArray(state.profiles) ? state.profiles : [];
      return {...state, profiles: [...current, action.payload]};
    }
    case UPDATE_PROFILE:
      if (Array.isArray(state.profiles)) {
        return {...state, profiles: state.profiles.map((profile) => (profile._id === action?.payload?._id ? action.payload : profile))};
      }
      return {...state, profiles: action.payload};
    case DELETE_PROFILE: {
      const current = Array.isArray(state.profiles) ? state.profiles : [];
      return {...state, profiles: current.filter((profile) => profile._id !== action.payload)};
    }
    default:
      return {
        ...state,
        profiles: state.profiles !== undefined ? state.profiles : []
      };
  }
};

export default profilesReducer;
