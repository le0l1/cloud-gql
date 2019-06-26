import qiniu from 'qiniu';

export const generateUploadToken = () => {
  const accessKey = process.env.QINIU_AK;
  const secretKey = process.env.QINIU_SK;
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  const options = {
    scope: process.env.QINIU_BUCKET,
  };
  const putPolicy = new qiniu.rs.PutPolicy(options);
  return putPolicy.uploadToken(mac);
};
