import { FastifyInstance } from 'fastify';
import { connection } from '../lib/connection';
import { comparePassword } from '../lib/passwordEncryption';
import { User } from '../entities/User';

export const authRoutes = async (fastify: FastifyInstance) => {
    fastify.route<{ Body: { username: string, password: string } }>({
        method: 'POST',
        url: '/',
        handler: async (req, res) => {
            const { username, password } = req.body;
            const user = await connection.getRepository(User).findOne({ username: username });
            if(user){
                if(await comparePassword(password, user.password)){
                    const token = fastify.jwt.sign({
                        id: user.id
                    },{
                        expiresIn: '1d'
                    });
                    res.status(200).send(token);
                    return;
                }
            }
            res.status(400).send('Invalid username or password');
        }
    });
}