import { createClient } from 'urql';

export const urqlClient = createClient({
  url: 'http://localhost:4000/graphql',
  fetchOptions: () => {
    return {
      headers: { authorization: localStorage.getItem('token') || '' }
    };
  }
});
