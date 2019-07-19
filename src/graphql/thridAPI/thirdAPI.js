import axios from 'axios';
import { ApolloError } from 'apollo-server-koa';
import { getManager } from 'typeorm';
import { env, decodeNumberId } from '../../helper/util';
import { VehicleInfo } from './vehicleInfo.entity';
import { Image } from '../image/image.entity';

export default class ThirdAPIResolver {
  static async searchVin(vin) {
    try {
      let vehicleInfo = await VehicleInfo.createQueryBuilder('vehicle')
        .leftJoinAndMapMany(
          'vehicle.images',
          Image,
          'image',
          "image.imageTypeId = vehicle.id and image.imageType = 'vehicleInfo'",
        )
        .andWhere('vehicle.vin = :vin', { vin })
        .getOne();
      if (vehicleInfo) return vehicleInfo;
      const res = await axios.get(
        `http://v.juhe.cn/vinParse/query.php?vin=${vin}&key=${env('JUHE_API_KEY')}`,
      );
      if (res.data.reason === 'success') {
        vehicleInfo = res.data.result.vehicleList.pop();
        VehicleInfo.save({
          vin,
          ...vehicleInfo,
        });
      }
      return vehicleInfo;
    } catch (e) {
      throw new ApolloError(e.message);
    }
  }

  static updateVin({ vinId, images }) {
    return getManager().transaction(async (trx) => {
      const vehicleInfo = await VehicleInfo.findOneOrFail(decodeNumberId(vinId));
      const newImages = images.map(a => Image.create({ path: a, imageTypeId: vehicleInfo.id, imageType: 'vehicleInfo' }));
      await trx.delete(Image, { imageTypeId: vehicleInfo.id, imageType: 'vehicleInfo' });
      await trx.save(newImages);
      return {
        ...vehicleInfo,
        images: newImages,
      };
    });
  }
}
