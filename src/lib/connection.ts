
import { createConnection, ConnectionOptions, getConnection, Connection } from 'typeorm';

const connectionOptions: ConnectionOptions = {
    type: "mysql",
    host: process.env.DB_URL,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [
       "dist/entities/**/*.js"
    ]
}

export const connect = async () => {
    await createConnection(connectionOptions);
    connection = getConnection();
}

export var connection : Connection = undefined!;