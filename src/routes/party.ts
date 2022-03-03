import { FastifyInstance } from 'fastify';
import { Party } from '../entities/Party';
import { User } from '../entities/User';
import { connection } from '../lib/connection';

export const partyRoutes = async (fastify: FastifyInstance) => {
    fastify.route<{ Body: Party }>({
        method: 'POST',
        url: '/',
        schema: {
            tags: ['Party']
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const insertedPary = await connection.getRepository(Party).insert(req.body);
            res.status(200).send(insertedPary.identifiers[0].id);
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
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const party = await connection.getRepository(Party).findOne({ id: req.params.id });
            if(!party) return res.status(400).send("Sorry this party doesn't exist");
            res.status(200).send(party);
        }
    });

    fastify.route<{ Params : { id: string }}>({
        method: 'PUT',
        url: '/:id',
        schema: {
            tags: ['Party']
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const id = parseInt(req.params.id);
            if(isNaN(id)) return res.status(400).send();
            return res.send(req.params.id);
        }
    });
}