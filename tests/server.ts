import { createServer } from 'restify';
import { expect } from 'chai';
import * as swaggerDoc from '../src/index';

const server = createServer();

swaggerDoc.createSwaggerPage({
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
    // definitions: {myObject: require('api/myObject.json')}, // External definitions to add to swagger (default: [])
    routePrefix: 'prefix', // prefix to add for all routes (default: '')
    forceSecure: false // force swagger-ui to use https protocol to load JSON file (default: false)
});

describe('restify server', () => {
    before(() => {
        server.listen(8081);
    });

    after(() => {
        server.close();
    });

    it('server is up', () => {
        const serverAddress = server.server.address();
        expect(serverAddress).to.include({ port: 8081 });
    });
});
