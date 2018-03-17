import {Server} from 'restify';

export interface SwaggerPageOptions {
    title: string;
    version: string;
    server: Server;
    path: string;
    apis?: string[];
    definitions?: {[key: string]: any};
    routePrefix?: string;
    forceSecure?: boolean;
    host?: string;
    schemes: string[];
}

export function createSwaggerPage(options: SwaggerPageOptions): void;
