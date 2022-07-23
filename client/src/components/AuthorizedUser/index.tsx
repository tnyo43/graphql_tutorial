import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import {
  MeDocument,
  useGithubAuthMutation,
  useMeQuery
} from './query.generated';

export const AuthorizedUser = () => {
  const [isLogin, setLogin] = useState(false);
  const router = useRouter();

  const [{ data }, githubAuthMutation] = useGithubAuthMutation();

  const requestCode = () => {
    const url = `http://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`;
    router.push(url);
  };

  useEffect(() => {
    if (data) {
      localStorage.setItem('token', data.githubAuth.token);
      setLogin(true);
    }
  }, [data]);

  useEffect(() => {
    if (!localStorage) return;
    if (localStorage.getItem('token') !== null) {
      setLogin(true);
    }
  }, []);

  useEffect(() => {
    if (router.asPath.match(/code=/)) {
      setLogin(true);
      const code = window.location.search.replace('?code=', '');
      githubAuthMutation({ code });
      router.replace('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath]);

  return isLogin ? <Me /> : <LoginButton requestCode={requestCode} />;
};

const LoginButton = (props: { requestCode: () => void }) => (
  <button onClick={props.requestCode}>Login With GitHub</button>
);

const Me = () => {
  const router = useRouter();
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
          if (localStorage) {
            localStorage.removeItem('token');
          }
          writeQuery({
            query: MeDocument,
            data: { me: null }
          });
          router.reload();
        }}
      >
        logout
      </button>
    </div>
  );
};
