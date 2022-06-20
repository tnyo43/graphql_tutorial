import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthorizedUser } from '../AuthorizedUser';
import { UserList } from '../UserList';

export const UserPage = () => {
  return (
    <BrowserRouter>
      <AuthorizedUser />
      <UserList />
    </BrowserRouter>
  );
};
