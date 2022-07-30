import fetch from 'node-fetch';

type Credentials = {
  client_id: string;
  client_secret: string;
  code: string;
};

const requestGithubToken = async (credentials: Credentials) => {
  const result = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(credentials)
  });
  return await result.json();
};

const requestGithubUserAccount = async (token: string) => {
  const result = await fetch(`https://api.github.com/user`, {
    headers: {
      Authorization: `token ${token}`
    }
  });
  return await result.json();
};

type GitHubUserInfo =
  | { status: 'error'; message: string } // error
  | {
      status: 'success';
      accessToken: string;
      login: string;
      name: string;
      avatarUrl: string;
    }; // success

export const authorizeWithGithub = async (credentials: Credentials) => {
  const { access_token: accessToken } = (await requestGithubToken(
    credentials
  )) as {
    access_token: string;
  };
  const result = await requestGithubUserAccount(accessToken);
  const githubUser =
    'message' in result
      ? { ...result, status: 'error' }
      : {
          ...result,
          status: 'success',
          accessToken,
          avatarUrl: result.avatar_url
        };

  return githubUser as GitHubUserInfo;
};

type RandomUser = {
  login: {
    username: string;
    sha1: string;
  };
  name: {
    first: string;
    last: string;
  };
  picture: {
    thumbnail: string;
  };
};

export const randomUsers = async (count: number) => {
  const ramdomUserApi = `https://randomuser.me/api/?results=${count}`;
  const fetcher = await fetch(ramdomUserApi);
  const { results } = (await fetcher.json()) as { results: Array<RandomUser> };
  const users = results.map((r) => ({
    githubLogin: r.login.username,
    name: `${r.name.first} ${r.name.last}`,
    avatar: r.picture.thumbnail,
    githubToken: r.login.sha1
  }));

  return users;
};
