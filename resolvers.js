const { GraphQLScalarType } = require('graphql');
const { authorizeWithGithub } = require('./libs.js');

const users = [
  { githubLogin: 'mHattrup', name: 'Mike Hattrup' },
  { githubLogin: 'gPlake', name: 'Glen Plake' },
  { githubLogin: 'sSchmidt', name: 'Scot Schmidt' }
];

let photoId = 3;
const photos = [
  {
    id: '1',
    name: 'Dropping The Heart Chute',
    description: 'happy',
    category: 'ACTION',
    githubUser: 'mHattrup',
    created: '2019-12-31T15:00:00.000Z'
  },
  {
    id: '2',
    name: 'Enjoying the sunshine',
    description: 'happy',
    category: 'SELFIE',
    githubUser: 'sSchmidt',
    created: '2022-12-31T15:00:00.000Z'
  },
  {
    id: '3',
    name: 'Gunbarrel 25',
    description: 'happy',
    category: 'LANDSCAPE',
    githubUser: 'gPlake',
    created: '2030-12-31T15:00:00.000Z'
  }
];

const tags = [
  { photoId: '1', userId: 'gPlake' },
  { photoId: '2', userId: 'sSchmidt' },
  { photoId: '2', userId: 'mHattrup' },
  { photoId: '2', userId: 'gPlake' }
];

const resolvers = {
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

      console.log(latestUserInfo);

      const {
        ops: [user]
      } = await db
        .collection('users')
        .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });

      return { user, token: access_token };
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

      return newPhoto;
    }
  },
  Photo: {
    id: (photo) => photo.id || photo._id,
    url: (photo) => `http://yoursite.com/img/${photo.id || photo._id}.jpg`,
    postedBy: async (photo, _args, { db }) =>
      db.collection('users').findOne({ githubLogin: photo.userId }),
    taggedUsers: (photo) =>
      tags
        .filter((tag) => tag.photoId === photo.id)
        .map((tag) => tag.userId)
        .map((userId) => users.find((user) => user.githubLogin === userId))
  },
  User: {
    postedPhotos: (user) =>
      photos.filter((photo) => photo.githubUser === user.githubLogin),
    inPhotos: (user) =>
      tags
        .filter((tag) => tag.userId === user.githubLogin)
        .map((tag) => tag.photoId)
        .map((photoId) => photos.find((photo) => photo.id === photoId))
  },
  DateTime: new GraphQLScalarType({
    name: `DateTime`,
    description: `A calid date time value`,
    parseValue: (value) => new Date(value),
    serialize: (value) => new Date(value).toISOString(),
    parseLiteral: (ast) => ast.value
  })
};

module.exports = resolvers;
