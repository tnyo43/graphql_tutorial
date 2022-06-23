# graphql-tutorial/api

A GraphQL API application of [graphql_tutorial](https://github.com/tnyo43/graphql_tutorial).

# Install

Clone this project.

```
$ git clone https://github.com/tnyo43/graphql_tutorial.git
$ cd api/
```

Install dependencies and generate code from `../schema.graphql`.

```
$ yarn
```

## Environmental Variables

You need to create `.env` file and fill some variables to work in your environment.

- DB_HOST ... URL of your MongoDB host.
- GITHUB_CLIENT_ID ... The `Client ID` of your OAuth App.
- GITHUB_CLIENT_SECRET ... One of the `Client secrets` of your OAuth App.

# Run

```
$ yarn start
```
