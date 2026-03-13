import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Warehouse from './warehouse.model.js';

const Bin = sequelize.define('Bin', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    warehouse_id: {
        type: DataTypes.UUID,
        references: {
            model: Warehouse,
            key: 'id'
        }
    }
}, {
    timestamps: true,
    tableName: 'bins'
});

Warehouse.hasMany(Bin, { foreignKey: 'warehouse_id' });
Bin.belongsTo(Warehouse, { foreignKey: 'warehouse_id' });

export default Bin;
