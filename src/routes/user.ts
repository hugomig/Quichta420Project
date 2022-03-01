import { FastifyInstance } from 'fastify';
import { connection } from '../lib/connection';
import { User } from '../entities/User';
import { hashPassword } from '../lib/passwordEncryption';

export const userRoutes = async (fastify: FastifyInstance) => {
    fastify.route<{ Body: User }>({
        method: 'POST',
        url: '/',
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
}