import { ApolloClient, InMemoryCache } from '@apollo/client';
import { persistCache, LocalStorageWrapper } from 'apollo3-cache-persist';

const cache = new InMemoryCache();
persistCache({ cache, storage: new LocalStorageWrapper(localStorage) });

export const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
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
