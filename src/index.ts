import { NodecordClient } from '@nodecord/core';
import { Client } from './client.module';
import { config } from 'dotenv';
import { type ClientOptions, GatewayIntentBits, Partials } from 'discord.js';
import { resolve } from 'path';
import { connect } from './database/pg-connect';

config({ path: resolve(__dirname + '/../.env') });

(async function () {
    const { Guilds, MessageContent, GuildMessages, GuildMembers } = GatewayIntentBits;

    const bot = new NodecordClient<ClientOptions>(Client, {
        abortOnError: true,
        intents: [Guilds, MessageContent, GuildMessages, GuildMembers],
        partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User],
        prefix: ['!'],
    });

    await connect();
    await bot.loadSlashCommands({ token: process.env.BOT_TOKEN, clientId: process.env.CLIENT_ID });
    await bot.login(process.env.BOT_TOKEN);
})();
