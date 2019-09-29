import Video from './video.entity';
import { decodeNumberId, pipe } from '../../helper/util';
import {
  getManyAndCount, getQB, withPagination, where, leftJoinAndMapOne, getOne,
} from '../../helper/sql';
import { User } from '../user/user.entity';
import { Comment } from '../comment/comment.entity';


const addCommentCount = orm => orm
  .addSelect(subQuery => subQuery
    .select('COUNT(comment.id)')
    .where("comment.commentType = 'video' and comment.commentTypeId = video.id")
    .from(Comment, 'comment'),
  'video_commentCount');


export async function createVideo({
  userId,
  videoUrl,
  title,
}) {
  const user = await User.findOneOrFail(decodeNumberId(userId));
  return Video.save({
    userId: user.id,
    videoUrl,
    title,
  });
}

export async function deleteVideo(
  id,
) {
  const video = await Video.findOneOrFail(decodeNumberId(id));
  return video.deletedAt
    ? Video.remove(video)
    : Video.merge(video, { deletedAt: new Date() }).save();
}

export function searchVideos({
  limit,
  offset,
}) {
  return pipe(
    getQB('video'),
    leftJoinAndMapOne('video.user', User, 'user', 'user.id = video.userId'),
    addCommentCount,
    where('video.deletedAt is null'),
    withPagination(limit, offset),
    getManyAndCount,
  )(Video);
}

export function searchVideo(id) {
  return pipe(
    getQB('video'),
    leftJoinAndMapOne('video.user', User, 'user', 'user.id = video.userId'),
    addCommentCount,
    where('video.id = :id', { id: decodeNumberId(id) }),
    getOne,
  )(Video);
}
