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
        }

        interface optionsDefinitionInfo {
            title: string;
            version: string;
        }
    }
    function swaggerJSDoc(options: swaggerJSDoc.options): swaggerJSDoc.options;
    export = swaggerJSDoc;
}
