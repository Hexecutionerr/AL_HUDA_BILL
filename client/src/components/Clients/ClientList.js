import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import Clients from './Clients';
import { getClientsByUser } from '../../actions/clientActions';
import { getInvoicesByUser } from '../../actions/invoiceActions';

const ClientList = () => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const user = JSON.parse(localStorage.getItem('profile'));
  const { clients } = useSelector((state) => state.clients);

  useEffect(() => {
    if (!user) {
      history.push('/login');
      return;
    }

    const searchId = user?.result?._id || user?.result?.googleId;
    if (searchId) {
      dispatch(getClientsByUser({ search: searchId }));
      dispatch(getInvoicesByUser({ search: searchId }));
    }
  }, [location, dispatch, history]);

  if (!user) {
    return null;
  }

  return (
    <div>
      <Clients
        open={open}
        setOpen={setOpen}
        currentId={currentId}
        setCurrentId={setCurrentId}
        clients={clients || []}
      />
    </div>
  );
};

export default ClientList;
