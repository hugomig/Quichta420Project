declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'test' | 'production',
            PORT: integer,
            DB_URL: string,
            DB_PORT: number,
            DB_USERNAME: string,
            DB_PASSWORD: string,
            DB_NAME: string,
            JWT_SECRET_KEY: string
        }
    }
}

export {}