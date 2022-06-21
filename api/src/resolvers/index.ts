import { Resolvers } from 'types/generated/graphql';
import { dateTimeResolver } from './dateTime';
import {
  photoMutationResolvers,
  photoQueryResolvers,
  photoResolvers
} from './photo';
import { Context } from './type';
import {
  userMutationResolvers,
  userQueryResolvers,
  userResolver
} from './user';

export type { Context } from './type';

export const resolvers: Resolvers<Context> = {
  Query: {
    ...userQueryResolvers,
    ...photoQueryResolvers
  },
  Mutation: {
    ...userMutationResolvers,
    ...photoMutationResolvers
  },
  Photo: photoResolvers,
  User: userResolver,
  DateTime: dateTimeResolver
};
