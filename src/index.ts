import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import expressPlayground from 'graphql-playground-middleware-express';
import { readFileSync } from 'fs';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { resolvers } from './resolvers';
import dotenv from 'dotenv';
dotenv.config();

const typeDefs = readFileSync('./typeDefs.graphql', 'utf-8');

const main = async () => {
  const app = express();

  const DB_HOST = process.env.DB_HOST || '';

  const dbClient = await MongoClient.connect(DB_HOST, {
    serverApi: ServerApiVersion.v1
  });
  const db = dbClient.db();

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

  app.get('/', (_req, res) => res.end('Welcome to the PhotoShare API'));
  app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

  app.listen({ port: 4000 }, () =>
    console.log(
      `GraphQL Server running @ http://localhost:4000${server.graphqlPath}`
    )
  );
};

main();
