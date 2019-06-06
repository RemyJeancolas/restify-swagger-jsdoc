declare module 'swagger-jsdoc' {
    namespace swaggerJSDoc {
        interface options {
            swaggerDefinition: optionsDefinition;
            apis: string[];
            definitions?: {[key: string]: any};
            paths?: {[key: string]: string};
            securityDefinitions?: {[k: string]: any};
        }

        interface optionsDefinition {
            info: optionsDefinitionInfo;
            host?: string;
            basePath?: string;
            schemes?: ('http' | 'https' | 'ws' | 'wss')[];
            tags?: {name: string, description: string}[];
        }

        interface optionsDefinitionInfo {
            title: string;
            version: string;
            description?: string;
        }
    }
    function swaggerJSDoc(options: swaggerJSDoc.options): swaggerJSDoc.options;
    export = swaggerJSDoc;
}
