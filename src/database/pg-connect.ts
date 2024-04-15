import { Sequelize } from 'sequelize';
import { Logger } from '@nodecord/core';
import { initModels } from './models/init-models';

export async function connect() {
    const logger = new Logger('PG');

    const sequelize = new Sequelize({
        dialect: 'postgres',
        host: 'localhost',
        username: 'root',
        password: 'root',
        database: 'bot',
        logging: (msg) => logger.debug(msg),
        define: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    });

    try {
        await sequelize.authenticate();
        initModels(sequelize);
        logger.log('Connection has been established successfully.');
    } catch (error) {
        logger.error('Unable to connect to the database:');
    }
    return sequelize;
}
