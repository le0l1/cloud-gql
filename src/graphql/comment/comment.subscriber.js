/* eslint-disable class-methods-use-this */
import { EventSubscriber } from 'typeorm';
import { Comment } from './comment.entity';
import { BusinessCircle } from '../businessCircle/businessCircle.entity';
import { createCommentMessage } from '../message/message';

@EventSubscriber()
export default class CommentSubscriber {
  listenTo() {
    return Comment;
  }

  afterInsert(event) {
    const { entity } = event;
    if (entity.commentType === 'businessCircle') {
      BusinessCircle.update(entity.commentTypeId, {
        commentCount: () => 'comment_count + 1',
      });
    }
    createCommentMessage({
      triggerUserId: entity.userId,
      type: entity.commentType,
      typeId: entity.commentTypeId,
    });
  }
}
