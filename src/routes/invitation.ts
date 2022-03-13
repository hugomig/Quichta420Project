import { FastifyInstance } from 'fastify';
import { FilteredInvitation, filterInvitation, Invitation, UserRole } from '../entities/Invitation';
import { Party } from '../entities/Party';
import { User } from '../entities/User';
import { connection } from '../lib/connection';
import { checkIfUserIsAbleToDeleteInvitation, checkIfUserIsMe, checkInvitationExists, checkIsInvitedToParty, checkIsInvitorForParty, checkIsOrganizerForParty, checkPartyExists, checkUserExists } from '../lib/utils';
import * as InvitationInputSchema from '../schemas/invitation.input.json';
import * as FilteredInvitationSchema from '../schemas/invitation.filtered.json';

export const invitationRoutes = async (fastify: FastifyInstance) => {
    fastify.route<{ Body: { username: string, partyId: string } }>({
        method: 'POST',
        url: '/',
        schema: {
            tags: ['Invitation'],
            body: InvitationInputSchema,
            response: {
                200: FilteredInvitationSchema
            }
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const user = await checkUserExists(req.body.username, req, res);
            if(user === null) return;

            const party = await checkPartyExists(req.body.partyId, req, res);
            if(party === null) return;

            const me = await checkUserExists(req.user.username, req, res);
            if(me === null) return;

            if(!await checkIsInvitorForParty(party, me, req, res)) return;

            const newInvitation = new Invitation();
            newInvitation.user = user;
            newInvitation.party = party;

            const invitor = await connection.getRepository(User).findOne({ id: req.user.id });
            if(!invitor) return res.status(400).send("Unexpected error check your auth token");

            newInvitation.invitor = invitor;
            await connection.getRepository(Invitation).insert(newInvitation);

            res.status(200).send(filterInvitation(newInvitation));
        }
    });

    fastify.route({
        method: 'GET',
        url: '/',
        schema: {
            tags: ['Invitation'],
            response: {
                200: {
                    receivedInvitations: {
                        type: "array",
                        items: FilteredInvitationSchema
                    },
                    sentInvitations: {
                        type: "array",
                        items: FilteredInvitationSchema
                    }
                }
            }
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const user = await checkUserExists(req.user.username, req, res);
            if(user === null) return;

            const receivedInvitations = await connection.getRepository(Invitation).find({ user: user });
            const sentInvitations = await connection.getRepository(Invitation).find({ invitor: user });

            const response: { receivedInvitations: FilteredInvitation[], sentInvitations: FilteredInvitation[] } = {
                receivedInvitations: [],
                sentInvitations: []
            }

            for(const invitation of receivedInvitations){
                response.receivedInvitations.push(filterInvitation(invitation));
            }
            
            for(const invitation of sentInvitations){
                response.sentInvitations.push(filterInvitation(invitation));
            }

            res.status(200).send(response);
        }
    })

    fastify.route<{ Params: { partyId: string }}>({
        method: 'GET',
        url: '/party/:partyId',
        schema: {
            tags: ['Invitation'],
            response: {
                200: {
                    type: "array",
                    items: FilteredInvitationSchema
                }
            },
            params: {
                partyId: {
                    type: "string"
                }
            },
            description: "Show every invitation for a certain party wich you are invited at"
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const party = await checkPartyExists(req.params.partyId, req, res);
            if(party === null) return;

            const user = await checkUserExists(req.user.username, req, res);
            if(user === null) return;

            if(!await checkIsInvitedToParty(party, user, req, res)) return;

            const partyInvitations = await connection.getRepository(Invitation).find({ party: party });
            const filteredPartyInvitations: FilteredInvitation[] = [];
            for(const invitation of partyInvitations) {
                filteredPartyInvitations.push(filterInvitation(invitation));
            }

            res.status(200).send(filteredPartyInvitations);
        }
    });

    fastify.route<{
        Params: {
            id: string
        },
        Body: {
            accepted?: boolean,
            role?: UserRole
        }
    }>({
        method: 'PATCH',
        url: '/:id',
        schema: {
            tags: ['Invitation'],
            response: {
                200: FilteredInvitationSchema
            },
            params: {
                id: {
                    type: 'string'
                }
            }
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const invitation = await checkInvitationExists(req.params.id, req, res);
            if(invitation === null) return;

            if(req.body.role){
                const user = await checkUserExists(req.user.username, req, res);
                if(user === null) return;

                if(!await checkIsOrganizerForParty(invitation.party, user, req, res)) return;

                invitation.role = req.body.role;
            }
            
            if(req.body.accepted){
                if(!checkIfUserIsMe(invitation.user, req, res)) return;

                invitation.accepted = req.body.accepted;
            }

            await connection.getRepository(Invitation).save(invitation);

            return res.status(200).send(filterInvitation(invitation));
        }
    });

    fastify.route<{ Params: { id: string }}>({
        method: 'DELETE',
        url: '/:id',
        schema: {
            tags: ['Invitation'],
            response: {
                200: {
                    type: "string"
                }
            },
            params: {
                id: {
                    type: "string"
                }
            }
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const invitation = await checkInvitationExists(req.params.id, req, res);
            if(invitation === null) return;
            
            const user = await checkUserExists(req.user.username, req, res);
            if(user === null) return;

            if(!await checkIfUserIsAbleToDeleteInvitation(invitation, user, req, res)) return;

            await connection.getRepository(Invitation).remove(invitation);

            res.status(200).send("Invitation successfully deleted");
        }
    })
}