export type Maybe<T> = T;
export type InputMaybe<T> = T;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
};

export type AuthPayload = {
  __typename: 'AuthPayload';
  token: Scalars['String'];
  user: User;
};

export type Mutation = {
  __typename: 'Mutation';
  addFakeUsers: Array<User>;
  fakeUserAuth: AuthPayload;
  githubAuth: AuthPayload;
  postPhoto: Photo;
};


export type MutationAddFakeUsersArgs = {
  count?: InputMaybe<Scalars['Int']>;
};


export type MutationFakeUserAuthArgs = {
  githubLogin: Scalars['ID'];
};


export type MutationGithubAuthArgs = {
  code: Scalars['String'];
};


export type MutationPostPhotoArgs = {
  input: PostPhotoInput;
};

export type Photo = {
  __typename: 'Photo';
  category: PhotoCategory;
  created: Scalars['DateTime'];
  description: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  postedBy: User;
  taggedUsers: Array<User>;
  url: Scalars['String'];
};

export enum PhotoCategory {
  Action = 'ACTION',
  Graphic = 'GRAPHIC',
  Landscape = 'LANDSCAPE',
  Portrait = 'PORTRAIT',
  Selfie = 'SELFIE'
}

export type PostPhotoInput = {
  category: InputMaybe<PhotoCategory>;
  description: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  taggedUsers: InputMaybe<Array<Scalars['ID']>>;
};

export type Query = {
  __typename: 'Query';
  allPhotos: Array<Photo>;
  allUsers: Array<User>;
  me: Maybe<User>;
  totalPhotos: Scalars['Int'];
  totalUsers: Scalars['Int'];
};


export type QueryAllPhotosArgs = {
  after: InputMaybe<Scalars['DateTime']>;
};

export type User = {
  __typename: 'User';
  avatar: Maybe<Scalars['String']>;
  githubLogin: Scalars['ID'];
  inPhotos: Array<Photo>;
  name: Scalars['String'];
  postedPhotos: Array<Photo>;
};
