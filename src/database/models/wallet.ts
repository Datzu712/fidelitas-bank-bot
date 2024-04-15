import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface walletAttributes {
    id: string;
    amount: number;
    type?: string;
    user_id: number;
}

export type walletPk = 'id' | 'user_id';
export type walletId = wallet[walletPk];
export type walletOptionalAttributes = 'id' | 'amount' | 'type';
export type walletCreationAttributes = Optional<walletAttributes, walletOptionalAttributes>;

export class wallet extends Model<walletAttributes, walletCreationAttributes> implements walletAttributes {
    id!: string;
    amount!: number;
    type?: string;
    user_id!: number;

    static initModel(sequelize: Sequelize.Sequelize): typeof wallet {
        return wallet.init(
            {
                id: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                amount: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
                type: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                user_id: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    primaryKey: true,
                },
            },
            {
                sequelize,
                tableName: 'wallet',
                schema: 'public',
                timestamps: false,
                indexes: [
                    {
                        name: 'wallet_pk',
                        unique: true,
                        fields: [{ name: 'id' }, { name: 'user_id' }],
                    },
                ],
            },
        );
    }
}
