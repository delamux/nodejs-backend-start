export const config = {
  env: process.env.NODE_ENV || 'development',
  domainUrl: process.env.DOMAIN_URL || 'http://localhost',
  appName: process.env.APP_NAME,
  port: process.env.PORT || 3000,
};
