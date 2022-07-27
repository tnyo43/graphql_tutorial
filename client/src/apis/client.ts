import { createClient } from 'urql';

export const urqlClient = createClient({
  url: 'http://localhost:4000/graphql',
  suspense: true,
  fetchOptions: () => {
    const token =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('token')
        : null;

    return {
      headers: {
        authorization: token || ''
      }
    };
  }
});
