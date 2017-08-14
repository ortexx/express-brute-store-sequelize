# express-brute-store-sequelize
Sequelize store for module express-brute

# Install 
`npm install express-brute-store-sequelize`

# Example
```js
const ExpressBruteStore = require('express-brute-store-sequelize');
const ExpressBrute = require('express-brute');
const Sequelize = require('sequelize');

const bruteOptions =  {
  freeRetries: 5,
  proxyDepth: 1,
  minWait: 2000, 
  maxWait: 2000, 
  lifetime : 2,     
  attachResetToRequest : false,
  refreshTimeoutOnRequest : false
}

const bruteStoreOptions = {
  tableName: 'ExpressBrute', // this is default name
  fields: { key: Sequelize.INTEGER }, // you can merge model fields
  modelOptions: { timestamps: false } // you can merge model options
}

const sequelize = new Sequelize(...);
const bruteStore = new ExpressBruteStore(sequelize, bruteStoreOptions);
const brute = new ExpressBrute(bruteStore, bruteOptions);
```

Sequelize model will be created after sequelize.sync() 

You can find model in `store.model`

# More
This transport has own method `.clear([lifetime], [callback])`

You can clear old data using this. Lifetime(seconds) option for filtering by "updateAt" field.
