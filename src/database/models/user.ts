import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

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
