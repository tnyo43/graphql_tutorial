import { photoQueries } from '@db/photo';
import { tagQueries } from '@db/tags';
import { userQueries } from '@db/user';
import {
  MutationResolvers,
  PhotoResolvers,
  QueryResolvers
} from 'types/generated/graphql';

export const photoQueryResolvers: Pick<
  QueryResolvers,
  'allPhotos' | 'totalPhotos'
> = {
  totalPhotos: (_parent, _args, { db }) => photoQueries.totalPhotos(db),
  allPhotos: (_parent, _args, { db }) => photoQueries.allPhotos(db)
};

export const photoMutationResolvers: Pick<MutationResolvers, 'postPhoto'> = {
  postPhoto: async (_parent, args, { db, currentUser }) => {
    if (!currentUser) {
      throw new Error('only an authorized user can post a photo');
    }

    const photoInfo = {
      ...args.input,
      category: args.input.category || ('PORTRAIT' as const),
      userId: currentUser.githubLogin,
      created: new Date()
    };

    const postedPhoto = await photoQueries.addPhoto(db, {
      photoInfo: photoInfo
    });

    if (args.input.taggedUsers) {
      const tags = args.input.taggedUsers.map((userId) => ({
        photoId: postedPhoto.id,
        userId
      }));
      await tagQueries.addTags(db, { tagInfos: tags });
    }

    return postedPhoto;
  }
};

export const photoResolvers: PhotoResolvers = {
  url: (photo) => `http://yoursite.com/img/${photo.id}.jpg`,
  postedBy: (photo, _args, { db }) =>
    userQueries.userOfGithubLogin(db, { githubLogin: photo.userId }),
  taggedUsers: (photo, _args, { db }) =>
    tagQueries.taggedUsersOfPhoto(db, { photoInfo: photo })
};
