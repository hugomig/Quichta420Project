import { SwaggerOptions } from "fastify-swagger"

export const swaggerOptions: SwaggerOptions = {
    routePrefix: '/doc',
    swagger: {
        info: {
            title: 'Quichta 420 project documentation',
            description: 'Organize your parties like a boss in order to organize a boss party',
            version: '0.1.0'
        },
        externalDocs: {
            url: 'http://github.com/hugomig/Quichta420Project',
            description: 'Click here to see our github repo :)'
        },
        host: 'localhost',
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json'],
        tags: [
            { name: 'Auth', description: 'Auth related end-points' },
            { name: 'User', description: 'User related end-points' },
            { name: 'Party', description: 'Party related end-points' },
            { name: 'Participation', description: 'Participation of an User to a Party related end-points' }
        ],
        definitions: {
            User: {
                type: 'object',
                required: ['id', 'email', 'firstName', 'lastName', 'username'],
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    username: { type: 'string' }
                }
            }
        },
        securityDefinitions: {
            bearerAuth: {
                type: 'apiKey',
                name: 'Authorization',
                in: 'header'
            }
        }
    },
    uiConfig: {
        docExpansion: 'list',
        deepLinking: false
    },
    /*uiHooks: {
        onRequest: function (request, reply, next) { next() },
        preHandler: function (request, reply, next) { next() }
    },*/
    staticCSP: true,
    transformStaticCSP: (header) => header,
    exposeRoute: true
}