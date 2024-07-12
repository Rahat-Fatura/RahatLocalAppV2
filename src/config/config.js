const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');
const config = require('config');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const configVarsSchema = Joi.object().keys({
  url: Joi.string().required(),
  port: Joi.number().required(),
});

const { value: configVars, errorConf } = configVarsSchema.prefs({ errors: { label: 'key' } }).validate(config);

if (errorConf) {
  throw new Error(`Config validation error: ${errorConf.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  url: configVars.url,
  port: configVars.port,
};
