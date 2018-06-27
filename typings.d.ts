declare module 'swagger-jsdoc' {
    namespace swaggerJSDoc {
        interface options {
            swaggerDefinition: optionsDefinition;
            apis: string[];
            definitions?: {[key: string]: any};
            paths?: {[key: string]: string};
        }

        interface optionsDefinition {
            info: optionsDefinitionInfo;
            host?: string;
            basePath?: string;
            schemes?: ('http' | 'https' | 'ws' | 'wss')[];
            tags?: {name: string, description: string}[];
            securityDefinitions?: {[key: string]: any};
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
