declare interface IEnvironmentVariables {
    PG_HOST: string;
    /**
     * Database port
     */
    PG_PORT: string;
    /**
     * Database user
     */
    PG_USER: string;
    /**
     * Database user's password
     */
    PG_PASSWORD: string;
    /**
     * Database name
     */
    PG_DB: string;

    BOT_TOKEN: string;

    CLIENT_ID: string;
}

declare namespace NodeJS {
    export interface ProcessEnv extends IEnvironmentVariables {
        TZ?: string | undefined;
    }
}
