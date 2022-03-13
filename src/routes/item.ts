import { FastifyInstance } from 'fastify';
import { Invitation } from '../entities/Invitation';
import { FilteredItem, filterItem, Item, ItemType } from '../entities/Item';
import { Party } from '../entities/Party';
import { checkInvitationExists, checkIsInvitedToParty, checkItemExists, checkItemIsAccessibleUser, checkItemIsEditableFromUser, checkPartyExists, checkUserExists } from '../lib/utils';
import { connection } from '../lib/connection';
import * as ItemInputSchema from '../schemas/item.input.json';
import * as ItemFilteredSchema from '../schemas/item.filtered.json';

interface PostItemBodyType {
    type?: ItemType,
    name: string,
    description?: string,
    quantity?: number,
    invitation: string
}

export const itemRoutes = async (fastify : FastifyInstance) => {

    fastify.route<{Body: PostItemBodyType}>({
        method: 'POST',
        url: '/',
        schema: {
            tags: ['Item'],
            body: ItemInputSchema,
            response: {
                200: ItemFilteredSchema
            }
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const invitation = await checkInvitationExists(req.body.invitation, req, res);
            if(invitation === null) return;

            if(invitation.user.username !== req.user.username){
                return res.status(400).send("The user adding the item should be the one who received the invitation");
            }

            const newItem = new Item();

            newItem.invitation = invitation;

            if(req.body.type) newItem.type = req.body.type;
            if(req.body.description) newItem.description = req.body.description;
            if(req.body.quantity) newItem.quantity = req.body.quantity;
            newItem.name = req.body.name;

            await connection.getRepository(Item).insert(newItem);

            res.status(200).send(filterItem(newItem));
        }
    });

    fastify.route({
        method: 'GET',
        url: '/',
        schema: {
            tags: ['Item'],
            response: {
                200: {
                    type: 'array',
                    items: ItemFilteredSchema
                }
            }
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const user = await checkUserExists(req.user.username, req, res);
            if(user === null) return;

            const allItems: FilteredItem[] = [];
            const invitations = await connection.getRepository(Invitation).find({ user: user });
            for(const invitation of invitations) {
                const items = await connection.getRepository(Item).find({ invitation: invitation });
                for(const item of items){
                    allItems.push(filterItem(item));
                }
            }

            res.status(200).send(allItems);
        }
    });

    fastify.route<{ Params: { id: string } }>({
        method: 'GET',
        url: '/:id',
        schema: {
            tags: ['Item'],
            params: {
                id: {
                    type: 'string'
                }
            },
            response: {
                200: ItemFilteredSchema
            }
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const user = await checkUserExists(req.user.username, req, res);
            if(user === null) return;

            const item = await checkItemExists(req.params.id, req, res);
            if(item == null) return;

            if(!checkItemIsAccessibleUser(item, user, req, res)) return;

            res.status(200).send(filterItem(item));
        }
    });

    fastify.route<{ Params: { partyId: string }}>({
        method: 'GET',
        url: '/party/:partyId',
        schema: {
            tags: ['Item'],
            params: {
                partyId: {
                    type: 'string'
                }
            },
            response: {
                200: {
                    type: 'array',
                    item: ItemFilteredSchema
                }
            }
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const user = await checkUserExists(req.user.username, req, res);
            if(user === null) return;

            const party = await checkPartyExists(req.params.partyId, req, res);
            if(party === null) return;

            if(!await checkIsInvitedToParty(party, user, req, res)) return;

            const allItems: FilteredItem[] = [];
            const invitations = await connection.getRepository(Invitation).find({ party: party });
            for(const invitation of invitations) {
                const items = await connection.getRepository(Item).find({ invitation: invitation });
                for(const item of items) {
                    allItems.push(filterItem(item));
                }
            }

            res.status(200).send(allItems);
        }
    });

    fastify.route<{ 
        Params: {
            id: string
        },
        Body: { 
            type?: ItemType,
            name?: string,
            description?: string,
            quantity?: number,
        }
    }>({
            method: 'PATCH',
            url: '/:id',
            schema: {
                tags: ['Item'],
                params: {
                    id: {
                        type: 'string'
                    }
                },
                response: {
                    200: ItemFilteredSchema
                }
            },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const user = await checkUserExists(req.user.username, req, res);
            if(user === null) return;

            const item = await checkItemExists(req.params.id, req, res);
            if(item === null) return;

            if(!checkItemIsEditableFromUser(item, user, req, res)) return;
            
            if(req.body.type) item.type = req.body.type;
            if(req.body.name) item.name = req.body.name;
            if(req.body.description) item.description = req.body.description;
            if(req.body.quantity) item.quantity = req.body.quantity;

            await connection.getRepository(Item).save(item);

            res.status(200).send(filterItem(item));
        }
    });

    fastify.route<{
        Params: {id: string }
    }>({
        method: 'DELETE',
        url: '/:id',
        schema: {
            tags: ['Item'],
            params: {
                id: {
                    type: 'string'
                }
            },
            response: {
                200: {
                    type: 'string'
                }
            }
        },
        preValidation: async(req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const user = await checkUserExists(req.user.username, req, res);
            if(user === null) return;

            const item = await checkItemExists(req.params.id, req, res);
            if(item === null) return;

            if(!checkItemIsEditableFromUser(item, user, req, res)) return;

            await connection.getRepository(Item).delete(item);

            res.status(200).send("The item was successfully deleted");
        }
    });

}