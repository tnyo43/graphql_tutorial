import {
  useAddFakeUsersMutation,
  useAllUsersQuery,
  UserListItemFragment
} from './query.generated';

export const UserList = () => {
  const { loading, error, data, refetch } = useAllUsersQuery();
  const [addFakeUsersMutation] = useAddFakeUsersMutation();

  const addFakeUser = async () => {
    await addFakeUsersMutation({ variables: { count: 1 } });
    refetch();
  };

  return error ? (
    <p>something wrong. try again!</p>
  ) : loading || data === undefined ? (
    <p>loading users...</p>
  ) : (
    <Users
      count={data.totalUsers}
      users={data.allUsers}
      addFakeUser={addFakeUser}
    />
  );
};

const Users: React.FC<{
  count: number;
  users: readonly UserListItemFragment[];
  addFakeUser: () => void;
}> = (props) => (
  <div>
    <p>{props.count} Users</p>
    <button onClick={() => props.addFakeUser()}>add a fake user</button>
    <ul>
      {props.users.map((user) => (
        <li key={user.githubLogin}>
          <img src={user.avatar} width={48} height={48} alt='' />
          {user.name}
        </li>
      ))}
    </ul>
  </div>
);
