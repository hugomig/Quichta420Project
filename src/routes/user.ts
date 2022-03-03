import { FastifyInstance } from 'fastify';
import { connection } from '../lib/connection';
import { User } from '../entities/User';
import { hashPassword } from '../lib/passwordEncryption';

export const userRoutes = async (fastify: FastifyInstance) => {
    fastify.route<{ Body: User }>({
        method: 'POST',
        url: '/',
        schema: {
            tags: ['User']
        },
        handler: async (req, res) => {
            try {
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
            if(user){
                res.status(200).send({ user: { id: user.id, username: user.username }});
            }
            else {
                res.status(200).send("Sorry this user doesn't exist");
            }
        }
    });
}