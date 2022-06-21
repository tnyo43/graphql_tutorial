import { UserModel } from '@db/user';
import { PubSub } from 'graphql-subscriptions';
import { Db } from 'mongodb';

export type Context = {
  db: Db;
  currentUser: UserModel | null;
  pubsub: PubSub;
};
