# restify-swagger-jsdoc
Create Swagger documentation page based on jsdoc

[![npm Version](https://img.shields.io/npm/v/restify-swagger-jsdoc.svg)](https://www.npmjs.com/package/restify-swagger-jsdoc)
[![npm Downloads](https://img.shields.io/npm/dm/restify-swagger-jsdoc.svg)](https://www.npmjs.com/package/restify-swagger-jsdoc)
[![Dependency Status](https://gemnasium.com/badges/github.com/RemyJeancolas/restify-swagger-jsdoc.svg)](https://gemnasium.com/github.com/RemyJeancolas/restify-swagger-jsdoc)

## Installation
```bash
npm install restify-swagger-jsdoc
```
## Initialization
To initialize the swagger JSDoc page, simply add this lines to the file that loads your restify server :
```javascript
var restifySwaggerJsdoc = require('restify-swagger-jsdoc');
restifySwaggerJsdoc.createSwaggerPage({
    title: 'API documentation', // Page title (required)
    version: '1.0.0', // Server version (required)
    server: server, // Restify server instance created with restify.createServer()
    path: '/docs/swagger', // Public url where the swagger page will be available
    apis: [ `${__dirname}/controllers/*.js` ] // Path to the API docs
});
```
With these settings, assuming that your server listens on port 80, the Swagger documentation page will be available at [http://localhost/docs/swagger](http://localhost/docs/swagger).
The swagger.json file is available at [http://localhost/docs/swagger/swagger.json](http://localhost/docs/swagger/swagger.json).
## How to document the API
This module is based on [swagger-jsdoc](https://www.npmjs.com/package/swagger-jsdoc), so you can refer to this module's documentation to document your API.