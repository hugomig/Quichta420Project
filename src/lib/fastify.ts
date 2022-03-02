import fastifyFactory, { FastifyRequest, FastifyReply } from 'fastify';
import fastifyJwt from 'fastify-jwt';
import fastifySwagger from 'fastify-swagger';
import { authRoutes } from '../routes/auth';
import { userRoutes } from '../routes/user';
import { partiesRoutes } from '../routes/parties';
import { swaggerOptions } from './swaggerOptions';

export const fastify = fastifyFactory({ logger: process.env.NODE_ENV !== 'test' })
    .register(fastifyJwt, {
        secret: process.env.JWT_SECRET_KEY
    })
    .decorate('verifyJwt', async (req: FastifyRequest, res: FastifyReply) => {
        try {
            await req.jwtVerify();
        }
        catch(err){
            res.send(err);
        }
    })
    .register(fastifySwagger, swaggerOptions)
    .register(authRoutes, { prefix: '/auth' })
    .register(userRoutes, { prefix: '/users'})
    .register(partiesRoutes, { prefix: '/parties' });