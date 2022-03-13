import { SwaggerOptions } from "fastify-swagger";
import * as UserSchema from '../schemas/user.json';
import * as PartySchema from '../schemas/party.filtred.json';
import * as InvitationSchema from '../schemas/invitation.filtered.json';
import * as ItemSchema from '../schemas/item.filtered.json';

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
        host: 'localhost:3000',
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json'],
        tags: [
            { name: 'Auth', description: 'Auth related end-points' },
            { name: 'User', description: 'User related end-points' },
            { name: 'Party', description: 'Party related end-points' },
            { name: 'Invitation', description: 'Invitation of an User to a Party related end-points' },
            { name: 'Item', description: 'Consumption of an invitation related end-points'}
        ],
        definitions: {
            User: UserSchema,
            Party: PartySchema,
            Invitation: InvitationSchema,
            Item: ItemSchema
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