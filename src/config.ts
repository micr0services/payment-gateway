interface SMSConfig {
  provider?: 'http';
  url?: string;
  apiKey?: string;
  partnerId?: string;
  shortcode?: string;
  passType?: string;
}

interface Config {
  sms?: SMSConfig;
}

const config: Config = {
  sms: {
    provider: (process.env.SMS_PROVIDER as 'http') || 'http',
    // Legacy HTTP SMS provider config
    url: process.env.SMS_URL || 'https://sms.textsms.co.ke/api/services/sendsms/',
    partnerId: process.env.SMS_PARTNER_ID || '12362',
    apiKey: process.env.SMS_API_KEY || '773ac3416a5b3f7cb26dbccad158c929',
    shortcode: process.env.SMS_SHORTCODE || 'TextSMS',
    passType: process.env.SMS_PASS_TYPE || 'plain',
  },
};

export default config;