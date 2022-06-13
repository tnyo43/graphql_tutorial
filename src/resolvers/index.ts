import { authorizeWithGithub, randomUsers } from '../libs';
import { dateTimeResolver } from './dateTime';

export const resolvers = {
  Query: {
    me: (_parent, _args, { currentUser }) => currentUser,
    totalPhotos: (_parent, _args, { db }) =>
      db.collection('photos').estimatedDocumentCount(),
    allPhotos: (_parent, _args, { db }) =>
      db.collection('photos').find().toArray(),
    totalUsers: (_parent, _args, { db }) =>
      db.collection('users').estimatedDocumentCount(),
    allUsers: (_parent, _args, { db }) =>
      db.collection('users').find().toArray()
  },
  Mutation: {
    githubAuth: async (_parent, { code }, { db }) => {
      const { message, access_token, avatar_url, login, name } =
        await authorizeWithGithub({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code
        });

      if (message) {
        throw new Error(message);
      }

      const latestUserInfo = {
        name,
        githubLogin: login,
        githubToken: access_token,
        avatar: avatar_url
      };

      const {
        ops: [user]
      } = await db
        .collection('users')
        .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });

      return { user, token: access_token };
    },
    addFakeUsers: async (_parent, args, { db }) => {
      const users = await randomUsers(args.count);
      await db.collection('users').insertMany(users);

      return users;
    },
    fakeUserAuth: async (_parent, { githubLogin }, { db }) => {
      const user = await db.collection('users').findOne({ githubLogin });

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

      const newPhoto = {
        ...args.input,
        userId: currentUser.githubLogin,
        created: new Date()
      };

      const { insertedIds } = await db.collection('photos').insert(newPhoto);
      newPhoto.id = insertedIds[0];

      if (args.input.taggedUsers) {
        const tags = args.input.taggedUsers.map((userId) => ({
          photoId: newPhoto.id,
          userId
        }));
        await db.collection('tags').insert(tags);
      }

      return newPhoto;
    }
  },
  Photo: {
    id: (photo) => photo.id || photo._id,
    url: (photo) => `http://yoursite.com/img/${photo.id || photo._id}.jpg`,
    postedBy: (photo, _args, { db }) =>
      db.collection('users').findOne({ githubLogin: photo.userId }),
    taggedUsers: (photo, _args, { db }) =>
      db
        .collection('users')
        .aggregate([
          {
            $lookup: {
              localField: 'githubLogin',
              from: 'tags',
              foreignField: 'userId',
              as: 'tags_users'
            }
          },
          { $match: { 'tags_users.photoId': photo._id } }
        ])
        .toArray()
  },
  User: {
    postedPhotos: (user, _args, { db }) =>
      db
        .collection('photos')
        .find((photo) => photo.userId === user.githubLogin),
    inPhotos: (user, _args, { db }) =>
      db
        .collection('photos')
        .aggregate([
          {
            $lookup: {
              localField: '_id',
              from: 'tags',
              foreignField: 'photoId',
              as: 'tags_photos'
            }
          },
          { $match: { 'tags_photos.userId': user.githubLogin } }
        ])
        .toArray()
  },
  DateTime: dateTimeResolver
};
