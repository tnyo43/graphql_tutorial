import { Db, InsertOneResult, WithId } from 'mongodb';

type PhotoCategory = 'SELFIE' | 'PORTRAIT' | 'ACTION' | 'LANDSCAPE' | 'GRAPHIC';

type PhotoInfo = {
  userId: string;
  url: string;
  name: string;
  description: string | null;
  category: PhotoCategory;
};

export type PhotoRecord = WithId<PhotoInfo>;

export const photoQueries = {
  // CREATE
  addPhoto: (db: Db, params: { photoInfo: PhotoInfo }) =>
    db.collection('photos').insertOne(params.photoInfo) as Promise<
      InsertOneResult<PhotoRecord>
    >,

  // READ
  totalPhotos: (db: Db) => db.collection('photos').estimatedDocumentCount(),
  allPhotos: (db: Db) =>
    db.collection('photos').find().toArray() as Promise<PhotoRecord[]>,
  photosByUser: (db: Db, params: { userInfo: { githubLogin: string } }) =>
    db
      .collection('photos')
      .find({ userId: params.userInfo.githubLogin })
      .toArray()
};
