import { NodecordClient } from '@nodecord/core';
import { Client } from './client.module';
import { config } from 'dotenv';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ClientOptions,
    type Client as djsClient,
    EmbedBuilder,
    Events,
    GatewayIntentBits,
    Partials,
    type TextChannel,
} from 'discord.js';
import { resolve } from 'path';
import { connect } from './database/pg-connect';
import { user } from './database/models/user';

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
    // await bot.loadSlashCommands({ token: process.env.BOT_TOKEN, clientId: process.env.CLIENT_ID });
    await bot.login(process.env.BOT_TOKEN);

    // @ts-expect-error library is missing a function to get the client instance
    (bot.adapter.clientInstance as djsClient).on(Events.InteractionCreate, async (interaction) => {
        if (interaction.isModalSubmit() && interaction.customId == 'register-modal') {
            const age = parseInt(interaction.fields.getField('age').value) || 0;
            if (!isNaN(age) && age < 18) {
                return interaction.reply({
                    content: 'You must be 18 years old to register!',
                    ephemeral: true,
                });
            }
            await user.create({
                email: interaction.fields.getField('email').value,
                verified: false,
                id: interaction.user.id,
            });

            interaction.reply({
                content: 'You have been registered! Please wait for a staff member to verify your account.',
                ephemeral: true,
            });

            const confirm = new ButtonBuilder().setCustomId('confirm').setLabel('Accept').setStyle(ButtonStyle.Danger);
            const deny = new ButtonBuilder().setCustomId('cancel').setLabel('Deny').setStyle(ButtonStyle.Success);
            const row = new ActionRowBuilder().addComponents(deny, confirm);

            const channel = (await interaction.guild?.channels.fetch('1221983086494093382')) as TextChannel;
            channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`New user registered: ${interaction.user.tag}`)
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                        .addFields(
                            { value: interaction.fields.getField('email').value, name: 'Email', inline: true },
                            { value: `${age}`, name: 'Age', inline: true },
                            { value: interaction.fields.getField('extra').value, name: 'Reason' },
                        )
                        .setColor('Blue')
                        .setFooter({ text: 'Banco Fidelitas', iconURL: interaction.guild?.iconURL() as string }),
                ],
                components: [row as any],
            });
        }
    });
})();
