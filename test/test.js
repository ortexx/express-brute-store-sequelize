"use strict";

const assert = require('chai').assert;
const Sequelize = require('sequelize');
const Store = require('../index');

let sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
  operatorsAliases: +((Sequelize.version || '').split('.')[0]) >=5? undefined: false
});

describe('ExpressBruteStoreSequelize', function () {
  let store;
  let lifetime = 10;
  let key = 'key';
  let data = { count: 18 };

  before(function() {
    return sequelize.sync({ force: true });
  });

  describe('.constructor()', function () {
    store = new Store(sequelize);

    it('should create an instanse', function () {
      assert.instanceOf(store, Store);
    });
  });

  describe('.set()', function () {
    it('should set the value', function () {
      return store.set(key, data, lifetime).then((crt) => {
        return store.model.findOne({ where: { key: key } }).then((res) => {
          assert.equal(crt.count, data.count, 'wrong returned data');
          assert.equal(res.count, data.count, 'wrong db data');
        })
      });
    });

    it('shoud update the value', function () {
      data.count++;

      return store.set(key, data, lifetime).then((upd) => {
        return store.model.findOne({ where: { key: key } }).then((res) => {
          assert.equal(upd.count, data.count, 'wrong returned data');
          assert.equal(res.count, data.count, 'wrong db data');
        })
      });
    });
  });

  describe('.get()', function () {
    it('should get the value', function () {
      return store.get(key).then((res) => {
        assert.equal(res.count, data.count);
      });
    });

    it('should return the right expiration', function () {
      return store.model.findOne({ where: { key: key } }).then((res) => {
        if (!res) {
          throw new Error('Not found doc');
        }

        return res.update({ lifetime: Date.now() }).then(() => {
          return store.get(key).then((res) => {
            assert.isUndefined(res);
          });
        }).then(() => {
          return store.model.findOne({where: {key: key}}).then((res) => {
            assert.isNull(res);
          });
        });
      });
    });
  });

  describe('.reset()', function () {
    it('should reset the value', function () {
      return store.set(key, data, lifetime).then(() => {
        return store.reset(key).then((res) => {
          assert.isUndefined(res);
        }).then(() => {
          return store.model.findOne({where: {key: key}}).then((res) => {
            assert.isNull(res);
          })
        });
      });
    });
  });

  describe('.clean()', function () {
    it('should clean by a lifetime', function () {
      return store.set(key, data, lifetime).then(() => {
        return store.clean(2000).then(() => {
          return store.model.count().then((count) => {
            assert.equal(count, 1);
          });
        }).then(() => {
          return store.clean(-2000).then(() => {
            return store.model.count().then((count) => {
              assert.equal(count, 0);
            });
          });
        });
      });
    });

    it('should clean with a truncation', function () {
      return store.set(key, data, lifetime).then(() => {
        return store.clean().then(() => {
          return store.model.count().then((count) => {
            assert.equal(count, 0);
          });
        });
      });
    });
  });
});

