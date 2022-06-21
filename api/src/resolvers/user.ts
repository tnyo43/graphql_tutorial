import { photoQueries } from '@db/photo';
import { tagQueries } from '@db/tags';
import { userQueries } from '@db/user';
import { authorizeWithGithub, randomUsers } from 'libs';
import {
  MutationResolvers,
  QueryResolvers,
  UserResolvers
} from 'types/generated/graphql';
import { Context } from './type';

export const userQueryResolvers: Pick<
  QueryResolvers<Context>,
  'me' | 'allUsers' | 'totalUsers'
> = {
  me: (_parent, _args, { currentUser }) => currentUser,
  totalUsers: (_parent, _args, { db }) => userQueries.totalUsers(db),
  allUsers: (_parent, _args, { db }) => userQueries.allUsers(db)
};

export const userMutationResolvers: Pick<
  MutationResolvers<Context>,
  'githubAuth' | 'addFakeUsers' | 'fakeUserAuth'
> = {
  githubAuth: async (_parent, { code }, { db }) => {
    const authorizeResult = await authorizeWithGithub({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    });

    if (authorizeResult.status === 'error') {
      throw new Error(authorizeResult.message);
    }

    const { accessToken, login, name, avatarUrl } = authorizeResult;

    const latestUserInfo = {
      name,
      githubLogin: login,
      githubToken: accessToken,
      avatar: avatarUrl
    };

    await userQueries.upsertUserOfGithubLogin(db, {
      userInfo: latestUserInfo
    });

    return { user: latestUserInfo, token: accessToken };
  },
  addFakeUsers: async (_parent, args, { db }) => {
    const users = await randomUsers(args.count);
    return await userQueries.addUsers(db, { users });
  },
  fakeUserAuth: async (_parent, { githubLogin }, { db }) => {
    const user = await userQueries.userOfGithubLogin(db, { githubLogin });

    if (!user) {
      throw new Error(`Cannot find user with githubLogin ${githubLogin}`);
    }

    return {
      token: user.githubToken,
      user
    };
  }
};

export const userResolver: UserResolvers<Context> = {
  postedPhotos: (user, _args, { db }) =>
    photoQueries.photosByUser(db, { userInfo: user }),
  inPhotos: (user, _args, { db }) =>
    tagQueries.photosOfTaggedUser(db, { userInfo: user })
};
