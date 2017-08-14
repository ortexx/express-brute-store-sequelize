"use strict";

const assert = require('chai').assert;
const Sequelize = require('sequelize');
const Store = require('../index');

let sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false
});

describe('ExpressBruteStoreSequelize:', function () {
  let store;
  let lifetime = 10;
  let key = 'key';
  let data = { count: 18 };

  before(function() {
    return sequelize.sync({ force: true });
  });

  describe('#constructor()', function () {
    store = new Store(sequelize);

    it('check creation', function () {
      assert.instanceOf(store, Store);
    });
  });

  describe('#set()', function () {
    it('check setting', function () {
      return store.set(key, data, lifetime).then((crt) => {
        return store.model.find({ where: { key: key } }).then((res) => {
          assert.equal(crt.count, data.count, 'wrong returned data');
          assert.equal(res.count, data.count, 'wrong db data');
        })
      });
    });

    it('check updating', function () {
      data.count++;

      return store.set(key, data, lifetime).then((upd) => {
        return store.model.find({ where: { key: key } }).then((res) => {
          assert.equal(upd.count, data.count, 'wrong returned data');
          assert.equal(res.count, data.count, 'wrong db data');
        })
      });
    });
  });

  describe('#get()', function () {
    it('check getting', function () {
      return store.get(key).then((res) => {
        assert.equal(res.count, data.count);
      });
    });

    it('check expiration', function () {
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

  describe('#reset()', function () {
    it('check resetting', function () {
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

  describe('#clear()', function () {
    it('check clearing', function () {
      return store.set(key, data, lifetime).then(() => {
        return store.clear(2).then(() => {
          return store.model.count().then((count) => {
            assert.equal(count, 1);
          });
        }).then(() => {
          return store.clear().then(() => {
            return store.model.count().then((count) => {
              assert.equal(count, 0);
            });
          });
        });
      });
    });
  });
});

