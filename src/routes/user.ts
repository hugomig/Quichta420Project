import { FastifyInstance } from 'fastify';
import { connection } from '../lib/connection';
import { lightFilterUser, RelationshipStatus, User, filterUser, FilteredUser } from '../entities/User';
import { hashPassword } from '../lib/passwordEncryption';
import { checkIfUserIsMe, checkUserExists } from '../lib/utils';
import * as UserSchema from '../schemas/user.json';
import * as UserFiltredSchema from '../schemas/user.filtred.json';
import * as UserInputSchema from '../schemas/user.input.json';

export const userRoutes = async (fastify: FastifyInstance) => {
    fastify.route<{ Body: User }>({
        method: 'POST',
        url: '/',
        schema: {
            tags: ['User'],
            body: UserInputSchema,
            response: {
                200: UserSchema
            }
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
                res.status(200).send(lightFilterUser(newUser));
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
            tags: ['User'],
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: "string"
                    }
                }
            },
            description: "Show all usernames"
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

    fastify.route<{ Params: { username: string }}>({
        method: 'GET',
        url: '/:username',
        schema: {
            tags: ['User'],
            response: {
                200: {
                    anyOf: [
                        UserFiltredSchema,
                        UserSchema
                    ]
                }
            },
            description: "Show user infos and show more info for you than other users like birthdate and email for example",
            params: {
                username: {
                    type: 'string'
                }
            }
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const user = await checkUserExists(req.params.username, req, res);
            if(user === null) return;

            if(user.id === req.user.id){
                return res.status(200).send(lightFilterUser(user));
            }
            else {
                return res.status(200).send(filterUser(user));
            }
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
            tags: ['User'],
            body: {
                firstname: {
                    type: 'string'
                },
                lastname: {
                    type: 'string'
                },
                email: {
                    type: 'string'
                },
                birthdate: {
                    type: 'string'
                },
                relationshipStatus: {
                    type: 'string',
                    enum: ["single", "in a relationship", "maried", "not your business"]
                }
            },
            response: {
                200: UserSchema
            },
            params: {
                username: {
                    type: 'string'
                }
            }
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const user = await checkUserExists(req.params.username, req, res);
            if(user === null) return;
            if(!checkIfUserIsMe(user, req, res)) return;
            
            if(req.body.firstname) user.firstname = req.body.firstname;
            if(req.body.lastname) user.lastname = req.body.lastname;
            if(req.body.email) user.email = req.body.email;
            if(req.body.birthdate) user.birthdate = req.body.birthdate;
            if(req.body.relationshipStatus) user.relationshipStatus = req.body.relationshipStatus;

            await connection.getRepository(User).save(user);

            res.status(200).send(lightFilterUser(user));
        }
    });

    fastify.route<{ Params: { username: string }}>({
        method: 'DELETE',
        url: '/:username',
        schema: {
            tags: ['User'],
            response: {
                200: {
                    type: 'string'
                }
            },
            params: {
                username: {
                    type: 'string'
                }
            }
        },
        preValidation: async (req, res) => {
            fastify.verifyJwt(req, res);
        },
        handler: async (req, res) => {
            const user = await checkUserExists(req.params.username, req, res);
            if(user === null) return;
            if(!checkIfUserIsMe(user, req, res)) return;

            await connection.getRepository(User).delete(user);

            res.status(200).send("User successfully deleted");
        }
    });
}