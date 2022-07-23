import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MeDocument,
  useGithubAuthMutation,
  useMeQuery
} from './query.generated';

export const AuthorizedUser = () => {
  const [isLogin, setLogin] = useState(false);
  const navigate = useNavigate();

  const [{ data }, githubAuthMutation] = useGithubAuthMutation();

  const requestCode = () => {
    const url = `http://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}`;
    window.location.href = url;
  };

  useEffect(() => {
    if (data) {
      localStorage.setItem('token', data.githubAuth.token);
      setLogin(true);
    }
  }, [data]);

  useEffect(() => {
    if (localStorage.getItem('token') !== null) {
      setLogin(true);
    }
  }, []);

  useEffect(() => {
    if (window.location.search.match(/code=/)) {
      setLogin(true);
      const code = window.location.search.replace('?code=', '');
      githubAuthMutation({ code });
      navigate('/', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.location.toString()]);

  return isLogin ? <Me /> : <LoginButton requestCode={requestCode} />;
};

const LoginButton = (props: { requestCode: () => void }) => (
  <button onClick={props.requestCode}>Login With GitHub</button>
);

const Me = () => {
  const [{ fetching, error, data }, writeQuery] = useMeQuery();

  return error ? (
    <p>something wrong. try again!</p>
  ) : fetching || data === undefined || data.me === null ? (
    <p>loading...</p>
  ) : (
    <div>
      <img src={data.me.avatar || ''} width={48} height={48} alt='' />
      <span>{data.me.name}</span>
      <button
        onClick={() => {
          localStorage.removeItem('token');
          writeQuery({
            query: MeDocument,
            data: { me: null }
          });
        }}
      >
        logout
      </button>
    </div>
  );
};
