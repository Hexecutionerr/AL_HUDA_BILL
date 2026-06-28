//Copyright (c) 2026 Hasnain Khan

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import {  createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import reducers from './reducers/'

// Initialize Demo Admin session synchronously on boot to bypass login/signup flows completely
const demoUser = {
  result: {
    _id: "demo_admin_user_id",
    name: "Demo Admin",
    email: "demo_admin@alhudatextiles.com"
  },
  token: "demo_token_123"
};
localStorage.setItem('profile', JSON.stringify(demoUser));

const store = createStore(reducers, compose(applyMiddleware(thunk)))

ReactDOM.render(
  <Provider store={store} >
    <App />
  </Provider>,
  document.getElementById('root')
);