import { isBefore, isAfter, format } from 'date-fns';
import { Activity } from './activity.entity';
import { decodeNumberId, mergeIfValid } from '../../helper/util';
import { ActivityProduct } from './activityProduct.entity';
import { User } from '../user/user.entity';
import { aliasSampler } from '../../helper/aliasMethod';
import {
  ActivityNotStartError,
  ActivityHadEndedError,
  ActivityDateError,
  ActivityCheckedError,
  ActivityHasDrawedError,
} from '../../helper/error';
import { ActivityRecord } from './activityRecord.entity';
import CheckInResolver from '../checkIn/checkIn';

export default class ActivityResolver {
  /**
   * 创建活动
   */
  static createActivity({ name, startAt = new Date(), endAt }) {
    if (startAt && endAt && isAfter(startAt, endAt)) {
      throw new ActivityDateError();
    }
    return Activity.save({
      name,
      startAt,
      endAt,
    });
  }

  /**
   * 更改活动
   */
  static async updateActivity({
    id, name, startAt, endAt,
  }) {
    if (startAt && endAt && isAfter(startAt, endAt)) {
      throw new ActivityDateError();
    }
    const activity = await Activity.findOneOrFail(decodeNumberId(id));
    return Activity.merge(
      activity,
      mergeIfValid(
        {
          name,
          startAt,
          endAt,
        },
        {},
      ),
    ).save();
  }

  /**
   * 添加活动产品
   */
  static async addActivityProduct({ activityId, ...rest }) {
    const activity = await Activity.findOneOrFail(decodeNumberId(activityId));
    return ActivityProduct.save({
      activityId: activity.id,
      ...rest,
    });
  }

  /**
   * 删除活动产品
   */
  static async deleteActivityProduct(id) {
    const activityItem = await ActivityProduct.findOneOrFail(decodeNumberId(id));
    return ActivityProduct.merge(activityItem, { deletedAt: new Date() }).save();
  }

  /**
   * 查询活动
   */
  static searchActivity(id) {
    return Activity.createQueryBuilder('activity')
      .leftJoinAndMapMany(
        'activity.products',
        ActivityProduct,
        'activityItem',
        'activityItem.activityId = activity.id and activityItem.deletedAt is null',
      )
      .where('activity.id = :id', { id: decodeNumberId(id) })
      .getOne();
  }

  /**
   * 抽奖
   */
  static async luckDraw({ activityId, userId }) {
    const activity = await ActivityResolver.searchActivity(activityId);
    ActivityResolver.checkDate(activity);
    const user = await User.findOneOrFail(decodeNumberId(userId));
    await ActivityResolver.checkUserCondition(user, activity);
    return ActivityResolver.doLuckDraw(activity, user);
  }

  static getTodayRecord(activityId, userId) {
    return ActivityRecord.createQueryBuilder('record')
      .where('record.userId = :userId', { userId })
      .andWhere('record.activityId = :activityId', { activityId })
      .andWhere('DATE(record.createdAt) = :createdAt', {
        createdAt: format(new Date(), 'YYYY-MM-DD'),
      })
      .getOne();
  }

  /**
   * 坚持活动日期 是否可以参加活动
   * @param {*} activity 活动
   */
  static checkDate(activity) {
    if (isBefore(new Date(), activity.startAt)) {
      throw new ActivityNotStartError();
    }
    if (isAfter(new Date(), activity.endAt)) {
      throw new ActivityHadEndedError();
    }
  }

  /**
   * 检查活动条件
   * @param {*} activity 活动
   */
  static async checkUserCondition(user, activity) {
    const hasChecked = await CheckInResolver.hasChecked(user.id);
    if (!hasChecked) {
      throw new ActivityCheckedError();
    }
    const record = await ActivityResolver.getTodayRecord(activity.id, user.id);
    if (record) {
      throw new ActivityHasDrawedError();
    }
  }

  /**
   * 执行抽奖操作 并记录中奖情况
   * @param {*} activity 活动
   * @param {*} user 用户
   */
  static doLuckDraw(activity, user) {
    const probabilities = activity.products.map(a => a.probability);
    const awardIndex = aliasSampler(probabilities)();
    return ActivityRecord.save({
      userId: user.id,
      activityProductId: activity.products[awardIndex].id,
      activityId: activity.id,
    }).then(() => activity.products[awardIndex]);
  }
}
