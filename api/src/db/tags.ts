import { Db, WithId } from 'mongodb';
import { convertPhotoRecordToModel, PhotoModel, PhotoRecord } from './photo';
import { convertUserRecordToModel, UserModel, UserRecord } from './user';

type TagInfo = {
  userId: string;
  photoId: string;
};

type TagRecord = WithId<TagInfo>;

export const tagQueries = {
  // CREATE
  addTags: async (
    db: Db,
    params: { tagInfos: TagInfo[] }
  ): Promise<TagRecord[]> => {
    const results = await db.collection('tags').insertMany(params.tagInfos);
    return params.tagInfos.map((tag, index) => ({
      ...tag,
      _id: results.insertedIds[index]
    }));
  },

  // READ
  taggedUsersOfPhoto: async (
    db: Db,
    params: { photoInfo: PhotoModel }
  ): Promise<UserModel[]> => {
    const results = (await db
      .collection('users')
      .aggregate([
        {
          $lookup: {
            localField: 'githubLogin',
            from: 'tags',
            foreignField: 'userId',
            as: 'tags_users'
          }
        },
        { $match: { 'tags_users.photoId': params.photoInfo.id } }
      ])
      .toArray()) as UserRecord[];

    return results.map(convertUserRecordToModel);
  },
  photosOfTaggedUser: async (
    db: Db,
    params: { userInfo: UserModel }
  ): Promise<PhotoModel[]> => {
    const results = (await db
      .collection('photos')
      .aggregate([
        {
          $lookup: {
            localField: '_id',
            from: 'tags',
            foreignField: 'photoId',
            as: 'tags_photos'
          }
        },
        { $match: { 'tags_photos.userId': params.userInfo.githubLogin } }
      ])
      .toArray()) as PhotoRecord[];

    return results.map(convertPhotoRecordToModel);
  }
};
