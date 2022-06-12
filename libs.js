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

module.exports = { authorizeWithGithub };
