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
    const code = router.query.code;
    if (typeof code === 'string') {
      setLogin(true);
      githubAuthMutation({ code });
      router.replace('/');
    }
  }, [router, githubAuthMutation]);

  return isLogin ? <Me /> : <LoginButton requestCode={requestCode} />;
};

const LoginButton = (props: { requestCode: () => void }) => (
  <button onClick={props.requestCode}>Login With GitHub</button>
);

const Me = () => {
  const router = useRouter();
  const [{ fetching, error, data }, writeQuery] = useMeQuery();

  if (error) {
    return <p>something wrong. try again!</p>;
  }
  if (fetching || data === undefined || data.me === null) throw 'loading';

  return (
    <div>
      <picture>
        <img src={data.me.avatar || ''} width={48} height={48} alt='' />
      </picture>
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
