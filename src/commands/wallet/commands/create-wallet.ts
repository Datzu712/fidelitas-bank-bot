import { Context, ICommand, SlashCommand } from '@nodecord/core';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type CommandInteraction,
    ComponentType,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    TextChannel,
} from 'discord.js';
import { user as userModel, wallet as walletModel } from '@/database/models/init-models';

@SlashCommand({
    name: 'create-wallet',
    options: new SlashCommandBuilder().setName('create-wallet').setDescription('Create a new wallet'),
    global: true,
})
export class CreateWallet implements ICommand {
    public async execute(@Context() interaction: CommandInteraction) {
        const user = await userModel.findByPk(interaction.user.id);
        if (!user?.verified)
            return void interaction.reply({ content: "Your account isn't validated yet.", ephemeral: true });

        if ((interaction.channel as TextChannel).parentId !== '1221982789336043570')
            return void interaction.reply({
                content: 'You can only create wallets in the bank channel.',
                ephemeral: true,
            });

        const walletTypeSelect = new StringSelectMenuBuilder()
            .setCustomId('wallet-type')
            .setPlaceholder('Select a wallet type')
            .addOptions([
                { label: 'Dolars ($)', value: 'dolars' },
                { label: 'Colones (₡)', value: 'colones' },
                { label: 'Euros (€)', value: 'euros' },
                { label: 'Yens (¥)', value: 'yens' },
            ]);

        const i = await interaction.reply({
            content: 'Select a wallet type',
            components: [
                new ActionRowBuilder().addComponents(walletTypeSelect) as ActionRowBuilder<StringSelectMenuBuilder>,
            ],
        });
        const res = await i.awaitMessageComponent({
            filter: (i) => {
                i.deferUpdate();
                return i.customId == 'wallet-type' && i.user.id == interaction.user.id;
            },
            componentType: ComponentType.StringSelect,
        });
        await i.edit({ components: [], content: `Selected type: ${res.values[0]}` });

        const msg = await interaction.channel!.send({
            content: 'Do you want to create a custom name for your wallet?',
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('yes').setLabel('Yes').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('no').setLabel('No').setStyle(ButtonStyle.Danger),
                ) as ActionRowBuilder<ButtonBuilder>,
            ],
        });
        // await walletModel.create({
        //     user_id: interaction.user.id,
        //     type: res.values[0],
        //     amount: 0,
        // });
        const response = await msg.awaitMessageComponent({
            filter: (i) => i.customId == 'yes' || i.customId == 'no',
            componentType: ComponentType.Button,
        });
        if (response.customId == 'yes') {
            await msg.edit({ content: 'Enter the name of your new wallet:', components: [] });

            const name = await interaction.channel!.awaitMessages({
                filter: (m) => m.author.id == interaction.user.id,
                max: 1,
            });
            await walletModel.create({
                user_id: interaction.user.id,
                type: res.values[0],
                amount: 0,
                name: name.first()?.content,
            });
        } else {
            await walletModel.create({
                user_id: interaction.user.id,
                type: res.values[0],
                amount: 0,
            });
        }
        await msg.edit({ content: 'Wallet created.', components: [] });
    }
}
