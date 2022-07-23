import React from 'react';
import { Provider } from 'urql';
import { urqlClient } from '~/apis/client';
import { UserPage } from '~/components/UserPage';

const App = () => (
  <React.StrictMode>
    <Provider value={urqlClient}>
      <UserPage />
    </Provider>
  </React.StrictMode>
);

export default App;
