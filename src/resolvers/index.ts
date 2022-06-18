import { photoQueries } from '@db/photo';
import { tagQueries } from '@db/tags';
import { userQueries } from '@db/user';
import { authorizeWithGithub, randomUsers } from '../libs';
import { dateTimeResolver } from './dateTime';

export const resolvers = {
  Query: {
    me: (_parent, _args, { currentUser }) => currentUser,
    totalPhotos: (_parent, _args, { db }) => photoQueries.totalPhotos(db),
    allPhotos: (_parent, _args, { db }) => photoQueries.allPhotos(db),
    totalUsers: (_parent, _args, { db }) => userQueries.totalUsers(db),
    allUsers: (_parent, _args, { db }) => userQueries.allUsers(db)
  },
  Mutation: {
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
      await userQueries.addUsers(db, { users });
      return users;
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
    },
    postPhoto: async (_parent, args, { db, currentUser }) => {
      if (!currentUser) {
        throw new Error('only an authorized user can post a photo');
      }

      const photoInfo = {
        ...args.input,
        userId: currentUser.githubLogin,
        created: new Date()
      };

      const postedPhoto = await photoQueries.addPhoto(db, {
        photoInfo: photoInfo
      });

      if (args.input.taggedUsers) {
        const tags = args.input.taggedUsers.map((userId) => ({
          photoId: postedPhoto.id,
          userId
        }));
        await tagQueries.addTags(db, { tagInfos: tags });
      }

      return postedPhoto;
    }
  },
  Photo: {
    id: (photo) => photo.id || photo._id,
    url: (photo) => `http://yoursite.com/img/${photo.id || photo._id}.jpg`,
    postedBy: (photo, _args, { db }) =>
      userQueries.userOfGithubLogin(db, { githubLogin: photo.userId }),
    taggedUsers: (photo, _args, { db }) =>
      tagQueries.taggedUsersOfPhoto(db, { photoInfo: photo })
  },
  User: {
    postedPhotos: (user, _args, { db }) =>
      photoQueries.photosByUser(db, { userInfo: user }),
    inPhotos: (user, _args, { db }) =>
      tagQueries.photosOfTaggedUser(db, { userInfo: user })
  },
  DateTime: dateTimeResolver
};
