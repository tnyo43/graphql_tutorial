const { GraphQLScalarType } = require('graphql');

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
    postPhoto(_, args) {
      const postedUserId = args.input.postedBy;

      if (
        users.find((user) => user.githubLogin === postedUserId) === undefined
      ) {
        throw 'unknown user';
      }

      const newPhoto = {
        id: ++photoId,
        githubUser: postedUserId,
        ...args.input,
        created: new Date()
      };

      photos.push(newPhoto);
      return newPhoto;
    }
  },
  Photo: {
    url: (photo) => `http://yoursite.com/img/${photo.id}.jpg`,
    postedBy: (photo) =>
      users.find((user) => user.githubLogin === photo.githubUser),
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
