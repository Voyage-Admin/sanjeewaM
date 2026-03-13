import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Department from './department.model.js';

const SubDepartment = sequelize.define('SubDepartment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    department_id: {
        type: DataTypes.UUID,
        references: {
            model: Department,
            key: 'id'
        }
    }
}, {
    timestamps: true,
    tableName: 'sub_departments'
});

Department.hasMany(SubDepartment, { foreignKey: 'department_id' });
SubDepartment.belongsTo(Department, { foreignKey: 'department_id' });

export default SubDepartment;
