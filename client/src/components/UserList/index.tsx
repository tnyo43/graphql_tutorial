import { useAllUsersQuery, UserListItemFragment } from './query.generated';

export const UserList = () => {
  const { loading, error, data, refetch } = useAllUsersQuery();

  return error ? (
    <p>something wrong. try again!</p>
  ) : loading || data === undefined ? (
    <p>loading users...</p>
  ) : (
    <Users
      count={data.totalUsers}
      users={data.allUsers}
      refetchUsers={refetch}
    />
  );
};

const Users: React.FC<{
  count: number;
  users: readonly UserListItemFragment[];
  refetchUsers: () => void;
}> = (props) => (
  <div>
    <p>{props.count} Users</p>
    <button onClick={() => props.refetchUsers()}>refetch users</button>
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
