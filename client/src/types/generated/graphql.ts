export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null;
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
  readonly __typename: 'AuthPayload';
  readonly token: Scalars['String'];
  readonly user: User;
};

export type Mutation = {
  readonly __typename: 'Mutation';
  readonly addFakeUsers: ReadonlyArray<User>;
  readonly fakeUserAuth: AuthPayload;
  readonly githubAuth: AuthPayload;
  readonly postPhoto: Photo;
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
  readonly __typename: 'Photo';
  readonly category: PhotoCategory;
  readonly created: Scalars['DateTime'];
  readonly description: Maybe<Scalars['String']>;
  readonly id: Scalars['ID'];
  readonly name: Scalars['String'];
  readonly postedBy: User;
  readonly taggedUsers: ReadonlyArray<User>;
  readonly url: Scalars['String'];
};

export enum PhotoCategory {
  Action = 'ACTION',
  Graphic = 'GRAPHIC',
  Landscape = 'LANDSCAPE',
  Portrait = 'PORTRAIT',
  Selfie = 'SELFIE'
}

export type PostPhotoInput = {
  readonly category: InputMaybe<PhotoCategory>;
  readonly description: InputMaybe<Scalars['String']>;
  readonly name: Scalars['String'];
  readonly taggedUsers: InputMaybe<ReadonlyArray<Scalars['ID']>>;
};

export type Query = {
  readonly __typename: 'Query';
  readonly allPhotos: ReadonlyArray<Photo>;
  readonly allUsers: ReadonlyArray<User>;
  readonly me: Maybe<User>;
  readonly totalPhotos: Scalars['Int'];
  readonly totalUsers: Scalars['Int'];
};


export type QueryAllPhotosArgs = {
  after: InputMaybe<Scalars['DateTime']>;
};

export type User = {
  readonly __typename: 'User';
  readonly avatar: Maybe<Scalars['String']>;
  readonly githubLogin: Scalars['ID'];
  readonly inPhotos: ReadonlyArray<Photo>;
  readonly name: Scalars['String'];
  readonly postedPhotos: ReadonlyArray<Photo>;
};
