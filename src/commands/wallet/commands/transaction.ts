import { Context, ICommand, SlashCommand } from '@nodecord/core';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type CommandInteraction,
    ComponentType,
    EmbedBuilder,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    TextChannel,
} from 'discord.js';
import { user as userModel, wallet as walletModel } from '@/database/models/init-models';

/*
    This code was write very fast so it may contain some bad practices.
*/
@SlashCommand({
    name: 'transaction',
    options: new SlashCommandBuilder().setName('transaction').setDescription('Make a transaction'),
    global: true,
})
export class Transaction implements ICommand {
    public async execute(@Context() interaction: CommandInteraction) {
        const user = await userModel.findByPk(interaction.user.id);
        if (!user?.verified)
            return void interaction.reply({ content: "Your account isn't validated yet.", ephemeral: true });

        if ((interaction.channel as TextChannel).parentId !== '1221982789336043570')
            return void interaction.reply({
                content: 'You can only create wallets in the bank channel.',
                ephemeral: true,
            });
        const wallets = await user.getWallets();
        if (!wallets.length) return void interaction.reply({ content: 'You have no wallets.', ephemeral: true });

        const reply = await interaction.reply({
            content: 'Select a wallet',
            components: [
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('wallet-select')
                        .setPlaceholder('Select a wallet')
                        .addOptions(
                            wallets.map((wallet) => ({ label: `${wallet.name || wallet.id}`, value: wallet.id })),
                        ),
                ) as ActionRowBuilder<StringSelectMenuBuilder>,
            ],
        });

        const selectedWallet = await reply.awaitMessageComponent({
            filter: (i) => {
                return i.customId == 'wallet-select' && i.user.id == interaction.user.id;
            },
            componentType: ComponentType.StringSelect,
        });
        const originalWalletId = selectedWallet.values[0];
        const walletData = wallets.find((w) => w.id == originalWalletId);
        if (!walletData) return;

        if (walletData.amount <= 0) {
            return void interaction.reply({ content: "You don't have money in that wallet", ephemeral: true });
        }
        await selectedWallet.deferUpdate();
        const msg = await reply.edit({
            content: 'Enter the amount of the loan',
            components: [],
            embeds: [
                new EmbedBuilder()
                    .setTitle('Loan request')
                    .setDescription(`Wallet ID: ${originalWalletId}`)
                    .setColor('Blue')
                    .setFooter({ text: 'Banco Fidelitas', iconURL: interaction.guild?.iconURL() as string }),
            ],
        });

        const response = await msg.channel.awaitMessages({
            filter: (msg) => msg.author.id == interaction.user.id,
            max: 1,
        });
        const amount = parseInt(response.first()?.content as string);

        if (isNaN(amount)) {
            return void interaction.reply({ content: 'Invalid amount.', ephemeral: true });
        }

        const msg2 = await response.first()!.reply({
            content: 'Write the target wallet ID',
            components: [],
            embeds: [],
        });
        const targetWalletRes = await msg2.channel.awaitMessages({
            filter: (msg) => msg.author.id == interaction.user.id,
            max: 1,
        });
        const targetWalletId = targetWalletRes.first()?.content;
        if (targetWalletId === originalWalletId) {
            return void msg2.edit({ content: 'You cannot send money to the same wallet.' });
        }
        const targetWallet = await walletModel.findByPk(targetWalletId);
        if (!targetWallet) {
            return void msg2.edit({ content: 'Invalid wallet ID.' });
        }
        const targetUser = await interaction.client.users.fetch(targetWallet.user_id);
        const msg3 = await msg2.channel.send({
            content: `Do you want to send ${amount} to ${targetUser.tag}?`,
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('yes').setLabel('Yes').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('no').setLabel('No').setStyle(ButtonStyle.Danger),
                ) as ActionRowBuilder<ButtonBuilder>,
            ],
        });
        const response2 = await msg3.awaitMessageComponent({
            filter: (i) => i.customId == 'yes' || i.customId == 'no',
            componentType: ComponentType.Button,
        });
        if (response2.customId == 'no') {
            return void msg3.edit({ content: 'Transaction canceled.', components: [] });
        }

        await walletModel.update({ amount: walletData.amount - amount }, { where: { id: originalWalletId } });
        await walletModel.update({ amount: targetWallet.amount + amount }, { where: { id: targetWalletId } });

        await msg2.channel.send({
            content: 'Transaction done.',
            components: [],
            embeds: [],
        });
    }
}
