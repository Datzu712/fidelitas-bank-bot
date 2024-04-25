import type { Sequelize } from 'sequelize';
import { user as _user } from './user';
import type { userAttributes, userCreationAttributes } from './user';
import { wallet as _wallet } from './wallet';
import type { walletAttributes, walletCreationAttributes } from './wallet';

export { _user as user, _wallet as wallet };

export type { userAttributes, userCreationAttributes, walletAttributes, walletCreationAttributes };

export function initModels(sequelize: Sequelize) {
    const user = _user.initModel(sequelize);
    const wallet = _wallet.initModel(sequelize);

    wallet.belongsTo(user, { as: 'user', foreignKey: 'user_id' });
    user.hasMany(wallet, { as: 'wallets', foreignKey: 'user_id' });

    return {
        user: user,
        wallet: wallet,
    };
}
