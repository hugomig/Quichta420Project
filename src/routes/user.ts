import { FastifyInstance } from 'fastify';
import { connection } from '../lib/connection';
import { RelationshipStatus, User } from '../entities/User';
import { hashPassword } from '../lib/passwordEncryption';
import * as UserSchema from '../schemas/user.json';

export const userRoutes = async (fastify: FastifyInstance) => {
    fastify.route<{ Body: User }>({
        method: 'POST',
        url: '/',
        schema: {
            tags: ['User'],
            body: UserSchema
        },
        handler: async (req, res) => {
            try {
                const alreadyExistUsername = await connection.getRepository(User).findOne({ username: req.body.username });
                if(alreadyExistUsername) return res.status(400).send("Sorry this username is already taken");

                const alreadyExistEmail = await connection.getRepository(User).findOne({ email: req.body.email });
                if(alreadyExistEmail) return res.status(400).send("Sorry this email is already taken");

                const newUser = req.body;
                newUser.password = await hashPassword(req.body.password);
                await connection.getRepository(User).insert(newUser);
                res.status(200).send(`User ${req.body.username} successfully created`);
            }
            catch(err) {
                res.status(400).send('Error creating new user');
            }
        }
    });

    fastify.route({
        method: 'GET',
        url: '/',
        schema: {
            tags: ['User']
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const users = await connection.getRepository(User).find();
            const usernames = [];

            for(const user of users){
                usernames.push(user.username);
            }

            res.status(200).send({ usernames: usernames });
        }
    });

    fastify.route<{
        Body: {
            firstname?: string,
            lastname?: string, 
            email?: string,
            birthdate?: Date,
            relationshipStatus?: RelationshipStatus
        },
        Params: {
            username: string
        }
    }>({
        method: 'PATCH',
        url: '/:username',
        schema: {
            tags: ['User']
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const user = await connection.getRepository(User).findOne({ username: req.params.username });
            if(!user) return res.send(400).send("User not found, check username");

            if(user.id !== req.user.id) return res.status(400).send("You are not authorized to modify this user");
            
            if(req.body.firstname) user.firstname = req.body.firstname;
            if(req.body.lastname) user.lastname = req.body.lastname;
            if(req.body.email) user.email = req.body.email;
            if(req.body.birthdate) user.birthdate = req.body.birthdate;
            if(req.body.relationshipStatus) user.relationshipStatus = req.body.relationshipStatus;

            await connection.getRepository(User).save(user);

            res.status(200).send({ user: {
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                birthdate: user.birthdate,
                relationshipStatus: user.relationshipStatus
            }});
        }
    });

    fastify.route<{ Params: { username: string }}>({
        method: 'DELETE',
        url: '/:username',
        schema: {
            tags: ['User']
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const user = await connection.getRepository(User).findOne({ username: req.params.username });
            if(!user) return res.status(400).send("User not found");
            if(user.id !== req.user.id) return res.status(400).send("You are not authorized to delete this user");

            await connection.getRepository(User).delete(user);

            res.status(200).send("User successfully deleted");
        }
    });

    fastify.route<{ Params: { username: string }}>({
        method: 'GET',
        url: '/:username',
        schema: {
            tags: ['User']
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const user = await connection.getRepository(User).findOne({ username: req.params.username });
            if(!user) return res.status(400).send("Sorry this user doesn't exist");

            if(user.id === req.user.id){
                return res.status(200).send({
                    user: {
                        id: user.id,
                        username: user.username,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        email: user.email,
                        parties: user.parties,
                        receivedInvitations: user.receivedInvitations,
                        sentInvitations: user.sentInvitations,
                        birthdate: user.birthdate,
                        relationshipStatus: user.relationshipStatus
                    }
                });
            }
            else {
                return res.status(200).send({
                    user: {
                        id: user.id,
                        username: user.username,
                        birthdate: user.birthdate,
                        relationshipStatus: user.relationshipStatus
                    }
                });
            }
        }
    });
}