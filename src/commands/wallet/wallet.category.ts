import { Category } from '@nodecord/core';
import { CheckWallets } from './commands/check-wallet';
import { CreateWallet } from './commands/create-wallet';
import { Loan } from './commands/loan';
import { Transaction } from './commands/transaction';

@Category({
    commands: [CheckWallets, CreateWallet, Loan, Transaction],
    metadata: {
        name: 'wallet',
    },
})
export class WalletCategory {}
