import { FastifyInstance } from 'fastify';
import { Invitation } from '../entities/Invitation';
import { Item, ItemType } from '../entities/Item';
import { Party } from '../entities/Party';
import { checkItemExists } from '../lib/utils';
import { connection } from '../lib/connection';
import * as ItemSchema from '../schemas/item.json';

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
            body: ItemSchema
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const newItem = new Item();

            const invitation = await connection.getRepository(Invitation).findOne({ id: req.body.invitation });
            if(!invitation) return res.status(400).send("Sorry this invitation doesnt exist");


            if(invitation.user.username !== req.user.username){
                return res.status(400).send("The user adding the item should be the one who received the invitation");
            }

            newItem.invitation = invitation;

            if(req.body.type) newItem.type = req.body.type;
            if(req.body.description) newItem.description = req.body.description;
            if(req.body.quantity) newItem.quantity = req.body.quantity;
            newItem.name = req.body.name;

            await connection.getRepository(Item).insert(newItem);

            res.status(200).send(newItem.id);
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
    });

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
                tags: ['Item']
            },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const item = await checkItemExists(req.params.id, req, res);
            if(item === null) return;
            
            if(req.body.type) item.type = req.body.type;
            if(req.body.name) item.name = req.body.name;
            if(req.body.description) item.description = req.body.description;
            if(req.body.quantity) item.quantity = req.body.quantity;

            await connection.getRepository(Item).save(item);

            res.status(200).send(item);
        }
        });

    fastify.route<{
        Params: {id: string }
    }>({
        method: 'DELETE',
        url: '/:id',
        schema: {tags: ['Item']},
    preValidation: async(req, res) => {
        fastify.verifyJwt(req, res);
    },
    handler: async (req, res) => {
        const item = await checkItemExists(req.params.id, req, res);
        if(item === null) return;

        if( item.invitation.user.username !== req.user.username ){
            res.status(400).send("The user deleting the item should be the one who received the invitation")
        }

        await connection.getRepository(Item).delete(item);

        res.status(200).send("The item was successfully deleted")
    }
})

}