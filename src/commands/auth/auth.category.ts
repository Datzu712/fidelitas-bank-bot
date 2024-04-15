import { Category } from '@nodecord/core';

import { RegisterCommand } from './commands/register.command';

@Category({
    metadata: {
        name: 'register',
    },
    commands: [RegisterCommand],
})
export class AuthCategory {}
