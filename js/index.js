"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require("restify");
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
	const swaggerUiPath = path.dirname(require.resolve('swagger-ui'));
	const securityDefinitions = {};
	if (options.securityDefinitions) {
		Object.keys(options.securityDefinitions).forEach(key => {
			securityDefinitions[key] = options.securityDefinitions[key];
	});
	}
	const swaggerSpec = swaggerJSDoc({
		swaggerDefinition: {
			info: {
				title: options.title,
				version: options.version,
				description: typeof options.description === 'string' ? options.description : undefined
			},
			host: typeof options.host === 'string' ? options.host.replace(/\/+$/, '') : undefined,
			basePath: typeof options.routePrefix === 'string' ? `/${options.routePrefix.replace(/^\/+/, '')}` : '/',
			schemes: Array.isArray(options.schemes) ? options.schemes : undefined,
			tags: Array.isArray(options.tags) ? options.tags : [],
			securityDefinitions: securityDefinitions
		},
		apis: Array.isArray(options.apis) ? options.apis : []
	});
	if (options.definitions) {
		Object.keys(options.definitions).forEach(key => {
			swaggerSpec.definitions[key] = options.definitions[key];
	});
	}

	let internalPath = options.path.replace(/\/+$/, '');
	let externalPath = internalPath;

	if (typeof options.externalPath === 'string') {
		externalPath = options.externalPath.replace(/\/+$/, '');
	}

	options.server.get(`${internalPath}/swagger.json`, (req, res, next) => {
		res.setHeader('Content-type', 'application/json');
		res.send(swaggerSpec);
		return next();
	});
	options.server.get(new RegExp(internalPath + '\/?$'), (req, res, next) => {
		res.setHeader('Location', `${externalPath}/index.html`);
		res.send(302);
		return next();
	});
	options.server.get(new RegExp(internalPath + '\/(.*)$'), (req, res, next) => {
		fs.readFile(path.resolve(swaggerUiPath, req.params[0]), (err, content) => {
		if (err) {
			return next(new restify.NotFoundError(`File ${req.params[0]} does not exist`));
		}
		if (req.params[0] === 'index.html') {
		const isReqSecure = options.forceSecure || req.isSecure();
		const jsonFileUrl = `${externalPath}/swagger.json`;
		content = new Buffer(content.toString().replace('url = "http://petstore.swagger.io/v2/swagger.json"', `url = "${jsonFileUrl}"`));
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
exports.createSwaggerPage = createSwaggerPage;
exports.default = { createSwaggerPage };
//# sourceMappingURL=index.js.map
