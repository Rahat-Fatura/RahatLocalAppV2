/* eslint-disable no-restricted-syntax */
const _ = require('lodash');
const logger = require('../config/logger');

class Queue {
  constructor(length) {
    this.elements = [];
    this.length = Number(length);
  }

  push(object) {
    if (this.getLength() === this.length) {
      this.shift();
    }
    return this.elements.push(object);
  }

  shift() {
    return this.elements.shift();
  }

  getLength() {
    return this.elements.length;
  }

  async isValid() {
    try {
      if (this.getLength() !== this.length) throw new Error('Object length is not equal to queue length');
      for (const element of this.elements) {
        if (!_.isEqual(this.elements[0], element)) throw new Error('Objects are not equal');
      }
      return true;
    } catch (error) {
      logger.error(error);
      return false;
    }
  }
}

module.exports = Queue;
