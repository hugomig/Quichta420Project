import { FastifyInstance } from 'fastify';
import { Party } from '../entities/Party';
import { connection } from '../lib/connection';

export const itemRoutes = async (fastify : FastifyInstance) => {
    fastify.route({
        method: 'POST',
        url: '/',
        schema: {
            tags: ['Item']
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            res.send(200);
        }
    });

    fastify.route({
        method: 'GET',
        url: '/',
        schema: {
            tags: ['Item']
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            res.send(200);
        }
    })

    fastify.route<{ Params: { party: string }}>({
        method: 'GET',
        url: '/:party',
        schema: {
            tags: ['Item']
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const party = await connection.getRepository(Party).findOne({ id: req.params.party });
            if(!party) return res.status(400).send("Sorry this party doesn't exist");

            res.send(200);
        }
    });


}