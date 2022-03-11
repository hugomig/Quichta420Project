import { FastifyInstance } from 'fastify';
import { Invitation } from '../entities/Invitation';
import { Party } from '../entities/Party';
import { User } from '../entities/User';
import { connection } from '../lib/connection';
import { checkIsInvitedToParty, checkIsOrganizerForParty, checkPartyExists, checkUserExists } from '../lib/utils';
import * as PartySchema from '../schemas/party.json';

export const partyRoutes = async (fastify: FastifyInstance) => {
    fastify.route<{ Body: Party }>({
        method: 'POST',
        url: '/',
        schema: {
            tags: ['Party'],
            body: PartySchema
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const newParty = new Party();
            newParty.name = req.body.name;
            newParty.location = req.body.location;
            newParty.date = req.body.date;
            newParty.description = req.body.description;
            newParty.minimumAge = req.body.minimumAge;
            newParty.maximumAge = req.body.maximumAge;

            const user = await checkUserExists(req.user.username, req, res);
            if(user === null) return;

            newParty.creator = user;

            const insertedPary = await connection.getRepository(Party).insert(newParty);
            res.status(200).send(insertedPary.identifiers[0].id);
        }
    });

    fastify.route({
        method: 'GET',
        url: '/',
        schema: {
            tags: ['Party'],
            description: "Get all the parties which you are invited at"
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const user = await checkUserExists(req.user.username, req, res);
            if(user === null) return;

            const invitations = await connection.getRepository(Invitation).find({ user: user });

            const invitedParties: Party[] = []
            for(const invitation of invitations) {
                invitedParties.push(invitation.party);
            }

            const createdParties = await connection.getRepository(Party).find({ creator: user });

            res.status(200).send({ invitedParties: invitedParties, createdParties: createdParties });
        }
    });

    fastify.route<{ Params: { username: string }}>({
        method: 'GET',
        url: '/user/:username',
        schema: {
            tags: ['Party'],
            description: "Get all parties of a certain user which you are invited at"
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const user = await checkUserExists(req.params.username, req, res);
            if(user === null) return;

            const parties = await connection.getRepository(Party).find({ creator: user });

            if(user.id === req.user.id){
                return res.status(200).send({ parties: parties });
            }
            else {
                const invitedParties: Party[] = [];
                for(const party of parties){
                    const invitations = await connection.getRepository(Invitation).find({ party: party });
                    for(const invitation of invitations){
                        if(invitation.user.id === req.user.id){
                            invitedParties.push(party);
                            break;
                        }
                    }
                }
                return res.status(200).send({ parties: invitedParties });
            }
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
            const party = await checkPartyExists(req.params.id, req, res);
            if(party === null) return;

            const user = await checkUserExists(req.user.username, req, res);
            if(user === null) return;

            const myParty = await connection.getRepository(Party).findOne({ id: req.params.id, creator: user });
            if(myParty) return res.status(200).send(party);

            const invitation = await checkIsInvitedToParty(party, user, req, res);
            if(invitation === null) return;

            res.status(200).send(party);
        }
    });

    fastify.route<{
        Params : {
            id: string
        },
        Body: {
            name?: string,
            location?: string,
            date?: Date,
            description?: string,
            minimumAge?: number,
            maximumAge?: number,

        }
    }>({
        method: 'PATCH',
        url: '/:id',
        schema: {
            tags: ['Party']
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const party = await checkPartyExists(req.params.id, req, res);
            if(party === null) return;

            const user = await checkUserExists(req.user.username, req, res);
            if(user === null) return;

            if(!await checkIsOrganizerForParty(party, user, req, res)) return;

            if(req.body.name) party.name = req.body.name;
            if(req.body.location) party.location = req.body.location;
            if(req.body.date) party.date = req.body.date;
            if(req.body.description) party.description = req.body.description;
            if(req.body.minimumAge) party.minimumAge = req.body.minimumAge;
            if(req.body.maximumAge) party.maximumAge = req.body.maximumAge;

            await connection.getRepository(Party).save(party);

            res.status(200).send(party);
        }
    });

    fastify.route<{ Params: { id: string }}>({
        method: 'DELETE',
        url: '/:id',
        schema: {
            tags: ['Party']
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const party = await checkPartyExists(req.params.id, req, res);
            if(party === null) return;

            const user= await checkUserExists(req.user.username, req, res);
            if(user === null) return;

            if(!await checkIsOrganizerForParty(party, user, req, res)) return;

            await connection.getRepository(Party).remove(party);

            res.status(200).send("Party successfully deleted");
        }
    });
}