import * as dotenv from 'dotenv';
dotenv.config();
import { fastify } from './lib/fastify';
import { connect } from './lib/connection';

const start = async () => {
    try {
        await connect();
        console.log('Connected successfully to the database');
        try {
            console.log(`Running on port ${process.env.PORT} ...`);
            await fastify.listen(process.env.PORT);
        }
        catch(err){
            console.error("Problem with fastify app listening");
            console.error(err);
            process.exit(1);
        }
    }
    catch(err){
        console.error("Failed to connect to the database")
        console.error(err);
    }
}

start();