import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGithubAuthMutation, useMeQuery } from './query.generated';

export const AuthorizedUser = () => {
  const [isLogin, setLogin] = useState(false);
  const navigate = useNavigate();

  const [githubAuthMutation, { data }] = useGithubAuthMutation();

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
      githubAuthMutation({ variables: { code } });
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
  const { loading, error, data } = useMeQuery();

  console.log(loading, error, data);

  return error ? (
    <p>something wrong. try again!</p>
  ) : loading || data === undefined || data.me === null ? (
    <p>loading...</p>
  ) : (
    <div>
      <img src={data.me.avatar || ''} width={48} height={48} alt='' />
      <span>{data.me.name}</span>
      <button
        onClick={() => {
          localStorage.removeItem('token');
          window.location.reload();
        }}
      >
        logout
      </button>
    </div>
  );
};