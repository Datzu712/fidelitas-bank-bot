import { ClientModule } from '@nodecord/core';

import { AuthCategory } from './commands/auth/auth.category';
import { WalletCategory } from './commands/wallet/wallet.category';

@ClientModule({
    categories: [AuthCategory, WalletCategory],
})
export class Client {}
