import React from 'react';
import { AuthorizedUser } from '../AuthorizedUser';
import { UserList } from '../UserList';

export const UserPage = () => {
  return (
    <>
      <AuthorizedUser />
      <UserList />
    </>
  );
};
