import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

const PrivateRoute = ({ element, ...rest }) => {
  const auth = getAuth();

  return (
    <Route
      {...rest}
      element={auth.currentUser ? element : <Navigate to="/login" />}
    />
  );
};

export default PrivateRoute;
