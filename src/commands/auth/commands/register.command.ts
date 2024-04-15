import { Context, ICommand, SlashCommand } from '@nodecord/core';
import {
    ActionRowBuilder,
    type CommandInteraction,
    ModalBuilder,
    SlashCommandBuilder,
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
    }
}
