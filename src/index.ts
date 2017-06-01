import * as restify from 'restify';
import * as swaggerJSDoc from 'swagger-jsdoc';
import * as path from 'path';
import * as fs from 'fs';
import * as mime from 'mime-types';

interface SwaggerPageOptions {
    title: string;
    version: string;
    server: restify.Server;
    path: string;
    apis?: string[];
    definitions?: {[key: string]: any};
    routePrefix?: string;
    forceSecure?: boolean;
}

export function createSwaggerPage(options: SwaggerPageOptions): void {
    if (!options.title) {
        throw new Error('options.title is required');
    } else if (!options.version) {
        throw new Error('options.version is required');
    } else if (!options.server) {
        throw new Error('options.server is required');
    } else if (!options.path) {
        throw new Error('options.path is required');
    }

    const swaggerUiPath = path.dirname(require.resolve('swagger-ui'));

    const swaggerSpec = swaggerJSDoc({
        swaggerDefinition: {
            info: {
                title: options.title,
                version: options.version
            },
        },
        apis: options.apis || []
    });

    if (options.definitions) {
        // Add any external definitions provided
        Object.keys(options.definitions).forEach(key => {
            swaggerSpec.definitions[key] = options.definitions[key];
        });
    }

    // Prepend route prefix if needed
    if (options.routePrefix && swaggerSpec.hasOwnProperty('paths')) {
        Object.keys(swaggerSpec.paths).forEach(key => {
            swaggerSpec.paths['/' + options.routePrefix + key] = swaggerSpec.paths[key];
            delete(swaggerSpec.paths[key]);
        });
    }

    const publicPath = options.path.replace(/\/+$/, '');

    options.server.get(`${publicPath}/swagger.json`, (req, res, next) => {
        res.setHeader('Content-type', 'application/json');
        res.send(swaggerSpec);
        return next();
    });

    options.server.get(new RegExp(publicPath + '\/?$'), (req, res, next) => {
        res.setHeader('Location', `${publicPath}/index.html`);
        res.send(302);
        return next();
    });

    options.server.get(new RegExp(publicPath + '\/(.*)$'), (req, res, next) => {
        fs.readFile(path.resolve(swaggerUiPath, req.params[0]), (err, content) => {
            if (err) {
                return next(new restify.NotFoundError(`File ${req.params[0]} does not exist`));
            }

            if (req.params[0] === 'index.html') {
                const isReqSecure = options.forceSecure || req.isSecure();
                const jsonFileUrl = `${isReqSecure ? 'https' : 'http'}://${req.headers.host}${publicPath}/swagger.json`;
                content = new Buffer(content.toString().replace(
                    'url = "http://petstore.swagger.io/v2/swagger.json"',
                    `url ="${jsonFileUrl}"`
                ));
            }

            const contentType = mime.lookup(req.params[0]);
            if (contentType !== false) {
                res.setHeader('Content-Type', contentType);
            }

            res.write(content);
            res.end();
            return next();
        });
    });
}

export default {createSwaggerPage}; // tslint:disable-line:no-default-export
