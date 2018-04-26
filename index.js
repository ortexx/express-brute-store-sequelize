﻿"use strict";

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
    
    const schema = Object.assign({
      key:{
        type: Sequelize.STRING,
        primaryKey: true
      },
      lifetime: Sequelize.DATE,
      firstRequest: Sequelize.DATE,
      lastRequest: Sequelize.DATE,
      count: Sequelize.INTEGER
    }, this.options.fields || {});

    const modelOptions = Object.assign({
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    }, this.options.modelOptions || {});

    this.model = sequelize.define(this.options.tableName, schema, modelOptions);
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
      throw err;
    });
  }

  get(key, callback) {
    return this.model.findOne({ where: { key: key } }).then((brute) => {
      if (!brute) {
        typeof callback == 'function' && callback();  
        return;      
      }

      let data = brute.get();

      if (data.lifetime < new Date()) {
        return brute.destroy().then(() => {
          typeof callback == 'function' && callback();
          return;
        });
      }

      typeof callback == 'function' && callback(null, data);
      return data;
    })
    .catch(function (err) {
      typeof callback == 'function' && callback(err);
      throw err;
    });
  }

  reset(key, callback) {
    return this.model.destroy({ where: { key: key } }).then(() => {
      typeof callback == 'function' && callback();
    }).catch(function (err) {
      typeof callback == 'function' && callback(err);
      throw err;
    });
  };

  clear(lifetime, callback) {
    if(typeof lifetime == 'function') {
      callback = lifetime;
      lifetime = undefined;
    }
    
    let clause = { truncate: true };

    if (typeof lifetime == 'number') {
      clause = { where: { updatedAt: { [Sequelize.Op.lt]: new Date(Date.now() - lifetime * 1000) } } };
    }

    return this.model.destroy(clause).then(() => {
      typeof callback == 'function' && callback();
    }).catch(function (err) {
      typeof callback == 'function' && callback(err);
      throw err;
    });
  };
}

module.exports = BruteStore;


