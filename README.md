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
}

var sequelize = new Sequelize(...);
var bruteStore = new ExpressBruteStore(sequelize, bruteStoreOptions);
var brute = new ExpressBrute(bruteStore, bruteOptions);
```

Sequelize model will be created after sequelize.sync() 

# More
This transport has its own method `.clear([lifetime])`

You can clear table using this. Lifetime option for filtering by "updateAt" field.
