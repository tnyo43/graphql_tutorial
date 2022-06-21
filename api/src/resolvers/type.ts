import { UserModel } from '@db/user';
import { Db } from 'mongodb';

export type Context = {
  db: Db;
  currentUser: UserModel;
};
