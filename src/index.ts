import * as restify from 'restify';
import * as errors from 'restify-errors';
import * as swaggerJSDoc from 'swagger-jsdoc';
import * as path from 'path';
import * as fs from 'fs';
import * as mime from 'mime-types';

interface SwaggerPageOptions {
    title: string;
    version: string;
    server: restify.Server;
    path: string;
    description?: string;
    tags?: SwaggerTag[];
    host?: string;
    schemes?: SwaggerScheme[];
    apis?: string[];
    components?: {[key: string]: any};
    routePrefix?: string;
    forceSecure?: boolean;
}

type SwaggerScheme = 'http' | 'https' | 'ws' | 'wss';

interface SwaggerTag {
    name: string;
    description: string;
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
        // Add any external definitions provided
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
                content = new Buffer(content.toString().replace(
                    'url: "https://petstore.swagger.io/v2/swagger.json"',
                    `url: "${jsonFileUrl}"`
                ));
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

// tslint:disable-next-line:export-name
export default {createSwaggerPage}; // tslint:disable-line:no-default-export
