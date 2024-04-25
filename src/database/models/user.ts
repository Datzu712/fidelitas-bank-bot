import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { wallet, walletId } from './wallet';

export interface userAttributes {
    email: string;
    verified: boolean;
    created_at?: Date;
    updated_at?: Date;
    id: string;
}

export type userPk = 'id';
export type userId = user[userPk];
export type userOptionalAttributes = 'created_at' | 'updated_at';
export type userCreationAttributes = Optional<userAttributes, userOptionalAttributes>;

export class user extends Model<userAttributes, userCreationAttributes> implements userAttributes {
    email!: string;
    verified!: boolean;
    created_at?: Date;
    updated_at?: Date;
    id!: string;

    // user hasMany wallet via user_id
    wallets!: wallet[];
    getWallets!: Sequelize.HasManyGetAssociationsMixin<wallet>;
    setWallets!: Sequelize.HasManySetAssociationsMixin<wallet, walletId>;
    addWallet!: Sequelize.HasManyAddAssociationMixin<wallet, walletId>;
    addWallets!: Sequelize.HasManyAddAssociationsMixin<wallet, walletId>;
    createWallet!: Sequelize.HasManyCreateAssociationMixin<wallet>;
    removeWallet!: Sequelize.HasManyRemoveAssociationMixin<wallet, walletId>;
    removeWallets!: Sequelize.HasManyRemoveAssociationsMixin<wallet, walletId>;
    hasWallet!: Sequelize.HasManyHasAssociationMixin<wallet, walletId>;
    hasWallets!: Sequelize.HasManyHasAssociationsMixin<wallet, walletId>;
    countWallets!: Sequelize.HasManyCountAssociationsMixin;

    static initModel(sequelize: Sequelize.Sequelize): typeof user {
        return user.init(
            {
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                verified: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                id: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    primaryKey: true,
                },
            },
            {
                sequelize,
                tableName: 'user',
                schema: 'public',
                timestamps: true,
                indexes: [
                    {
                        name: 'user_pk',
                        unique: true,
                        fields: [{ name: 'id' }],
                    },
                ],
            },
        );
    }
}
