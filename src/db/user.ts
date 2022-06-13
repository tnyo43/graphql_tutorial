import { Db, WithId } from 'mongodb';

type UserInfo = {
  name: string;
  githubLogin: string;
  githubToken: string;
  avatar: string;
};

export type UserRecord = WithId<UserInfo>;

export const userQueries = {
  // CREATE
  addUsers: async (db: Db, params: { users: UserInfo[] }) =>
    await db.collection('users').insertMany(params.users),

  // READ
  totalUsers: (db: Db) => db.collection('users').estimatedDocumentCount(),
  allUsers: (db: Db) =>
    db.collection('users').find().toArray() as Promise<UserRecord[]>,
  userOfGithubLogin: (db: Db, params: { githubLogin: string }) =>
    db.collection('users').findOne(params) as Promise<UserRecord>,

  // UPSERT
  upsertUserOfGithubLogin: (db: Db, params: { userInfo: UserInfo }) =>
    db
      .collection('users')
      .replaceOne(
        { githubLogin: params.userInfo.githubLogin },
        params.userInfo,
        { upsert: true }
      )
};
