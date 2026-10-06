const mailer = require('./mailer');

module.exports = {
  FROM_EMAIL: mailer.FROM_EMAIL,
  sendMail: mailer.sendMail,
  validateResendEnv: mailer.validateResendEnv,
  checkResendStartupConfig: mailer.checkResendStartupConfig,
  isValidEmail: mailer.isValidEmail,
  normalizeResendError: mailer.normalizeResendError,
};
