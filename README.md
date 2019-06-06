# restify-swagger-jsdoc
Create Swagger documentation page based on jsdoc

[![Build Status](https://travis-ci.org/RemyJeancolas/restify-swagger-jsdoc.svg?branch=master)](https://travis-ci.org/RemyJeancolas/restify-swagger-jsdoc)
[![Coverage Status](https://coveralls.io/repos/github/RemyJeancolas/restify-swagger-jsdoc/badge.svg?branch=master)](https://coveralls.io/github/RemyJeancolas/restify-swagger-jsdoc?branch=master)
[![npm Version](https://img.shields.io/npm/v/restify-swagger-jsdoc.svg)](https://www.npmjs.com/package/restify-swagger-jsdoc)
[![npm Downloads](https://img.shields.io/npm/dm/restify-swagger-jsdoc.svg)](https://www.npmjs.com/package/restify-swagger-jsdoc)

## Installation

### :warning: Check your restify version

**If you use a restify version prior to v7, you must use the following command:**
```bash
npm install restify-swagger-jsdoc@^1
```
Else you can use the following command:
```bash
npm install restify-swagger-jsdoc
```

## Initialization

### Minimal example

To initialize the swagger JSDoc page, simply add these lines to the file that loads your restify server :

```javascript
var restifySwaggerJsdoc = require('restify-swagger-jsdoc');
restifySwaggerJsdoc.createSwaggerPage({
    title: 'API documentation', // Page title
    version: '1.0.0', // Server version
    server: server, // Restify server instance created with restify.createServer()
    path: '/docs/swagger' // Public url where the swagger page will be available
});
```

With these settings, assuming that your server listens on port 80, the Swagger documentation page will be available at [http://localhost/docs/swagger](http://localhost/docs/swagger).  
The swagger.json file is available at [http://localhost/docs/swagger/swagger.json](http://localhost/docs/swagger/swagger.json).  

See below for a complete list of supported parameters.

### Supported parameters

|Name|Type|Required|Description|Default value|
|-----|:-----:|:-----:|-----|-----|
|title|`string`|**Required**|Page title||
|version|`string`|**Required**|Server version||
|server|`Server`|**Required**|Restify server instance created with `restify.createServer()`||
|path|`string`|**Required**|Public url where the swagger page will be available||
|description|`string`|Optional|A short description of the application|`''`|
|tags|[`Tag[]`](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#tagObject)|Optional|A list of tags used by the specification with additional metadata|`[]`|
|host|`string`|Optional|The host (name or ip) serving the API. This MUST be the host only and does not include the scheme nor sub-paths|`undefined`|
|schemes|`string[]`|Optional|The transfer protocol of the API. Values MUST be from the list: `'http'`, `'https'`, `'ws'`, `'wss'`|`[]`|
|apis|`string[]`|Optional|Path(s) to the API docs|`[]`|
|definitions|[`Definitions`](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#definitionsObject)|Optional|External definitions to add to swagger|`[]`|
|routePrefix|`string`|Optional|Prefix to add for all routes|`''`|
|forceSecure|`boolean`|Optional|Force swagger-ui to use https protocol to load JSON file|`false`|
|validatorUrl|`string`|Optional|Validate specs against given validator, set to `null` to disable validation|`'https://online.swagger.io/validator'`|
|supportedSubmitMethods|`string[]`|Optional|List of HTTP methods that have the Try it out feature enabled. An empty array disables Try it out for all operations|`['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']`|
|securityDefinitions|[`SecurityDefinitions`](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#securityDefinitionsObject)|Optional|List of authentication methods available for the current API, available when clicking on the "Authorize" button on the UI (more detail [here](https://swagger.io/docs/specification/2-0/authentication/))|`undefined`|

## How to document the API

This module is based on [swagger-jsdoc](https://www.npmjs.com/package/swagger-jsdoc), so you can refer to this module's documentation to document your API.
