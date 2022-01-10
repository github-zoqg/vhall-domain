class Storage {
  constructor() {
    this.prefix = options.prefix || 'vhallDomain';
  }
  get(key, type = 'local') {
    return [`${type}Storage`].getItem(key);
  }
  set(key, value, type = 'local') {
    return [`${type}Storage`].setItem(key, value);
  }
}

export default new Storage();
