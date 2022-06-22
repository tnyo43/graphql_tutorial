import { useEffect, useState } from 'react';
import { UserInfoFragment } from '../UserCommon/fragment.generated';
import {
  useAddFakeUsersMutation,
  useAllUsersQuery,
  useAddFakeUsersSubscriptionSubscription
} from './query.generated';

export const UserList = () => {
  const { loading, error, data } = useAllUsersQuery();
  const [addFakeUsersMutation] = useAddFakeUsersMutation();
  const subscriptionHandler = useAddFakeUsersSubscriptionSubscription();
  const [subscribedUsers, setSubscribedUsers] = useState<UserInfoFragment[]>(
    []
  );

  useEffect(() => {
    if (subscriptionHandler.data === undefined) return;
    const newUsers = subscriptionHandler.data.newUsers;
    setSubscribedUsers((users) => users.concat(newUsers));
  }, [subscriptionHandler]);

  const addFakeUser = async () => {
    await addFakeUsersMutation({ variables: { count: 1 } });
  };

  return error ? (
    <p>something wrong. try again!</p>
  ) : loading || data === undefined ? (
    <p>loading users...</p>
  ) : (
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
          <img src={user.avatar || ''} width={48} height={48} alt='' />
          {user.name}
        </li>
      ))}
    </ul>
  </div>
);
