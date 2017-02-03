# express-brute-store-sequelize
Sequelize store for module express-brute

# Install 
`npm install express-brute-store-sequelize`

# Example
```js
var ExpressBruteStore = require('express-brute-store-sequelize');
var ExpressBrute = require('express-brute');
var Sequelize = require('sequelize');

var bruteOptions =  {
  freeRetries: 5,
  proxyDepth: 1,
  minWait: 2000, 
  maxWait: 2000, 
  lifetime : 2,     
  attachResetToRequest : false,
  refreshTimeoutOnRequest : false
}

var bruteStoreOptions = {
  tableName: 'ExpressBrute' // this is default name
  fields: { key: Sequelize.INTEGER } // you can merge model fields
}

var sequelize = new Sequelize(...);
var bruteStore = new ExpressBruteStore(sequelize, bruteStoreOptions);
var brute = new ExpressBrute(bruteStore, bruteOptions);
```

Sequelize model will be created after sequelize.sync() 

You can find model in `store.model`

# More
This transport has own method `.clear([lifetime], [callback])`

You can clear old data using this. Lifetime(seconds) option for filtering by "updateAt" field.
