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

export type PhotoModel = PhotoInfo & { id: string };

export const convertPhotoRecordToModel = (record: PhotoRecord): PhotoModel => {
  const { _id, ...photoInfo } = record;
  return { id: _id.toString(), ...photoInfo };
};

export const photoQueries = {
  // CREATE
  addPhoto: async (
    db: Db,
    params: { photoInfo: PhotoInfo }
  ): Promise<PhotoModel> => {
    const result = (await db
      .collection('photos')
      .insertOne(params.photoInfo)) as InsertOneResult<PhotoRecord>;

    return { id: result.insertedId.toString(), ...params.photoInfo };
  },

  // READ
  totalPhotos: (db: Db) => db.collection('photos').estimatedDocumentCount(),
  allPhotos: async (db: Db) => {
    const results = (await db
      .collection('photos')
      .find()
      .toArray()) as PhotoRecord[];

    return results.map(convertPhotoRecordToModel);
  },
  photosByUser: async (
    db: Db,
    params: { userInfo: { githubLogin: string } }
  ) => {
    const results = (await db
      .collection('photos')
      .find({ userId: params.userInfo.githubLogin })
      .toArray()) as WithId<PhotoRecord>[];

    return results.map(convertPhotoRecordToModel);
  }
};
