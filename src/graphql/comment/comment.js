import { User } from '../user/user.entity';
import { decodeNumberId, decodeTypeAndId, pipe } from '../../helper/util';
import { getQB, withPagination, where } from '../../helper/sql';
import { Comment } from './comment.entity';

export default class CommentResolver {
  static async createComment({ typeId, userId, ...rest }) {
    const user = await User.findOneOrFail(decodeNumberId(userId));
    const [commentType, commentTypeId] = decodeTypeAndId(typeId);
    return Comment.save({
      commentType,
      commentTypeId,
      userId: user.id,
      ...rest,
    });
  }

  static async deleteComment({ id }) {
    const realId = decodeNumberId(id);
    return Comment.delete(realId).then(() => ({
      id: realId,
    }));
  }

  static searchComment({ typeId, limit, offset }) {
    const [commentType, commentTypeId] = decodeTypeAndId(typeId);
    const qb = pipe(
      getQB('comment'),
      where('comment.commentType = :commentType and comment.commentTypeId = :commentTypeId', { commentType, commentTypeId }),
      withPagination(limit, offset),
    )(Comment);
    return qb
      .leftJoinAndMapOne('comment.user', User, 'user', 'user.id = comment.userId')
      .getManyAndCount();
  }
}
