
import { FETCH_ALL, ADD_NEW, UPDATE, DELETE, GET_INVOICE, START_LOADING, END_LOADING, FETCH_INVOICE_BY_USER } from '../actions/constants'

const initialState = {
  isLoading: true,
  invoices: []
};

const invoices = (state = initialState, action) => {
  switch (action.type) {
    case START_LOADING:
      return { ...state, isLoading: true };
    case END_LOADING:
      return { ...state, isLoading: false };
    case FETCH_ALL:
      return {
        ...state,
        invoices: Array.isArray(action?.payload?.data)
          ? action.payload.data
          : (Array.isArray(action?.payload) ? action.payload : []),
        currentPage: action?.payload?.currentPage,
        numberOfPages: action?.payload?.numberOfPages,
      };
    case FETCH_INVOICE_BY_USER: {
      const payloadInvoices = Array.isArray(action.payload)
        ? action.payload
        : (Array.isArray(action?.payload?.data) ? action.payload.data : null);
      return {
        ...state,
        invoices: payloadInvoices !== null ? payloadInvoices : (Array.isArray(state.invoices) ? state.invoices : [])
      };
    }
    case GET_INVOICE:
      return { ...state, invoice: action.payload };
    case ADD_NEW: {
      const currentList = Array.isArray(state.invoices) ? state.invoices : [];
      return { ...state, invoices: [...currentList, action.payload] };
    }
    case UPDATE: {
      const currentList = Array.isArray(state.invoices) ? state.invoices : [];
      return {
        ...state,
        invoices: currentList.map((invoice) =>
          invoice?._id === action?.payload?._id ? action.payload : invoice
        )
      };
    }
    case DELETE: {
      const currentList = Array.isArray(state.invoices) ? state.invoices : [];
      return {
        ...state,
        invoices: currentList.filter((invoice) => invoice?._id !== action.payload)
      };
    }
    default:
      return {
        ...state,
        invoices: Array.isArray(state?.invoices) ? state.invoices : []
      };
  }
};

export default invoices;



//   const invoices =( state = { invoices: [], }, action ) => {
//     switch (action.type) {
//         case FETCH_ALL:
//             return { ...state, invoices: action.payload }

//         case GET_INVOICE:
//             return { ...state, invoice: action.payload }

//         case ADD_NEW:
//             return { ...state, invoices: [...state.invoices, action.payload] }

//         case UPDATE:
//             return { ...state, invoices: state.invoices.map((invoice) => invoice._id === action.payload ? action.payload : invoice) }
        
//         case DELETE: 
//         return {...state, invoices: state.invoices.filter((invoice) => invoice._id !== action.payload)}
        
//         default:
//             return state;
//     }
// }

// export default invoices
