/**
 * Environment: names storage.
 *
 * Course info: http://dmitrysoshnikov.com/courses/essentials-of-interpretation/
 *
 * (C) 2018-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

class Environment {
  /**
   * Creates an environment with the given record.
   */
  constructor(record = {}, parent = null) {
    this.record = record;
    this.parent = parent;
  }

  /**
   * Creates a variable with the given name and value.
   */
  define(name, value) {
    this.record[name] = value;
    return value;
  }

  /**
   * Updates an existing variable.
   */
  assign(name, value) {
    this.resolve(name).record[name] = value;
    return value;
  }

  /**
   * Returns the value of a defined variable, or throws
   * if the variable is not defined.
   */
  lookup(name) {
    return this.resolve(name).record[name];
  }

  /**
   * Returns specific environment in which a variable is defined, or
   * throws if a variable is not defined.
   */
  resolve(name) {
    if (this.record.hasOwnProperty(name)) return this;
    else if (this.parent) return this.parent.resolve(name);
    else throw `Variable '${name}' is not defined`;
  }
}

module.exports = Environment;