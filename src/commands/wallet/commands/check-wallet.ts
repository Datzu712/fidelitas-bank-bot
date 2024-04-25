import { Context, ICommand, SlashCommand } from '@nodecord/core';
import {
    ActionRowBuilder,
    type CommandInteraction,
    ComponentType,
    EmbedBuilder,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
} from 'discord.js';
import { wallet } from '@/database/models/wallet';

@SlashCommand({
    name: 'wallets',
    options: new SlashCommandBuilder().setName('wallets').setDescription('Check your actual wallets.'),
    global: true,
})
export class CheckWallets implements ICommand {
    public async execute(@Context() interaction: CommandInteraction) {
        const wallets = await wallet.findAll({ where: { user_id: interaction.user.id } });
        if (!wallets.length) return void interaction.reply({ content: 'You have no wallets.', ephemeral: true });

        const content = wallets
            .map((wallet, index) => `[${index + 1}]: ${wallet.name || wallet.id} (${wallet.type})`)
            .join('\n');

        const embed = new EmbedBuilder()
            .setTitle('Your wallets')
            .setDescription(content)
            .setColor('Blue')
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setFooter({ text: 'Banco Fidelitas', iconURL: interaction.guild?.iconURL() as string });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('wallets-select')
            .setPlaceholder('Select a wallet')
            .addOptions(wallets.map((wallet) => ({ label: `${wallet.name || wallet.id}`, value: wallet.id })));

        const res = await interaction.reply({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(selectMenu) as ActionRowBuilder<StringSelectMenuBuilder>],
        });

        const selectedWallet = await res.awaitMessageComponent({
            filter: (i) => {
                i.deferUpdate();
                return i.customId == 'wallets-select' && i.user.id == interaction.user.id;
            },
            componentType: ComponentType.StringSelect,
        });
        const walletId = selectedWallet.values[0];
        if (!walletId) return;

        await interaction.editReply({
            content: null,
            components: [],
            embeds: [
                new EmbedBuilder()
                    .setTitle('Wallet details')
                    .setDescription(`Wallet ID: ${walletId}`)
                    .setColor('Blue')
                    .setFooter({ text: 'Banco Fidelitas', iconURL: interaction.guild?.iconURL() as string })
                    .addFields([
                        {
                            name: 'Balance',
                            value: `${wallets.find((w) => w.id == walletId)?.amount}`,
                            inline: true,
                        },
                        {
                            name: 'Type',
                            value: `${wallets.find((w) => w.id == walletId)?.type}`,
                            inline: true,
                        },
                        {
                            name: 'Custom name',
                            value: `${wallets.find((w) => w.id == walletId)?.name || 'No name'}`,
                            inline: true,
                        },
                    ]),
            ],
        });
    }
}
