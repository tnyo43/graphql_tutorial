import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  split
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { persistCache, LocalStorageWrapper } from 'apollo3-cache-persist';

const cache = new InMemoryCache();
persistCache({ cache, storage: new LocalStorageWrapper(localStorage) });

const httpLink = new HttpLink({ uri: 'http://localhost:4000/graphql' });
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4000/graphql'
  })
);

const authLink = new ApolloLink((operation, forward) => {
  operation.setContext((context: Record<string, any>) => ({
    headers: {
      ...context.headers,
      authorization: localStorage.getItem('token')
    }
  }));
  return forward(operation);
});

const httpAuthLink = authLink.concat(httpLink);

const link = split(
  ({ query }) => {
    const mainDefinition = getMainDefinition(query);
    return (
      mainDefinition.kind === 'OperationDefinition' &&
      mainDefinition.operation === 'subscription'
    );
  },
  wsLink,
  httpAuthLink
);

export const client = new ApolloClient({
  link,
  cache,
  headers: {
    authorization: localStorage.getItem('token') || ''
  },
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network'
    }
  }
});
