
import { ALL_CLIENTS, ADD_NEW_CLIENT, UPDATE_CLIENT, DELETE_CLIENT, FETCH_CLIENTS_BY_USER, FETCH_CLIENT, START_LOADING, END_LOADING } from '../actions/constants'

const initialState = {
  isLoading: true,
  clients: []
};

const clients = (state = initialState, action) => {
  switch (action.type) {
    case START_LOADING:
      return { ...state, isLoading: true };
    case END_LOADING:
      return { ...state, isLoading: false };
    case ALL_CLIENTS:
      return {
        ...state,
        clients: Array.isArray(action?.payload?.data)
          ? action.payload.data
          : (Array.isArray(action?.payload) ? action.payload : []),
        currentPage: action?.payload?.currentPage,
        numberOfPages: action?.payload?.numberOfPages,
      };
    case FETCH_CLIENTS_BY_USER: {
      const payloadClients = Array.isArray(action.payload)
        ? action.payload
        : (Array.isArray(action?.payload?.data) ? action.payload.data : null);
      return {
        ...state,
        clients: payloadClients !== null ? payloadClients : (Array.isArray(state.clients) ? state.clients : [])
      };
    }
    case FETCH_CLIENT:
      return { ...state, client: action?.payload?.client };
    case ADD_NEW_CLIENT: {
      const currentClients = Array.isArray(state.clients) ? state.clients : [];
      return { ...state, clients: [...currentClients, action.payload] };
    }
    case UPDATE_CLIENT: {
      const currentClients = Array.isArray(state.clients) ? state.clients : [];
      return {
        ...state,
        clients: currentClients.map((client) =>
          client?._id === action?.payload?._id ? action.payload : client
        )
      };
    }
    case DELETE_CLIENT: {
      const currentClients = Array.isArray(state.clients) ? state.clients : [];
      return {
        ...state,
        clients: currentClients.filter((client) => client?._id !== action.payload)
      };
    }
    default:
      return {
        ...state,
        clients: Array.isArray(state?.clients) ? state.clients : []
      };
  }
};

export default clients;




//   const clients =(clients =[], action) => {
//     switch (action.type) {
//         case ALL_CLIENTS:
//             return action.payload

//         case FETCH_CLIENTS_BY_USER:
//             return action.payload

//         case ADD_NEW_CLIENT:
//             return [...clients, action.payload]

//         case UPDATE_CLIENT:
//             return clients.map((client) => client._id === action.payload ? action.payload : client)
        
//         case DELETE_CLIENT: 
//         return clients.filter((client) => client._id !== action.payload)
        
//         default:
//             return clients;
//     }
// }

// export default clients
