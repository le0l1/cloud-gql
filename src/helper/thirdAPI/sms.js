import Core from "@alicloud/pop-core";

const getSMSParams = ({
  SignName = "dafengge",
  TemplateCode = "SMS_165030009",
  PhoneNumbers = null,
  TemplateParam = {}
} = {}) => ({
  SignName,
  TemplateCode,
  PhoneNumbers,
  TemplateParam
});

//调用短信sdk
export const sendSMS = async ({ phone: PhoneNumbers, smsCode }) => {
  if (!PhoneNumbers) return;
  const client = new Core({
    accessKeyId: process.env.ALI_AK,
    accessKeySecret: process.env.ALI_SK,
    endpoint: "https://dysmsapi.aliyuncs.com",
    apiVersion: "2017-05-25"
  });
  const requestOption = {
    method: "POST"
  };
  return client
    .request(
      "SendSms",
      getSMSParams({
        PhoneNumbers,
        TemplateParam: JSON.stringify({ code: smsCode })
      }),
      requestOption
    )
    .then(result => console.log(result));
};
