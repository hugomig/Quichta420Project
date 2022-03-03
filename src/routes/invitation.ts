import { FastifyInstance } from 'fastify';
import { Invitation } from '../entities/Invitation';
import { Party } from '../entities/Party';
import { User } from '../entities/User';
import { connection } from '../lib/connection';
import * as InvitationSchema from '../schemas/invitation.json';

export const invitationRoutes = async (fastify: FastifyInstance) => {
    fastify.route<{ Body: { user: string, party: string } }>({
        method: 'POST',
        url: '/',
        schema: {
            tags: ['Invitation'],
            body: InvitationSchema
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const user = await connection.getRepository(User).findOne({ id: req.body.user });
            if(!user) return res.status(400).send("User not found verify the user id");
            const party = await connection.getRepository(Party).findOne({ id: req.body.party });
            if(!party) return res.status(400).send("Party not found verify the party id");

            const newInvitation = new Invitation();
            newInvitation.user = user;
            newInvitation.party = party;

            const invitor = await connection.getRepository(User).findOne({ id: req.user.id });
            if(!invitor) return res.status(400).send("Unexpected error check your auth token");

            newInvitation.invitor = invitor;
            await connection.getRepository(Invitation).insert(newInvitation);

            res.status(200).send(newInvitation.id);
        }
    });

    fastify.route<{ Params: { id: string }}>({
        method: 'GET',
        url: '/party/:id',
        schema: {
            tags: ['Invitation']
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const party = await connection.getRepository(Party).findOne({ id: req.params.id });
            if(!party) return res.status(400).send("Sorry, this party doesn't exist");

            res.status(200).send(party.name);
        }
    });

    fastify.route<{ Params: { id: string }}>({
        method: 'GET',
        url: '/user/:id',
        schema: {
            tags: ['Invitation']
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const user = await connection.getRepository(User).findOne({ id: req.params.id });
            if(!user) return res.status(400).send("Sorry, this user doesn't exist");
            
            res.status(200).send(user.username);
        }
    });
}