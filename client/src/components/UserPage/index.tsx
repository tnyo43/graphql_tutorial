import React, { Suspense } from 'react';
import { AuthorizedUser } from '../AuthorizedUser';
import { UserList } from '../UserList';

export const UserPage = () => {
  return (
    <>
      <Suspense fallback={<p>loading...</p>}>
        <AuthorizedUser />
      </Suspense>
      <Suspense fallback={<p>loading...</p>}>
        <UserList />
      </Suspense>
    </>
  );
};
