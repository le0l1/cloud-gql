import { User } from '../user/user.entity';
import { decodeNumberId } from '../../helper/util';
import { Device } from './Device.entity';

export default class DeviceResolver {
  static async bindDevice({ userId, deviceToken }) {
    const user = await User.findOneOrFail(decodeNumberId(userId));
    return Device.save({
      userId: user.id,
      deviceToken,
    });
  }
}
