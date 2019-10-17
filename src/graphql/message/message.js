import Message from './message.entity';
import { BusinessCircle } from '../businessCircle/businessCircle.entity';
import Video from '../video/video.entity';
import Quote from '../quote/quote.entity';

// 创建评论相关的信息
export function createCommentMessage({
  triggerUserId,
  type,
  typeId,
}) {
  if (!(type in ['businessCircle', 'video'])) return {};
  const storeBusinessCircleMessage = async () => {
    const businessCircle = await BusinessCircle.findOne(typeId);
    return Message.save({
      userId: businessCircle.userId,
      triggerUserId,
      type,
      typeId,
    });
  };

  const storeVideoMessage = async () => {
    const video = await Video.findOne(typeId);
    return Message.save({
      userId: video.userId,
      triggerUserId,
      type,
      typeId,
    });
  };

  return {
    businessCircle: storeBusinessCircleMessage,
    video: storeVideoMessage,
  }[type]();
}

// 创建求购信息和询价单消息
export async function createQuoteMessage({
  type,
  typeId,
  quoteId,
}) {
}
