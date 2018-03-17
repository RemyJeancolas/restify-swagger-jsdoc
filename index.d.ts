import {Server} from 'restify';

export interface SwaggerPageOptions {
    title: string;
    version: string;
    server: Server;
    path: string;
    description?: string;
    tags?: SwaggerTag[];
    host?: string;
    schemes?: SwaggerScheme[];
    apis?: string[];
    definitions?: {[key: string]: any};
    routePrefix?: string;
    forceSecure?: boolean;
}

export type SwaggerScheme = 'http' | 'https' | 'ws' | 'wss';

export interface SwaggerTag {
    name: string;
    description: string;
}

export function createSwaggerPage(options: SwaggerPageOptions): void;
