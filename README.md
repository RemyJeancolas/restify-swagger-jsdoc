# restify-swagger-jsdoc
Create Swagger documentation page based on jsdoc

[![Build Status](https://travis-ci.org/RemyJeancolas/restify-swagger-jsdoc.svg?branch=master)](https://travis-ci.org/RemyJeancolas/restify-swagger-jsdoc)
[![Coverage Status](https://coveralls.io/repos/github/RemyJeancolas/restify-swagger-jsdoc/badge.svg?branch=master)](https://coveralls.io/github/RemyJeancolas/restify-swagger-jsdoc?branch=master)
[![npm Version](https://img.shields.io/npm/v/restify-swagger-jsdoc.svg)](https://www.npmjs.com/package/restify-swagger-jsdoc)
[![npm Downloads](https://img.shields.io/npm/dm/restify-swagger-jsdoc.svg)](https://www.npmjs.com/package/restify-swagger-jsdoc)
[![Dependency Status](https://gemnasium.com/badges/github.com/RemyJeancolas/restify-swagger-jsdoc.svg)](https://gemnasium.com/github.com/RemyJeancolas/restify-swagger-jsdoc)

## Installation

### :warning: Check your restify version

**If you use a restify version prior to v7, you must use the following command:**
```bash
npm install restify-swagger-jsdoc@^1 --production
```
Else you can use the following command:
```bash
npm install restify-swagger-jsdoc --production
```

## Initialization

To initialize the swagger JSDoc page, simply add this lines to the file that loads your restify server :

```javascript
var restifySwaggerJsdoc = require('restify-swagger-jsdoc');
restifySwaggerJsdoc.createSwaggerPage({
    title: 'API documentation', // Page title (required)
    version: '1.0.0', // Server version (required)
    server: server, // Restify server instance created with restify.createServer() (required)
    path: '/docs/swagger', // Public url where the swagger page will be available (required)
    description: 'My great app', // A short description of the application. (default: '')
    tags: [{ // A list of tags used by the specification with additional metadata (default: [])
        name: 'Tag name',
        description: 'Tag description'
    }],
    host: 'google.com', // The host (name or ip) serving the API. This MUST be the host only and does not include the scheme nor sub-paths.
    schemes: [], // The transfer protocol of the API. Values MUST be from the list: "http", "https", "ws", "wss". (default: [])
    apis: [ `${__dirname}/controllers/*.js` ], // Path to the API docs (default: [])
    definitions: {myObject: require('api/myObject.json')}, // External definitions to add to swagger (default: [])
    routePrefix: 'prefix', // prefix to add for all routes (default: '')
    forceSecure: false // force swagger-ui to use https protocol to load JSON file (default: false)
});
```

With these settings, assuming that your server listens on port 80, the Swagger documentation page will be available at [http://localhost/docs/swagger](http://localhost/docs/swagger).  
The swagger.json file is available at [http://localhost/docs/swagger/swagger.json](http://localhost/docs/swagger/swagger.json).

## How to document the API

This module is based on [swagger-jsdoc](https://www.npmjs.com/package/swagger-jsdoc), so you can refer to this module's documentation to document your API.
