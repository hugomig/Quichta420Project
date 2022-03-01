import { fastify } from 'fastify';

declare module 'fastify' {
    export interface FastifyInstance<
        HttpServer= Server,
        HttpRequest= IncomingMessage,
        HttpResponse= ServerResponse
    > {
        verifyJwt(req: FastifyRequest, res: FastifyResponse): void
    }
}
