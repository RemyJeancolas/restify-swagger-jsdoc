import { Server } from 'restify';

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
    validatorUrl?: string;
    supportedSubmitMethods?: SwaggerSupportedHttpMethods[];
    securityDefinitions?: {[k: string]: SwaggerSecurityDefinition};
}

export type SwaggerScheme = 'http' | 'https' | 'ws' | 'wss';
export type SwaggerSupportedHttpMethods = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';

export interface SwaggerTag {
    name: string;
    description: string;
}

interface SwaggerSecurityDefinitionBase {
    description?: string;
}
interface SwaggerSecurityDefinitionBasic extends SwaggerSecurityDefinitionBase {
    type: 'basic';
}
interface SwaggerSecurityDefinitionApiKey extends SwaggerSecurityDefinitionBase {
    type: 'apiKey';
    name: string;
    in: 'query' | 'header';
}
interface SwaggerSecurityDefinitionOAuth2Base extends SwaggerSecurityDefinitionBase {
    type: 'oauth2';
    scopes: {[k: string]: string};
}
interface SwaggerSecurityDefinitionOauth2WithAuthorizationUrl extends SwaggerSecurityDefinitionOAuth2Base {
    flow: 'implicit';
    authorizationUrl: string;
}
interface SwaggerSecurityDefinitionOauth2WithTokenUrl extends SwaggerSecurityDefinitionOAuth2Base {
    flow: 'password' | 'application';
    tokenUrl: string;
}
interface SwaggerSecurityDefinitionOauth2WithAuthorizationAndTokenUrl extends SwaggerSecurityDefinitionOAuth2Base {
    flow: 'accessCode';
    authorizationUrl: string;
    tokenUrl: string;
}
type SwaggerSecurityDefinitionOAuth2 = SwaggerSecurityDefinitionOauth2WithAuthorizationUrl |
SwaggerSecurityDefinitionOauth2WithTokenUrl | SwaggerSecurityDefinitionOauth2WithAuthorizationAndTokenUrl;
type SwaggerSecurityDefinition = SwaggerSecurityDefinitionBasic | SwaggerSecurityDefinitionApiKey | SwaggerSecurityDefinitionOAuth2;

export function createSwaggerPage(options: SwaggerPageOptions): void;
