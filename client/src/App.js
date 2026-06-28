//Copyright (c) 2026 Hasnain Khan

import React, { useEffect } from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import SnackbarProvider from 'react-simple-snackbar'
import Invoice from './components/Invoice/Invoice';
import Invoices from './components/Invoices/Invoices';
import InvoiceDetails from './components/InvoiceDetails/InvoiceDetails'
import ClientList from './components/Clients/ClientList'
import NavBar from './components/NavBar/NavBar';
import Dashboard from './components/Dashboard/Dashboard';
import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import Settings from './components/Settings/Settings';
import * as api from './api/index'

function App() {

  const user = JSON.parse(localStorage.getItem('profile'))

  useEffect(() => {
    const ensureBackendProfile = async () => {
      if (user && user.result && user.result._id === "demo_admin_user_id") {
        try {
          const { data } = await api.fetchProfilesByUser({ search: user.result._id })
          if (!data || !data.data) {
            await api.createProfile({
              name: "Demo Admin",
              email: "demo_admin@alhudatextiles.com",
              userId: user.result._id,
              phoneNumber: '1234567890',
              businessName: 'Demo Business Ltd',
              contactAddress: '123 Demo Street',
              logo: '',
              website: 'www.demobusiness.com'
            })
          }
        } catch (error) {
          console.error("Failed to ensure default backend profile:", error)
        }
      }
    }
    ensureBackendProfile()
  }, [user])

  return (
    <div>
      <BrowserRouter>
      <SnackbarProvider>
     {user && <NavBar />} 
      <Header />
        <Switch>
          <Route path="/" exact component={Dashboard} />
          <Route path="/invoice" exact component={Invoice} />
          <Route path="/edit/invoice/:id" exact component={Invoice} />
          <Route path="/invoice/:id" exact component={InvoiceDetails} />
          <Route path="/invoices" exact component={Invoices} />
          <Route path="/settings" exact component={Settings} />
          <Route path="/dashboard" exact component={Dashboard} />
          <Route path="/customers" exact component={ClientList} />
          <Redirect from="/login" to="/dashboard" />
          <Redirect from="/forgot" to="/dashboard" />
          <Redirect from="/reset/:token" to="/dashboard" />
          <Redirect exact from="/new-invoice" to="/invoice" />

        </Switch>
        <Footer />
        </SnackbarProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
