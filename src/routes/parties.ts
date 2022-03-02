import { FastifyInstance } from 'fastify';
import { Party } from '../entities/Party';
import { User } from '../entities/User';
import { connection } from '../lib/connection';

export const partiesRoutes = async (fastify: FastifyInstance) => {
    fastify.route<{ Body: Party }>({
        method: 'POST',
        url: '/',
        schema: {
            tags: ['Party']
        },
        handler: async (req, res) => {
            return res.send(200);
        }
    });

    fastify.route({
        method: 'GET',
        url: '/',
        schema: {
            tags: ['Party']
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const test = req.user.id
            const parties = await connection.getRepository(Party).find();
            return res.send(test);
        }
    });

    fastify.route<{ Params: { id: string }}>({
        method: 'GET',
        url: '/:id',
        schema: {
            tags: ['Party']
        },
        handler: async (req, res) => {
            const id = parseInt(req.params.id);
            if(isNaN(id)) return res.status(400).send();
            return res.send(id);
        }
    });

    fastify.route<{ Params : { id: string }}>({
        method: 'PUT',
        url: '/:id',
        schema: {
            tags: ['Party']
        },
        handler: async (req, res) => {
            const id = parseInt(req.params.id);
            if(isNaN(id)) return res.status(400).send();
            return res.send(req.params.id);
        }
    });
}