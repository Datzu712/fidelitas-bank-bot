import { ClientModule } from '@nodecord/core';

import { AuthCategory } from './commands/auth/auth.category';

@ClientModule({
    categories: [AuthCategory],
})
export class Client {}
