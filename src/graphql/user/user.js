import { User } from './user.entity';
import { decodeNumberId } from '../../helper/util';
import { decrypt } from '../../helper/encode';

export default class UserResolver {
  static async searchUserPassword({ id }) {
    const user = await User.findOneOrFail(decodeNumberId(id));
    return User.merge(user, {
      password: decrypt(user.password),
    });
  }
}
