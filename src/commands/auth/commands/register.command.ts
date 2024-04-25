import { Context, ICommand, SlashCommand } from '@nodecord/core';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    type CommandInteraction,
    ComponentType,
    EmbedBuilder,
    ModalBuilder,
    SlashCommandBuilder,
    TextChannel,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import { user } from '@/database/models/user';

@SlashCommand({
    name: 'register',
    options: new SlashCommandBuilder().setName('register').setDescription('Register to our system.'),
    global: true,
})
export class RegisterCommand implements ICommand {
    public async execute(@Context() interaction: CommandInteraction) {
        const data = await user.findByPk(interaction.user.id);
        if (data) return void interaction.reply({ content: 'You are already registered!', ephemeral: true });

        const modal = new ModalBuilder().setCustomId('register-modal').setTitle('Register to our system.');

        const emailInput = new TextInputBuilder()
            .setCustomId('email')
            .setLabel('What is your email?')
            .setStyle(TextInputStyle.Short);

        const ageInput = new TextInputBuilder()
            .setCustomId('age')
            .setLabel('what is your age?')
            .setStyle(TextInputStyle.Short);

        const extraInput = new TextInputBuilder()
            .setCustomId('extra')
            .setLabel('Why do you want to join us?')
            .setStyle(TextInputStyle.Paragraph);

        const firstActionRow = new ActionRowBuilder().addComponents(emailInput) as ActionRowBuilder<TextInputBuilder>;
        const secondActionRow = new ActionRowBuilder().addComponents(ageInput) as ActionRowBuilder<TextInputBuilder>;
        const thirdActionRow = new ActionRowBuilder().addComponents(extraInput) as ActionRowBuilder<TextInputBuilder>;

        // Add inputs to the modal
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
        // Show the modal to the user
        await interaction.showModal(modal);
        const submit = await interaction
            .awaitModalSubmit({
                filter: (i) => {
                    return i.customId == 'register-modal';
                },
                time: 90000,
            })
            .catch(() => null);
        if (!submit) return;

        const age = parseInt(submit.fields.getField('age').value) || 0;
        if (!isNaN(age) && age < 18) {
            return submit.reply({
                content: 'You must be 18 years old to register!',
                ephemeral: true,
            });
        }

        await submit.reply({
            ephemeral: true,
            content: 'Your request has been sent to the staff!',
        });
        const newUser = await user.create({
            email: submit.fields.getField('email').value,
            verified: false,
            id: interaction.user.id,
        });

        const confirm = new ButtonBuilder().setCustomId('confirm').setLabel('Accept').setStyle(ButtonStyle.Success);
        const deny = new ButtonBuilder().setCustomId('cancel').setLabel('Deny').setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(deny, confirm);

        const channel = (await interaction.guild?.channels.fetch('1221983086494093382')) as TextChannel;
        const message = await channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`New user registered: ${interaction.user.tag}`)
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                    .addFields(
                        { value: submit.fields.getField('email').value, name: 'Email', inline: true },
                        { value: `${age}`, name: 'Age', inline: true },
                        { value: submit.fields.getField('extra').value, name: 'Reason' },
                    )
                    .setColor('Blue')
                    .setFooter({ text: 'Banco Fidelitas', iconURL: interaction.guild?.iconURL() as string }),
            ],
            components: [row as ActionRowBuilder<ButtonBuilder>],
        });

        const response = await message.awaitMessageComponent({
            filter: (i) => i.customId == 'confirm' || i.customId == 'cancel',
            componentType: ComponentType.Button,
        });
        if (response.customId == 'confirm') {
            await user.update({ verified: true }, { where: { id: interaction.user.id } });
            await message.edit({ content: 'User accepted!', components: [], embeds: [] });
        } else {
            await newUser.destroy();
            await message.edit({ content: 'User denied!', components: [], embeds: [] });
        }

        await (interaction.channel as TextChannel).permissionOverwrites.create(interaction.user.id, {
            ViewChannel: false,
        });
        const newChannel = await interaction.guild?.channels.create({
            parent: '1221982789336043570',
            name: `${interaction.user.globalName} space`,
            type: ChannelType.GuildText,
            topic: `This is the space for ${interaction.user.globalName} to talk with me!`,
            permissionOverwrites: [
                {
                    id: interaction.user.id,
                    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'UseApplicationCommands'],
                },
                {
                    id: interaction.guild?.id as string,
                    deny: ['ViewChannel'],
                },
            ],
        });
        await newChannel?.send({
            content: `Welcome ${interaction.user.globalName}, I'm here to help you!`,
        });
    }
}
