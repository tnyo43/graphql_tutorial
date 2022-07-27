import React, { useEffect, useState } from 'react';
import { UserInfoFragment } from '../UserCommon/fragment.generated';
import {
  useAddFakeUsersMutation,
  useAllUsersQuery,
  useAddFakeUsersSubscriptionSubscription
} from './query.generated';

export const UserList = () => {
  const [{ fetching, error, data }] = useAllUsersQuery();
  const [, addFakeUsersMutation] = useAddFakeUsersMutation();
  const [{ data: addUserData }] = useAddFakeUsersSubscriptionSubscription();
  const [subscribedUsers, setSubscribedUsers] = useState<UserInfoFragment[]>(
    []
  );

  useEffect(() => {
    if (addUserData === undefined) return;
    const newUsers = addUserData.newUsers;
    setSubscribedUsers((users) => users.concat(newUsers));
  }, [addUserData]);

  const addFakeUser = async () => {
    await addFakeUsersMutation({ count: 1 });
  };

  if (error) return <p>something wrong. try again!</p>;
  if (fetching || data === undefined) throw 'fetching';

  return (
    <Users
      count={data.totalUsers + subscribedUsers.length}
      users={data.allUsers.concat(subscribedUsers)}
      addFakeUser={addFakeUser}
    />
  );
};

const Users: React.FC<{
  count: number;
  users: readonly UserInfoFragment[];
  addFakeUser: () => void;
}> = (props) => (
  <div>
    <p>{props.count} Users</p>
    <button onClick={() => props.addFakeUser()}>add a fake user</button>
    <ul>
      {props.users.map((user) => (
        <li key={user.githubLogin}>
          <picture>
            <img src={user.avatar || ''} width={48} height={48} alt='' />
          </picture>
          {user.name}
        </li>
      ))}
    </ul>
  </div>
);
