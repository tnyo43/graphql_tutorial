import { Db, InsertOneResult, WithId } from 'mongodb';
import { PhotoRecord } from './photo';
import { UserRecord } from './user';

type TagInfo = {
  userId: string;
  photoId: string;
};

type TagRecord = WithId<TagInfo>;

export const tagQueries = {
  // CREATE
  addTags: (db: Db, params: { tagInfos: TagInfo[] }) =>
    db.collection('tags').insertMany(params.tagInfos),

  // READ
  taggedUsersOfPhoto: (db: Db, params: { photoInfo: PhotoRecord }) =>
    db
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
        { $match: { 'tags_users.photoId': params.photoInfo._id } }
      ])
      .toArray(),
  photosOfTaggedUser: (db: Db, params: { userInfo: UserRecord }) =>
    db
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
      .toArray()
};
