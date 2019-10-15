import { User } from '../user/user.entity';
import { decodeNumberId, pipe } from '../../helper/util';
import { Device } from './Device.entity';
import { getQB, where } from '../../helper/sql';
import { brodcastMessage } from '../../helper/umeng';

export default class DeviceResolver {
  static async bindDevice({ userId, deviceToken }) {
    const user = await User.findOneOrFail(decodeNumberId(userId));
    return Device.save({
      userId: user.id,
      deviceToken,
    });
  }
}

// 送消息到所有商户
export async function broadcastMessageToShops(body) {
  const devices = await pipe(
    getQB('device'),
    where((qb) => {
      const subQuery = qb
        .subQuery()
        .select('user.id')
        .where('user.id = device.userId')
        .andWhere('user.role = 2');
      return `EXSITS ${subQuery}`;
    }),
  );
  return brodcastMessage(
    devices.map(a => a.deviceToken),
    body,
  );
}
