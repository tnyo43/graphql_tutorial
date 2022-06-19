import { dateTimeResolver } from './dateTime';
import {
  photoMutationResolvers,
  photoQueryResolvers,
  photoResolvers
} from './photo';
import {
  userMutationResolvers,
  userQueryResolvers,
  userResolver
} from './user';

export const resolvers = {
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
