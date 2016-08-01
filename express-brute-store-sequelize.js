var AbstractClientStore = require('express-brute/lib/AbstractClientStore');
var Sequelize = require('sequelize');

var bruteStore = module.exports = function (sequelize, options) {
    AbstractClientStore.apply(this, arguments);

    this.options = options || {};
    
    if (!this.options.tableName) {
        this.options.tableName = 'ExpressBrute';
    }

    var dateType = sequelize.options.dialect === 'mysql' ? Sequelize.DATE(6) : Sequelize.DATE;
    this.model = sequelize.define(this.options.tableName, {
        key:{
            type: Sequelize.STRING,
            primaryKey: true
        },
        lifetime: dateType,
        firstRequest: dateType,
        lastRequest: dateType,
        count: Sequelize.INTEGER
    }, {
		timestamps: true,
		createdAt: 'createdAt',
		updatedAt: 'updatedAt'
	});
}

bruteStore.prototype = Object.create(AbstractClientStore.prototype);

bruteStore.prototype.set = function (key, value, lifetime, callback) {    
    var args = arguments,
        self = this;

    var data = {
        count: value.count,
        lastRequest: value.lastRequest,
        firstRequest: value.firstRequest,
        lifetime: new Date(Date.now() + lifetime * 1000)
    }
    
    return this.model.findOne({ where: { key: key } }).then(function (brute) {
        if (brute) {
            return brute.updateAttributes(data).then(function () {
                if (callback) callback();
            })
        }
        else {
            data.key = key;

            return self.model.create(data).then(function () {
                if (callback) callback();
            })
        }
    })
    .catch(function (err) {
        if (callback) callback(err);
    })
}

bruteStore.prototype.get = function (key, callback) {    
    return this.model.findOne({ where: { key: key } }).then(function (brute) {
        if (brute) {
            var data = {
                count: brute.get('count'),
                lastRequest: brute.get('lastRequest'),
                firstRequest: brute.get('firstRequest')
            }

            if (brute.get('lifetime') < new Date()) {
                return brute.destroy().then(function () {
                    if (callback) callback();
                })
            }
            else {
                if (callback) callback(null, data);
            }
        }
        else {
            if (callback) callback();
        }        
    })
    .catch(function (err) {
        if (callback) callback(err);
    })
}

bruteStore.prototype.reset = function (key, callback) {
    return this.model.destroy({ where: { key: key } }).then(function (brute) {
        if (callback) callback();
    })
    .catch(function (err) {
        if (callback) callback(err);
    })
};

bruteStore.prototype.clear = function (lifetime) {
    var clause = { truncate: true };

    if (typeof lifetime == 'number') {
        clause = { where: { updatedAt: { $lt: new Date(Date.now() - lifetime) } } };    
    }

    return this.model.destroy(clause);
};


