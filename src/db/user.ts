import { Db, WithId } from 'mongodb';

type UserInfo = {
  name: string;
  githubLogin: string;
  githubToken: string;
  avatar: string;
};

export type UserRecord = WithId<UserInfo>;

export type UserModel = UserInfo & { id: string };

export const convertUserRecordToModel = (record: UserRecord) => {
  const { _id, ...userInfo } = record;
  return { id: _id.toString(), ...userInfo };
};

export const userQueries = {
  // CREATE
  addUsers: async (
    db: Db,
    params: { users: UserInfo[] }
  ): Promise<UserModel[]> => {
    const result = await db.collection('users').insertMany(params.users);
    return params.users.map((user, index) => ({
      ...user,
      id: result.insertedIds[index].toString()
    }));
  },

  // READ
  totalUsers: (db: Db) => db.collection('users').estimatedDocumentCount(),
  allUsers: async (db: Db) => {
    const results = (await db
      .collection('users')
      .find()
      .toArray()) as UserRecord[];

    return results.map(convertUserRecordToModel);
  },
  userOfGithubLogin: async (
    db: Db,
    params: { githubLogin: string }
  ): Promise<UserModel> => {
    const result = (await db.collection('users').findOne(params)) as UserRecord;

    return convertUserRecordToModel(result);
  },

  // UPSERT
  upsertUserOfGithubLogin: async (db: Db, params: { userInfo: UserInfo }) => {
    await db
      .collection('users')
      .replaceOne(
        { githubLogin: params.userInfo.githubLogin },
        params.userInfo,
        { upsert: true }
      );
  }
};
