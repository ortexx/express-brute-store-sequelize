"use strict";

const AbstractClientStore = require('express-brute/lib/AbstractClientStore');
const Sequelize = require('sequelize');

class BruteStore extends AbstractClientStore {
  constructor(sequelize, options) {
    super();

    if(!sequelize) {
      throw new Error('The first argument of ExpressBruteStoreSequelize must be sequelize instance');
    }

    this.options = options || {};
    this.options.tableName = this.options.tableName || 'ExpressBrute';
    this.options.dateType = this.options.dateType || Sequelize.DATE;

    this.model = sequelize.define(this.options.tableName, {
      key:{
        type: Sequelize.STRING,
        primaryKey: true
      },
      lifetime: this.options.dateType,
      firstRequest: this.options.dateType,
      lastRequest: this.options.dateType,
      count: Sequelize.INTEGER
    }, {
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    });
  }

  set(key, value, lifetime, callback) {
    let data = {
      count: value.count,
      lastRequest: value.lastRequest,
      firstRequest: value.firstRequest,
      lifetime: new Date(Date.now() + (lifetime || 0) * 1000)
    };

    return this.model.findOne({ where: { key: key } }).then((brute) => {
      if (!brute) {
        data.key = key;

        return this.model.create(data).then((brute) => {
          let res = brute.get();
          typeof callback == 'function' && callback(null, res);
          return res;
        });
      }

      return brute.update(data).then((brute) => {
        let res = brute.get();
        typeof callback == 'function' && callback(null, res);
        return res;
      });
    }).catch(function (err) {
      typeof callback == 'function' && callback(err);
    });
  }

  get(key, callback) {
    return this.model.findOne({ where: { key: key } }).then((brute) => {
      if (!brute) {
        typeof callback == 'function' && callback();
      }

      let data = brute.get();

      if (data.lifetime < new Date()) {
        return brute.destroy().then(() => {
          typeof callback == 'function' && callback();
        })
      }

      typeof callback == 'function' && callback(null, data);
      return data;
    })
    .catch(function (err) {
      typeof callback == 'function' && callback(err);
    })
  }

  reset(key, callback) {
    return this.model.destroy({ where: { key: key } }).then(() => {
      typeof callback == 'function' && callback();
    }).catch(function (err) {
      typeof callback == 'function' && callback(err);
    })
  };

  clear(lifetime, callback) {
    let clause = { truncate: true };

    if (typeof lifetime == 'number') {
      clause = { where: { updatedAt: { $lt: new Date(Date.now() - lifetime * 1000) } } };
    }

    return this.model.destroy(clause).then(() => {
      typeof callback == 'function' && callback();
    }).catch(function (err) {
      typeof callback == 'function' && callback(err);
    })
  };
}

module.exports = BruteStore;


