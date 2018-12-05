"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors = require("restify-errors");
const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");
const fs = require("fs");
const mime = require("mime-types");
function createSwaggerPage(options) {
    if (!options.title) {
        throw new Error('options.title is required');
    }
    else if (!options.version) {
        throw new Error('options.version is required');
    }
    else if (!options.server) {
        throw new Error('options.server is required');
    }
    else if (!options.path) {
        throw new Error('options.path is required');
    }
    const swaggerUiPath = path.dirname(require.resolve('swagger-ui-dist'));
    const swaggerSpec = swaggerJSDoc({
        swaggerDefinition: {
            info: {
                title: options.title,
                version: options.version,
                description: typeof options.description === 'string' ? options.description : undefined
            },
            openapi: '3.0.0',
            host: typeof options.host === 'string' ? options.host.replace(/\/+$/, '') : undefined,
            basePath: typeof options.routePrefix === 'string' ? `/${options.routePrefix.replace(/^\/+/, '')}` : '/',
            schemes: Array.isArray(options.schemes) ? options.schemes : undefined,
            tags: Array.isArray(options.tags) ? options.tags : []
        },
        apis: Array.isArray(options.apis) ? options.apis : []
    });
    if (options.components) {
        Object.keys(options.components).forEach(key => {
            swaggerSpec.components[key] = options.components[key];
        });
    }
    const publicPath = options.path.replace(/\/+$/, '');
    options.server.get(`${publicPath}/swagger.json`, (req, res, next) => {
        res.setHeader('Content-type', 'application/json');
        res.send(swaggerSpec);
        return next();
    });
    options.server.get(publicPath, (req, res, next) => {
        res.setHeader('Location', `${publicPath}/index.html`);
        res.send(302);
        return next();
    });
    options.server.get(`${publicPath}/*`, (req, res, next) => {
        const file = req.params['*'];
        fs.readFile(path.resolve(swaggerUiPath, file), (err, content) => {
            if (err) {
                return next(new errors.NotFoundError(`File ${file} does not exist`));
            }
            if (file === 'index.html') {
                const isReqSecure = options.forceSecure || req.isSecure();
                const jsonFileUrl = `${isReqSecure ? 'https' : 'http'}://${req.headers.host}${publicPath}/swagger.json`;
                content = new Buffer(content.toString().replace('url: "https://petstore.swagger.io/v2/swagger.json"', `url: "${jsonFileUrl}"`));
            }
            const contentType = mime.lookup(file);
            if (contentType !== false) {
                res.setHeader('Content-Type', contentType);
            }
            res.write(content);
            res.end();
            return next();
        });
    });
}
exports.createSwaggerPage = createSwaggerPage;
exports.default = { createSwaggerPage };
//# sourceMappingURL=index.js.map