import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { readFileSync } from 'fs';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { resolvers } from './resolvers';
import dotenv from 'dotenv';
import { Context } from 'resolvers';
import { userQueries } from '@db/user';
import { createServer } from 'http';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub } from 'graphql-subscriptions';

dotenv.config();

const typeDefs = readFileSync('./schema.graphql', 'utf-8');

const main = async () => {
  const app = express();

  const DB_HOST = process.env.DB_HOST || '';

  const dbClient = await MongoClient.connect(DB_HOST, {
    serverApi: ServerApiVersion.v1
  });
  const db = dbClient.db();

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const httpServer = createServer(app);
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql'
  });
  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        const githubToken = ctx.connectionParams?.Authorization as
          | string
          | undefined;
        const currentUser = githubToken
          ? await userQueries.userOfGithubToken(db, {
              githubToken
            })
          : null;
        const context: Context = { db, pubsub, currentUser };
        return context;
      }
    },
    wsServer
  );

  const pubsub = new PubSub();
  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    context: async ({ req }) => {
      const githubToken = req.headers.authorization;
      const currentUser = await userQueries.userOfGithubToken(db, {
        githubToken
      });
      const context: Context = {
        db,
        currentUser,
        pubsub
      };
      return context;
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            }
          };
        }
      }
    ]
  });

  await server.start();
  server.applyMiddleware({ app });

  httpServer.listen({ port: 4000 }, () =>
    // eslint-disable-next-line no-console
    console.log(
      `GraphQL Server running @ http://localhost:4000${server.graphqlPath}`
    )
  );
};

main();
