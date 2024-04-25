import { Context, ICommand, SlashCommand } from '@nodecord/core';
import {
    ActionRowBuilder,
    type CommandInteraction,
    ComponentType,
    EmbedBuilder,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    TextChannel,
} from 'discord.js';
import { user as userModel, wallet as walletModel } from '@/database/models/init-models';

@SlashCommand({
    name: 'loan',
    options: new SlashCommandBuilder().setName('loan').setDescription('Request a loan'),
    global: true,
})
export class Loan implements ICommand {
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
                i.deferUpdate();
                return i.customId == 'wallet-select' && i.user.id == interaction.user.id;
            },
            componentType: ComponentType.StringSelect,
        });
        const walletId = selectedWallet.values[0];
        if (!walletId) return;
        const walletData = wallets.find((w) => w.id == walletId)!;

        const msg = await reply.edit({
            content: 'Enter the amount of the loan',
            components: [],
            embeds: [
                new EmbedBuilder()
                    .setTitle('Wallet details')
                    .setDescription(`Wallet ID: ${walletId}`)
                    .setColor('Blue')
                    .setFooter({ text: 'Banco Fidelitas', iconURL: interaction.guild?.iconURL() as string })
                    .addFields([
                        {
                            name: 'Actual balance',
                            value: `${walletData.amount}`,
                            inline: true,
                        },
                        {
                            name: 'Type',
                            value: `${walletData.type}`,
                            inline: true,
                        },
                        {
                            name: 'Custom name',
                            value: `${walletData.name || 'No name'}`,
                            inline: true,
                        },
                    ]),
            ],
        });

        const amount = await msg.channel.awaitMessages({
            filter: (m) => m.author.id == interaction.user.id,
            max: 1,
            time: 600000,
        });
        if (!amount.size) return void msg.edit({ content: 'Time is up.', components: [] });

        const value = parseInt(amount.first()!.content);
        if (isNaN(value)) return void msg.edit({ content: 'Invalid amount.', components: [] });
        if (value < 0) return void msg.edit({ content: 'Amount must be positive.', components: [] });

        await walletModel.update({ amount: walletData.amount + value }, { where: { id: walletId } });

        await msg.edit({
            content: `Loan done. The actual balance of the wallet is \`${walletData.amount + value}\``,
            components: [],
            embeds: [],
        });
    }
}
