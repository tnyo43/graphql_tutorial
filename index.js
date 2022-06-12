const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const expressPlayground =
  require('graphql-playground-middleware-express').default;
const { readFileSync } = require('fs');

const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const typeDefs = readFileSync('./typeDefs.graphql', 'utf-8');
const resolvers = require('./resolvers');

const main = async () => {
  const app = express();

  const dbClient = await MongoClient.connect(process.env.DB_HOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
  });
  db = dbClient.db();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const githubToken = req.headers.authorization;
      const currentUser = await db.collection('users').findOne({ githubToken });
      return { db, currentUser };
    }
  });

  await server.start();

  server.applyMiddleware({ app });

  app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'));
  app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

  app.listen({ port: 4000 }, () =>
    console.log(
      `GraphQL Server running @ http://localhost:4000${server.graphqlPath}`
    )
  );
};

main();
