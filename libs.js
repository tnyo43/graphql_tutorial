const fetch = require('node-fetch');

const requestGithubToken = async (credentials) => {
  try {
    const result = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    return await result.json();
  } catch (error) {
    throw new Error(error);
  }
};

const requestGithubUserAccount = async (token) => {
  try {
    const result = await fetch(`https://api.github.com/user`, {
      headers: {
        Authorization: `token ${token}`
      }
    });
    return await result.json();
  } catch (error) {
    throw new Error(error);
  }
};

const authorizeWithGithub = async (credentials) => {
  const { access_token } = await requestGithubToken(credentials);
  const githubUser = await requestGithubUserAccount(access_token);
  return { ...githubUser, access_token };
};

const randomUsers = async (count) => {
  const ramdomUserApi = `https://randomuser.me/api/?results=${count}`;
  const fetcher = await fetch(ramdomUserApi);
  const { results } = await fetcher.json();
  console.log(results);
  const users = results.map((r) => ({
    githubLogin: r.login.username,
    name: `${r.name.first} ${r.name.last}`,
    avatar: r.picture.thumbnail,
    githubToken: r.login.sha1
  }));

  return users;
};

module.exports = { authorizeWithGithub, randomUsers };
