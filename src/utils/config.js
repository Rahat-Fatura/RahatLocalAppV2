/* eslint-disable security/detect-non-literal-fs-filename */
const fs = require('fs');

class Config {
  constructor(filepath) {
    this.filepath = filepath;
    this.check();
  }

  check() {
    if (!fs.existsSync(this.filepath)) {
      fs.writeFileSync(this.filepath, JSON.stringify({}));
    }
  }

  read() {
    return JSON.parse(fs.readFileSync(this.filepath));
  }

  set(key, value) {
    const config = this.read();
    const keys = key.split('.');
    let current = config;
    keys.forEach((fkey, index) => {
      if (index === keys.length - 1) {
        current[fkey] = value;
      } else {
        if (!Object.prototype.hasOwnProperty.call(current, fkey)) {
          current[fkey] = {};
        }
        current = current[fkey];
      }
    });
    fs.writeFileSync(this.filepath, JSON.stringify(config));
  }

  get(key) {
    const config = this.read();
    return this.locate(config, key);
  }

  delete(key) {
    const config = this.read();
    const keys = key.split('.');
    let current = config;
    keys.forEach((fkey, index) => {
      if (index === keys.length - 1) {
        delete current[fkey];
      } else {
        if (!Object.prototype.hasOwnProperty.call(current, fkey)) {
          current[fkey] = {};
        }
        current = current[fkey];
      }
    });
    fs.writeFileSync(this.filepath, JSON.stringify(config));
  }

  has(key) {
    const config = this.read();
    return this.locate(config, key) !== undefined;
  }

  clear() {
    fs.writeFileSync(this.filepath, JSON.stringify({}));
  }

  // eslint-disable-next-line class-methods-use-this
  locate(obj, key) {
    const keys = key.split('.');
    let current = obj;
    keys.forEach((fkey) => {
      if (current !== undefined && Object.prototype.hasOwnProperty.call(current, fkey)) {
        current = current[fkey];
      } else {
        current = undefined;
      }
    });
    return current;
  }
}

module.exports = Config;
