const { ApolloServer } = require('apollo-server');

const typeDefs = `
  type User {
    githubLogin: ID!
    name: String!
    avatar: String
    postedPhotos: [Photo!]!
    inPhotos: [Photo!]!
  }

  enum PhotoCategory {
    SELFIE
    PORTRAIT
    ACTION
    LANDSCAPE
    GRAPHIC
  }

  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
    category: PhotoCategory!
    postedBy: User!
    taggedUsers: [User!]!
  }

  input PostPhotoInput {
    name: String!
    category: PhotoCategory=PORTRAIT
    description: String
    postedBy: ID!
  }

  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
  }

  type Mutation {
    postPhoto(input: PostPhotoInput!): Photo!
  }
`;

const users = [
  { githubLogin: 'mHattrup', name: 'Mike Hattrup' },
  { githubLogin: 'gPlake', name: 'Glen Plake' },
  { githubLogin: 'sSchmidt', name: 'Scot Schmidt' }
];

let id = 3;
const photos = [
  {
    id: '1',
    name: 'Dropping The Heart Chute',
    description: 'happy',
    category: 'ACTION',
    githubUser: 'mHattrup'
  },
  {
    id: '2',
    name: 'Enjoying the sunshine',
    description: 'happy',
    category: 'SELFIE',
    githubUser: 'sSchmidt'
  },
  {
    id: '3',
    name: 'Gunbarrel 25',
    description: 'happy',
    category: 'LANDSCAPE',
    githubUser: 'gPlake'
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
    totalPhotos: () => photos.length,
    allPhotos: () => photos
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
        id: ++id,
        githubUser: postedUserId,
        ...args.input
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
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server
  .listen()
  .then(({ url }) => console.log(`GraphQL Service running on ${url}`));
