import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Warehouse from './warehouse.model.js';

const Rack = sequelize.define('Rack', {
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
    tableName: 'racks'
});

Warehouse.hasMany(Rack, { foreignKey: 'warehouse_id' });
Rack.belongsTo(Warehouse, { foreignKey: 'warehouse_id' });

export default Rack;
